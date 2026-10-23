'use strict';

/**
 * Núcleo do Fox2Txt: executa o Visual FoxPro 9 em modo CLI para extrair
 * o código-fonte de um formulário (.scx) e devolve texto.
 */

const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { loadConfig, getConfigPath } = require('./config');
const { buildLayout } = require('./layout');

const EXTRACTOR = path.join(__dirname, 'vfp', 'extractor.prg');
const RUNTIME_DIR = path.join(os.tmpdir(), 'fox2txt');
const JOBS_DIR = path.join(RUNTIME_DIR, 'jobs');
const VFP_CONFIG_FILE = path.join(RUNTIME_DIR, 'config.fpw');
// O VFP compila o .prg ao lado do fonte; usar uma cópia em %TEMP% evita
// gravar .FXP dentro do projeto (e funciona com o projeto somente leitura).
const RUNTIME_EXTRACTOR = path.join(RUNTIME_DIR, 'extractor.prg');

const MODES = new Set(['classbrowser', 'scctext']);

function isFile(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

/**
 * Caminho efetivo do vfp9.exe: variável de ambiente > configuração > instalações padrão.
 */
function getVfpPath() {
  const config = loadConfig();
  const candidates = [
    process.env.FOX2TXT_VFP,
    config.vfpPath,
    'C:\\Program Files (x86)\\Microsoft Visual FoxPro 9\\vfp9.exe',
    'C:\\Program Files\\Microsoft Visual FoxPro 9\\vfp9.exe',
  ].filter(Boolean);
  return candidates.find(isFile) || null;
}

function getTimeoutMs(override) {
  const env = Number(process.env.FOX2TXT_TIMEOUT_MS);
  const config = loadConfig();
  const value =
    Number(override) > 0
      ? Number(override)
      : Number.isFinite(env) && env > 0
        ? env
        : config.timeoutMs;
  return Number.isFinite(value) && value >= 1000 ? Math.min(value, 600000) : 60000;
}

function isKeepJobs() {
  return process.env.FOX2TXT_KEEP === '1' || loadConfig().keepJobs;
}

let queueTail = Promise.resolve();
let busy = false;
let lastJob = null;

class ExtractionError extends Error {
  constructor(message, code = 'EXTRACTION_FAILED', details = {}) {
    super(message);
    this.name = 'ExtractionError';
    this.code = code;
    this.details = details;
  }
}

function ensureRuntime() {
  fs.mkdirSync(JOBS_DIR, { recursive: true });

  if (!getVfpPath()) {
    return;
  }

  if (!fs.existsSync(EXTRACTOR)) {
    return;
  }

  const source = fs.readFileSync(EXTRACTOR);
  const currentSource = fs.existsSync(RUNTIME_EXTRACTOR)
    ? fs.readFileSync(RUNTIME_EXTRACTOR)
    : null;
  if (!currentSource || !source.equals(currentSource)) {
    fs.writeFileSync(RUNTIME_EXTRACTOR, source);
  }

  const fpw = [
    `COMMAND = DO ("${RUNTIME_EXTRACTOR}")`,
    'RESOURCE = OFF',
    '',
  ].join('\r\n');

  const currentFpw = fs.existsSync(VFP_CONFIG_FILE)
    ? fs.readFileSync(VFP_CONFIG_FILE, 'latin1')
    : '';
  if (currentFpw !== fpw) {
    fs.writeFileSync(VFP_CONFIG_FILE, fpw, 'latin1');
  }
}

/**
 * O Class Browser gera um preâmbulo executável (PUBLIC/NEWOBJECT/Show) que
 * aponta para uma classe temporária. Para alimentar o Gemini, interessa o
 * bloco DEFINE CLASS; o preâmbulo só adiciona ruído.
 */
function stripRunnablePreamble(text) {
  const marker = text.indexOf('*-- Form:');
  if (marker > 0) {
    const start = text.lastIndexOf('****', marker);
    if (start >= 0) return text.slice(start);
  }
  return text;
}

/**
 * Remove caminhos da pasta temporária do Fox2Txt dos comentários do cabeçalho
 * (o Class Browser grava o caminho de onde abriu o .scx e a classe pai).
 */
function stripJobPaths(text) {
  return text.replace(/\s*\([^)\r\n]*\\fox2txt\\[^)\r\n]*\)/gi, '');
}

function parseStatus(text) {
  const result = {};
  for (const line of String(text).split(/\r?\n/)) {
    const sep = line.indexOf('=');
    if (sep > 0) {
      result[line.slice(0, sep).trim()] = line.slice(sep + 1);
    }
  }
  return result;
}

function runVfp(jobDir, timeoutMs, vfpExe) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const child = spawn(vfpExe, ['-t', `-c${VFP_CONFIG_FILE}`], {
      cwd: jobDir,
      env: { ...process.env, FOX2TXT_JOB: jobDir },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    child.stdout.on('data', (chunk) => {
      stdout = (stdout + chunk.toString('latin1')).slice(-4000);
    });
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk.toString('latin1')).slice(-4000);
    });

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      // /T mata a árvore: o VFP pode abrir janelas/processos auxiliares
      spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true });
      reject(
        new ExtractionError(
          `O Visual FoxPro não respondeu em ${Math.round(timeoutMs / 1000)}s. ` +
            'Verifique se há um diálogo aberto na área de trabalho.',
          'VFP_TIMEOUT',
          { stdout, stderr },
        ),
      );
    }, timeoutMs);

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new ExtractionError(`Falha ao iniciar o VFP: ${err.message}`, 'VFP_SPAWN_FAILED'));
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr, ms: Date.now() - started });
    });
  });
}

async function readStatus(jobDir) {
  const file = path.join(jobDir, 'status.txt');
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      return parseStatus(await fsp.readFile(file, 'utf8'));
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return null;
}

/**
 * Extrai o código de um formulário.
 *
 * @param {object} input
 * @param {string} input.fileName nome original (apenas informativo)
 * @param {Buffer} input.scx conteúdo do .scx
 * @param {Buffer} [input.sct] conteúdo do .sct (memo)
 * @param {'classbrowser'|'scctext'} [input.mode]
 * @param {number} [input.timeoutMs]
 */
async function extract(input) {
  const fileName = String(input.fileName || 'form.scx');
  const mode = String(input.mode || loadConfig().defaultMode || 'classbrowser').toLowerCase();
  const scx = input.scx;
  const sct = input.sct;
  const timeoutMs = getTimeoutMs(input.timeoutMs);
  const vfpExe = getVfpPath();

  if (!vfpExe) {
    throw new ExtractionError(
      'Visual FoxPro 9 não encontrado. Defina o caminho do vfp9.exe nas configurações do Fox2Txt ' +
        '(ou na variável FOX2TXT_VFP).',
      'VFP_NOT_FOUND',
    );
  }
  if (!fs.existsSync(EXTRACTOR)) {
    throw new ExtractionError(`Extrator ausente: ${EXTRACTOR}`, 'EXTRACTOR_NOT_FOUND');
  }
  if (!MODES.has(mode)) {
    throw new ExtractionError(`Modo inválido: ${mode}`, 'INVALID_MODE');
  }
  if (!Buffer.isBuffer(scx) || scx.length < 32) {
    throw new ExtractionError('Arquivo .scx vazio ou inválido.', 'INVALID_SCX');
  }
  if (!Buffer.isBuffer(sct) || sct.length === 0) {
    throw new ExtractionError(
      'O arquivo .sct (memo do formulário) é obrigatório. ' +
        'Selecione a pasta que contém o .scx e o .sct juntos.',
      'MISSING_SCT',
    );
  }

  ensureRuntime();

  const jobDir = await fsp.mkdtemp(path.join(JOBS_DIR, 'job-'));
  const started = Date.now();
  lastJob = jobDir;

  try {
    await fsp.writeFile(path.join(jobDir, 'form.scx'), scx);
    if (Buffer.isBuffer(sct) && sct.length > 0) {
      await fsp.writeFile(path.join(jobDir, 'form.sct'), sct);
    }
    await fsp.writeFile(path.join(jobDir, 'mode.txt'), mode, 'latin1');

    const run = await runVfp(jobDir, timeoutMs, vfpExe);
    const status = await readStatus(jobDir);

    if (!status) {
      throw new ExtractionError(
        'O VFP encerrou sem gerar status (possível erro ou diálogo modal).',
        'NO_STATUS',
        { exitCode: run.code, stdout: run.stdout, stderr: run.stderr },
      );
    }
    if (status.ok !== '1') {
      throw new ExtractionError(
        status.error || 'A extração falhou.',
        'VFP_ERROR',
        { status, exitCode: run.code, stdout: run.stdout, stderr: run.stderr },
      );
    }

    const raw = await fsp.readFile(path.join(jobDir, 'out.txt'));
    // O VFP grava na code page ANSI do sistema (cp1252 em pt-BR/en-US)
    let text = new TextDecoder('windows-1252').decode(raw);
    const usedMode = status.mode || mode;
    if (usedMode === 'classbrowser' && input.includePreamble !== true) {
      text = stripRunnablePreamble(text);
    }
    text = stripJobPaths(text);
    if (!text.trim()) {
      throw new ExtractionError('A extração gerou texto vazio.', 'EMPTY_OUTPUT');
    }

    // Layout: no modo SCCTEXT o próprio out.txt já é o dump; no Class Browser
    // o VFP grava um layout.txt separado. Falhas aqui não invalidam o texto.
    let layout = null;
    const layoutFile = usedMode === 'scctext' ? 'out.txt' : 'layout.txt';
    const layoutPath = path.join(jobDir, layoutFile);
    try {
      if (fs.existsSync(layoutPath)) {
        const layoutRaw =
          layoutFile === 'out.txt' ? raw : await fsp.readFile(layoutPath);
        const parsed = buildLayout(new TextDecoder('windows-1252').decode(layoutRaw));
        if (parsed && parsed.objects.length > 0) layout = parsed;
      }
    } catch {
      layout = null;
    }

    return {
      ok: true,
      text,
      layout,
      stats: {
        fileName,
        mode: usedMode,
        bytes: raw.length,
        chars: text.length,
        lines: Number(status.lines || 0),
        layout: layout
          ? layout.objects.filter((object) => object.class !== 'form').length
          : 0,
        vfpMs: Number(status.ms || 0),
        totalMs: Date.now() - started,
      },
    };
  } finally {
    if (!isKeepJobs()) {
      await fsp.rm(jobDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

function enqueue(task) {
  const run = queueTail.then(async () => {
    busy = true;
    try {
      return await task();
    } finally {
      busy = false;
    }
  });
  queueTail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function getHealth() {
  const vfp = getVfpPath();
  const config = loadConfig();
  return {
    ok: Boolean(vfp && fs.existsSync(EXTRACTOR)),
    service: 'fox2txt',
    version: require('./package.json').version,
    vfp,
    settingsFile: getConfigPath(),
    extractor: fs.existsSync(EXTRACTOR) ? EXTRACTOR : null,
    runtimeExtractor: fs.existsSync(RUNTIME_EXTRACTOR) ? RUNTIME_EXTRACTOR : null,
    busy,
    modes: [...MODES],
    defaultMode: config.defaultMode,
    keepJobs: isKeepJobs(),
    lastJob: isKeepJobs() ? lastJob : undefined,
  };
}

module.exports = {
  extract,
  enqueue,
  getHealth,
  ensureRuntime,
  getVfpPath,
  getTimeoutMs,
  ExtractionError,
  EXTRACTOR,
  VFP_CONFIG_FILE,
  JOBS_DIR,
  RUNTIME_DIR,
};

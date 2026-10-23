'use strict';

/**
 * Núcleo do Fox2Txt: executa o Visual FoxPro 9 em modo CLI para extrair
 * o código-fonte de um formulário (.scx) e devolve texto.
 */

const fs = require('fs');
const fsp = fs.promises;
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { loadConfig, getConfigPath } = require('./config');
const { buildLayout } = require('./layout');
const { createZip } = require('./zip');

const EXTRACTOR = path.join(__dirname, 'vfp', 'extractor.prg');
const FB2P_WRAPPER = path.join(__dirname, 'vfp', 'fb2p.prg');
const FB2P_VENDOR = path.join(__dirname, 'vendor', 'foxbin2prg');
const RUNTIME_DIR = path.join(os.tmpdir(), 'fox2txt');
const JOBS_DIR = path.join(RUNTIME_DIR, 'jobs');
const VFP_CONFIG_FILE = path.join(RUNTIME_DIR, 'config.fpw');
const VFP_CONFIG_FB2P = path.join(RUNTIME_DIR, 'config-fb2p.fpw');
// O VFP compila o .prg ao lado do fonte; usar uma cópia em %TEMP% evita
// gravar .FXP dentro do projeto (e funciona com o projeto somente leitura).
const RUNTIME_EXTRACTOR = path.join(RUNTIME_DIR, 'extractor.prg');
const RUNTIME_FB2P_WRAPPER = path.join(RUNTIME_DIR, 'fb2p.prg');
const RUNTIME_FB2P = path.join(RUNTIME_DIR, 'foxbin2prg');
const FB2P_VERSION = '1.21.05';
const FB2P_MARKER = path.join(RUNTIME_FB2P, '.fox2txt-vendor');

// No VFP 9 RTM (build 2412) o FoxBin2Prg oficial recusa a execução por não
// encontrar o SP1. O código usado nas conversões de SCX não depende de SP1
// (round-trip validado); a cópia em %TEMP% recebe apenas a troca do limite.
const FB2P_VERSION_GUARD = ') < 3504';
const FB2P_VERSION_GUARD_RTM = ') < 0';

const MODES = new Set(['classbrowser', 'scctext', 'foxbin2prg']);

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

function sha1(buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

function fileSignature(file) {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile()) return null;
    return `${path.basename(file)}:${stat.size}:${sha1(fs.readFileSync(file))}`;
  } catch {
    return null;
  }
}

function isFoxBin2PrgAvailable() {
  return Boolean(
    fs.existsSync(path.join(FB2P_VENDOR, 'foxbin2prg.prg')) &&
      fs.existsSync(path.join(FB2P_VENDOR, 'props_all.txt')) &&
      fs.existsSync(FB2P_WRAPPER),
  );
}

let fb2pRuntimeSignature = null;
let fb2pPatched = false;

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const name of fs.readdirSync(source)) {
    const from = path.join(source, name);
    const to = path.join(target, name);
    if (fs.statSync(from).isDirectory()) {
      copyDirectory(from, to);
    } else {
      fs.writeFileSync(to, fs.readFileSync(from));
    }
  }
}

/**
 * Copia o FoxBin2Prg para %TEMP% e aplica o ajuste de compatibilidade com
 * VFP 9 RTM. O arquivo em server/vendor permanece intacto.
 */
function installFoxBin2Prg() {
  if (!isFoxBin2PrgAvailable()) return false;

  const signature = [
    FB2P_VERSION,
    fileSignature(path.join(FB2P_VENDOR, 'foxbin2prg.prg')),
    fileSignature(path.join(FB2P_VENDOR, 'props_all.txt')),
    fileSignature(path.join(FB2P_VENDOR, 'foxbin2prg_keywords.dbf')),
  ].join('|');

  if (
    fb2pRuntimeSignature === signature &&
    fs.existsSync(FB2P_MARKER) &&
    fs.existsSync(path.join(RUNTIME_FB2P, 'foxbin2prg.prg')) &&
    fs.existsSync(path.join(RUNTIME_FB2P, 'props_all.txt'))
  ) {
    fb2pPatched = true;
    return true;
  }

  const marker = fs.existsSync(FB2P_MARKER)
    ? fs.readFileSync(FB2P_MARKER, 'utf8').trim()
    : '';
  if (marker !== signature || !fs.existsSync(path.join(RUNTIME_FB2P, 'foxbin2prg.prg'))) {
    fs.rmSync(RUNTIME_FB2P, { recursive: true, force: true });
    fs.mkdirSync(RUNTIME_FB2P, { recursive: true });
    copyDirectory(FB2P_VENDOR, RUNTIME_FB2P);
  }

  const prg = path.join(RUNTIME_FB2P, 'foxbin2prg.prg');
  let source = fs.readFileSync(prg, 'latin1');
  if (source.includes(FB2P_VERSION_GUARD)) {
    source = source.replace(FB2P_VERSION_GUARD, FB2P_VERSION_GUARD_RTM);
    fs.writeFileSync(prg, source, 'latin1');
    fb2pPatched = true;
  } else {
    // Já ajustado ou versão com outro formato de checagem; não falha aqui.
    fb2pPatched = source.includes(FB2P_VERSION_GUARD_RTM);
  }

  const config = [
    '* Fox2Txt - round-trip .scx/.sct <-> .sc2',
    'ClearUniqueID: 0',
    'NoTimestamps: 0',
    'ShowProgressbar: 0',
    'DontShowErrors: 1',
    'ExtraBackupLevels: 0',
    'SCX_Conversion_Support: 2',
    'VCX_Conversion_Support: 2',
    'UseClassPerFile: 0',
    'UseFormPerFile: 0',
    'UseFormSettings: 0',
    '',
  ].join('\r\n');
  fs.writeFileSync(path.join(RUNTIME_FB2P, 'foxbin2prg.cfg'), config, 'latin1');

  if (fs.existsSync(FB2P_WRAPPER)) {
    const wrapper = fs.readFileSync(FB2P_WRAPPER);
    const current = fs.existsSync(RUNTIME_FB2P_WRAPPER)
      ? fs.readFileSync(RUNTIME_FB2P_WRAPPER)
      : null;
    if (!current || !wrapper.equals(current)) {
      fs.writeFileSync(RUNTIME_FB2P_WRAPPER, wrapper);
    }
  }

  fs.writeFileSync(
    VFP_CONFIG_FB2P,
    [
      `COMMAND = DO ("${RUNTIME_FB2P_WRAPPER}")`,
      'RESOURCE = OFF',
      '',
    ].join('\r\n'),
    'latin1',
  );

  fs.writeFileSync(FB2P_MARKER, signature, 'utf8');
  fb2pRuntimeSignature = signature;
  return true;
}

const CP1252_EXTRA = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

/**
 * Texto editado chega em UTF-8/JS; o VFP e o FoxBin2Prg usam cp1252.
 * Caracteres fora da cp1252 são rejeitados para não gravar dados corrompidos.
 */
function encodeCp1252(text) {
  const normalized = String(text)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n/g, '\r\n');
  const bytes = Buffer.alloc(normalized.length);
  let offset = 0;
  for (const char of normalized) {
    const code = char.codePointAt(0);
    let byte;
    if (code < 0x80 || (code >= 0xa0 && code <= 0xff)) {
      byte = code;
    } else if (CP1252_EXTRA.has(code)) {
      byte = CP1252_EXTRA.get(code);
    } else {
      throw new ExtractionError(
        `O texto contém o caractere "${char}" (U+${code
          .toString(16)
          .toUpperCase()
          .padStart(4, '0')}), que não existe no cp1252 usado pelo VFP. ` +
          'Remova ou substitua esse caractere antes de recompilar.',
        'TEXT_ENCODING',
      );
    }
    bytes[offset] = byte;
    offset += 1;
  }
  return bytes.subarray(0, offset);
}

function normalizeSc2(text) {
  return String(text)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith('*< FOXBIN2PRG:'))
    .map((line) =>
      line.replace(/_memberdata\s*=\s*"<VFPData><\/VFPData>"/, '_memberdata = '),
    );
}

function compareSc2(left, right) {
  const counts = new Map();
  for (const line of normalizeSc2(left)) {
    counts.set(line, (counts.get(line) || 0) + 1);
  }
  let added = 0;
  let removed = 0;
  const sample = [];
  for (const line of normalizeSc2(right)) {
    const count = counts.get(line) || 0;
    if (count > 0) {
      counts.set(line, count - 1);
    } else {
      added += 1;
      if (sample.length < 8) sample.push(`+ ${line.slice(0, 200)}`);
    }
  }
  for (const [line, count] of counts) {
    if (count > 0) {
      removed += count;
      if (sample.length < 8) sample.push(`- ${line.slice(0, 200)}`);
    }
  }
  return { identical: added === 0 && removed === 0, added, removed, sample };
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

  try {
    installFoxBin2Prg();
  } catch {
    // O modo round-trip valida e reporta a falha; a extração normal não deve
    // deixar de funcionar por causa do runtime opcional.
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

function runVfp(jobDir, timeoutMs, vfpExe, options = {}) {
  const configFile = options.configFile || VFP_CONFIG_FILE;
  const extraEnv = options.env || {};
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const child = spawn(vfpExe, ['-t', `-c${configFile}`], {
      cwd: jobDir,
      env: {
        ...process.env,
        FOX2TXT_JOB: jobDir,
        FOX2TXT_FB2P: RUNTIME_FB2P,
        ...extraEnv,
      },
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
 * @param {'classbrowser'|'scctext'|'foxbin2prg'} [input.mode]
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

  let fb2pReady = true;
  if (mode === 'foxbin2prg') {
    try {
      fb2pReady = installFoxBin2Prg();
    } catch {
      fb2pReady = false;
    }
  }
  if (mode === 'foxbin2prg' && !fb2pReady) {
    throw new ExtractionError(
      'O runtime do FoxBin2Prg não está disponível. Verifique a pasta server/vendor/foxbin2prg.',
      'FOXBIN2PRG_NOT_FOUND',
    );
  }

  const jobDir = await fsp.mkdtemp(path.join(JOBS_DIR, 'job-'));
  const started = Date.now();
  lastJob = jobDir;

  try {
    await fsp.writeFile(path.join(jobDir, 'form.scx'), scx);
    if (Buffer.isBuffer(sct) && sct.length > 0) {
      await fsp.writeFile(path.join(jobDir, 'form.sct'), sct);
    }
    await fsp.writeFile(path.join(jobDir, 'mode.txt'), mode, 'latin1');

    const runOptions =
      mode === 'foxbin2prg'
        ? {
            configFile: VFP_CONFIG_FB2P,
            env: {
              FOX2TXT_FB2P_FILE: path.join(jobDir, 'form.scx'),
              FOX2TXT_FB2P_TYPE: 'BIN2PRG',
            },
          }
        : {};
    const run = await runVfp(jobDir, timeoutMs, vfpExe, runOptions);
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

function safeBaseName(fileName) {
  const base = path.basename(String(fileName || 'form.scx')).replace(/\.[^.]+$/, '');
  return (base || 'formulario').replace(/[\\/:*?"<>|]+/g, '_');
}

/**
 * Recompila um .sc2 editado de volta para .scx/.sct usando FoxBin2Prg.
 * Os arquivos originais não são alterados: o resultado é devolvido em base64
 * e em um ZIP pronto para download.
 *
 * @param {object} input
 * @param {string} input.fileName nome original (informativo)
 * @param {Buffer} input.scx .scx original
 * @param {Buffer} input.sct .sct original
 * @param {string} input.text conteúdo .sc2 editado
 * @param {number} [input.timeoutMs]
 */
async function rebuild(input) {
  const fileName = String(input.fileName || 'form.scx');
  const text = String(input.text || '');
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
  if (!Buffer.isBuffer(scx) || scx.length < 32) {
    throw new ExtractionError('Arquivo .scx vazio ou inválido.', 'INVALID_SCX');
  }
  if (!Buffer.isBuffer(sct) || sct.length === 0) {
    throw new ExtractionError(
      'O arquivo .sct (memo do formulário) é obrigatório para recompilar.',
      'MISSING_SCT',
    );
  }
  if (!text.trim()) {
    throw new ExtractionError('O texto .sc2 está vazio.', 'EMPTY_TEXT');
  }
  if (!/FOXBIN2PRG/i.test(text) || !/DEFINE\s+CLASS/i.test(text)) {
    throw new ExtractionError(
      'O texto não parece ser um arquivo .sc2 do FoxBin2Prg. ' +
        'Use a extração no modo "Round-trip (FoxBin2Prg)" e mantenha o cabeçalho e as seções do arquivo.',
      'INVALID_SC2',
    );
  }
  if (!isFoxBin2PrgAvailable()) {
    throw new ExtractionError(
      'O runtime do FoxBin2Prg não está disponível. Verifique a pasta server/vendor/foxbin2prg.',
      'FOXBIN2PRG_NOT_FOUND',
    );
  }

  const sc2 = encodeCp1252(text);
  ensureRuntime();
  let fb2pReady = false;
  try {
    fb2pReady = installFoxBin2Prg();
  } catch {
    fb2pReady = false;
  }
  if (!fb2pReady) {
    throw new ExtractionError(
      'Não foi possível preparar o runtime do FoxBin2Prg em %TEMP%.',
      'FOXBIN2PRG_NOT_FOUND',
    );
  }

  const jobDir = await fsp.mkdtemp(path.join(JOBS_DIR, 'rebuild-'));
  const started = Date.now();
  lastJob = jobDir;

  try {
    await fsp.writeFile(path.join(jobDir, 'original.scx'), scx);
    await fsp.writeFile(path.join(jobDir, 'original.sct'), sct);
    await fsp.writeFile(path.join(jobDir, 'form.sc2'), sc2);

    const remove = async (...names) => {
      for (const name of names) {
        await fsp.rm(path.join(jobDir, name), { force: true }).catch(() => {});
      }
    };
    await remove('form.scx', 'form.sct', 'status.txt', 'form.sc2.bak');

    const run = await runVfp(jobDir, timeoutMs, vfpExe, {
      configFile: VFP_CONFIG_FB2P,
      env: {
        FOX2TXT_FB2P_FILE: path.join(jobDir, 'form.sc2'),
        FOX2TXT_FB2P_TYPE: 'PRG2BIN',
      },
    });
    const status = await readStatus(jobDir);
    if (!status) {
      throw new ExtractionError(
        'O VFP encerrou sem gerar status ao recompilar (possível erro ou diálogo modal).',
        'NO_STATUS',
        { exitCode: run.code, stdout: run.stdout, stderr: run.stderr },
      );
    }
    if (status.ok !== '1') {
      throw new ExtractionError(
        status.error || 'O FoxBin2Prg não conseguiu recompilar o formulário.',
        'REBUILD_FAILED',
        { status, exitCode: run.code, stdout: run.stdout, stderr: run.stderr },
      );
    }

    const scxOut = await fsp.readFile(path.join(jobDir, 'form.scx'));
    const sctOut = await fsp.readFile(path.join(jobDir, 'form.sct'));
    if (scxOut.length === 0 || sctOut.length === 0) {
      throw new ExtractionError('A recompilação gerou arquivos vazios.', 'EMPTY_OUTPUT');
    }

    // Verificação: reexporta o binário recém-gerado e compara com o texto
    // enviado. Diferenças não invalidam a compilação, mas ficam no relatório.
    let verification = {
      checked: false,
      identical: null,
      added: 0,
      removed: 0,
      sample: [],
      records: Number(status.records || 0),
      fields: Number(status.fields || 0),
    };
    const verifyStarted = Date.now();
    try {
      const verifyDir = path.join(jobDir, 'verify');
      await fsp.mkdir(verifyDir, { recursive: true });
      await fsp.copyFile(path.join(jobDir, 'form.scx'), path.join(verifyDir, 'form.scx'));
      await fsp.copyFile(path.join(jobDir, 'form.sct'), path.join(verifyDir, 'form.sct'));
      await fsp.rm(path.join(verifyDir, 'form.sc2'), { force: true }).catch(() => {});
      const verifyRun = await runVfp(verifyDir, timeoutMs, vfpExe, {
        configFile: VFP_CONFIG_FB2P,
        env: {
          FOX2TXT_FB2P_FILE: path.join(verifyDir, 'form.scx'),
          FOX2TXT_FB2P_TYPE: 'BIN2PRG',
        },
      });
      const verifyStatus = await readStatus(verifyDir);
      if (verifyStatus && verifyStatus.ok === '1') {
        const verifyText = new TextDecoder('windows-1252').decode(
          await fsp.readFile(path.join(verifyDir, 'form.sc2')),
        );
        const diff = compareSc2(text, verifyText);
        const verifyRecords = Number(verifyStatus.records || 0);
        const verifyFields = Number(verifyStatus.fields || 0);
        verification = {
          tested: true,
          checked: true,
          identical: diff.identical,
          added: diff.added,
          removed: diff.removed,
          sample: diff.sample,
          records: verifyRecords > 0 ? verifyRecords : Number(status.records || 0),
          fields: verifyFields > 0 ? verifyFields : Number(status.fields || 0),
        };
      } else {
        verification = {
          tested: true,
          checked: false,
          identical: null,
          added: 0,
          removed: 0,
          sample: [],
          records: Number(status.records || 0),
          fields: Number(status.fields || 0),
          warning:
            'O formulário recompilou, mas a reexportação de verificação não foi concluída. ' +
            (verifyStatus?.error || `VFP exit ${verifyRun.code}.`),
        };
      }
    } catch (error) {
      verification = {
        tested: true,
        checked: false,
        identical: null,
        added: 0,
        removed: 0,
        sample: [],
        records: Number(status.records || 0),
        fields: Number(status.fields || 0),
        warning: `A verificação automática falhou: ${error.message || String(error)}`,
      };
    }

    const base = safeBaseName(fileName);
    const readme = [
      'Fox2Txt - arquivos recompilados com FoxBin2Prg',
      '',
      `Formulário: ${fileName}`,
      `Registros: ${verification.records || status.records || 0}`,
      `Campos: ${verification.fields || status.fields || 0}`,
      '',
      'Copie o .scx e o .sct para a pasta do projeto, mantendo o mesmo nome,',
      'depois de fazer backup dos arquivos originais. Abra o formulário no VFP',
      'para conferir o resultado antes de usar em produção.',
      '',
    ].join('\r\n');
    const zip = createZip([
      { name: `${base}.scx`, data: scxOut },
      { name: `${base}.sct`, data: sctOut },
      { name: 'LEIA-ME.txt', data: readme },
    ]);

    return {
      ok: true,
      scx: scxOut.toString('base64'),
      sct: sctOut.toString('base64'),
      zip: zip.toString('base64'),
      zipName: `${base}.recompilado.zip`,
      verification,
      stats: {
        fileName,
        mode: 'foxbin2prg',
        direction: 'PRG2BIN',
        scxBytes: scxOut.length,
        sctBytes: sctOut.length,
        records: Number(verification.records || status.records || 0),
        fields: Number(verification.fields || status.fields || 0),
        vfpMs: Number(status.ms || 0),
        verifyMs: verification.tested ? Date.now() - verifyStarted : 0,
        totalMs: Date.now() - started,
        patchedForVfp9Rtm: fb2pPatched,
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
    foxbin2prg: {
      available: isFoxBin2PrgAvailable(),
      version: FB2P_VERSION,
      vendor: isFoxBin2PrgAvailable() ? FB2P_VENDOR : null,
      runtime: fs.existsSync(path.join(RUNTIME_FB2P, 'foxbin2prg.prg')) ? RUNTIME_FB2P : null,
      patchedForVfp9Rtm: fb2pPatched || fs.existsSync(FB2P_MARKER),
    },
    busy,
    modes: [...MODES],
    defaultMode: config.defaultMode,
    keepJobs: isKeepJobs(),
    lastJob: isKeepJobs() ? lastJob : undefined,
  };
}

module.exports = {
  extract,
  rebuild,
  enqueue,
  getHealth,
  ensureRuntime,
  getVfpPath,
  getTimeoutMs,
  ExtractionError,
  EXTRACTOR,
  FB2P_VENDOR,
  FB2P_WRAPPER,
  RUNTIME_FB2P,
  VFP_CONFIG_FILE,
  VFP_CONFIG_FB2P,
  JOBS_DIR,
  RUNTIME_DIR,
};

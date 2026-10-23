'use strict';

const els = {
  version: document.getElementById('version'),
  serverUrl: document.getElementById('serverUrl'),
  serverBadge: document.getElementById('serverBadge'),
  serverError: document.getElementById('serverError'),
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  openLogsBtn: document.getElementById('openLogsBtn'),
  autoStart: document.getElementById('autoStart'),
  launchAtLogin: document.getElementById('launchAtLogin'),
  vfpPath: document.getElementById('vfpPath'),
  pickVfpBtn: document.getElementById('pickVfpBtn'),
  detectVfpBtn: document.getElementById('detectVfpBtn'),
  testVfpBtn: document.getElementById('testVfpBtn'),
  vfpStatus: document.getElementById('vfpStatus'),
  timeoutSec: document.getElementById('timeoutSec'),
  defaultMode: document.getElementById('defaultMode'),
  keepJobs: document.getElementById('keepJobs'),
  debug: document.getElementById('debug'),
  openDataBtn: document.getElementById('openDataBtn'),
  openConfigBtn: document.getElementById('openConfigBtn'),
  refreshLogBtn: document.getElementById('refreshLogBtn'),
  log: document.getElementById('log'),
  logPath: document.getElementById('logPath'),
  feedback: document.getElementById('feedback'),
  saveBtn: document.getElementById('saveBtn'),
};

let feedbackTimer = null;
let saveInFlight = false;
let actionInFlight = false;
let initialLoadDone = false;

function setFeedback(message, type = '') {
  els.feedback.textContent = message || '';
  els.feedback.className = `feedback${type ? ` ${type}` : ''}`;
  if (feedbackTimer) clearTimeout(feedbackTimer);
  if (message) {
    feedbackTimer = setTimeout(() => {
      els.feedback.textContent = '';
      els.feedback.className = 'feedback';
    }, 8000);
  }
}

function setLog(text) {
  const value = String(text || '').trim();
  els.log.textContent = value || '(sem linhas)';
  els.log.scrollTop = els.log.scrollHeight;
}

function appendLog(line) {
  if (!line) return;
  const current = els.log.textContent === '(sem linhas)' ? '' : els.log.textContent;
  const lines = `${current}${current ? '\n' : ''}${line}`.split(/\r?\n/);
  setLog(lines.slice(-500).join('\n'));
}

function iconForState(state) {
  const server = state && state.server ? state.server : {};
  if (server.error) return { text: 'erro', className: 'badge erro' };
  if (server.running) return { text: 'online', className: 'badge on' };
  return { text: 'parado', className: 'badge off' };
}

function renderServer(state) {
  const server = state.server || {};
  const config = state.config || {};
  const badge = iconForState(state);
  els.serverBadge.textContent = badge.text;
  els.serverBadge.className = badge.className;

  els.startBtn.disabled = Boolean(server.running) || actionInFlight;
  els.stopBtn.disabled = !server.running || actionInFlight;

  if (server.error) {
    els.serverError.hidden = false;
    els.serverError.textContent = server.error;
  } else {
    els.serverError.hidden = true;
    els.serverError.textContent = '';
  }

  const host = config.host || '127.0.0.1';
  const port = config.port || 8765;
  els.serverUrl.textContent = server.running && server.url ? server.url : `http://${host}:${port}`;
}

function renderPaths(state) {
  const paths = state.paths || {};
  els.logPath.textContent = paths.logFile || paths.logs || '—';
}

function renderVfpStatus(state, customMessage) {
  if (customMessage) {
    els.vfpStatus.textContent = customMessage;
    return;
  }
  const configured = state && state.config ? state.config.vfpPath : '';
  const detected = state ? state.vfpDetected : null;
  if (configured && detected && configured.toLowerCase() !== detected.toLowerCase()) {
    els.vfpStatus.textContent = `Caminho configurado não encontrado; usando ${detected}`;
    return;
  }
  if (detected) {
    els.vfpStatus.textContent = `Detectado: ${detected}`;
  } else {
    els.vfpStatus.textContent = 'Nenhum vfp9.exe detectado nas instalações padrão.';
  }
}

function fillForm(state) {
  const config = state.config || {};
  els.version.textContent = state.version ? `v${state.version}` : 'v0.0.0';
  els.vfpPath.value = config.vfpPath || '';
  els.timeoutSec.value = String(Math.max(5, Math.round((config.timeoutMs || 60000) / 1000)));
  els.autoStart.checked = config.autoStart !== false;
  els.launchAtLogin.checked = Boolean(config.launchAtLogin);
  els.keepJobs.checked = Boolean(config.keepJobs);
  els.debug.checked = Boolean(config.debug);
  els.defaultMode.value =
    config.defaultMode === 'scctext'
      ? 'scctext'
      : config.defaultMode === 'foxbin2prg'
        ? 'foxbin2prg'
        : 'classbrowser';
}

function applyState(state, { fill = false, log = false } = {}) {
  if (!state) return;
  if (fill) fillForm(state);
  renderServer(state);
  renderPaths(state);
  renderVfpStatus(state);
  if (log) setLog(state.log);
}

function gatherForm() {
  const timeoutSeconds = Number(els.timeoutSec.value);
  if (!Number.isFinite(timeoutSeconds) || timeoutSeconds < 5 || timeoutSeconds > 600) {
    throw new Error('O tempo limite deve ficar entre 5 e 600 segundos.');
  }
  return {
    vfpPath: els.vfpPath.value.trim(),
    timeoutMs: Math.round(timeoutSeconds * 1000),
    autoStart: els.autoStart.checked,
    launchAtLogin: els.launchAtLogin.checked,
    keepJobs: els.keepJobs.checked,
    debug: els.debug.checked,
    defaultMode: ['classbrowser', 'scctext', 'foxbin2prg'].includes(els.defaultMode.value)
      ? els.defaultMode.value
      : 'classbrowser',
  };
}

async function load(initial = false) {
  try {
    const state = await window.fox2txt.get();
    applyState(state, { fill: initial || !initialLoadDone, log: true });
    initialLoadDone = true;
    if (initial) {
      const vfp = state && state.config ? state.config.vfpPath : '';
      if (!vfp && state && state.vfpDetected) {
        setFeedback('VFP detectado automaticamente nas instalações padrão.', 'ok');
      }
    }
  } catch (error) {
    setFeedback(`Falha ao carregar as configurações: ${error.message || error}`, 'error');
  }
}

async function save() {
  if (saveInFlight) return;
  let payload;
  try {
    payload = gatherForm();
  } catch (error) {
    setFeedback(error.message, 'error');
    return;
  }

  saveInFlight = true;
  els.saveBtn.disabled = true;
  setFeedback('Salvando…');
  try {
    const result = await window.fox2txt.save(payload);
    if (result && result.state) applyState(result.state);
    if (result && result.ok) {
      setFeedback('Configurações salvas. A próxima extração já usa os novos valores.', 'ok');
    } else {
      setFeedback(result && result.error ? result.error : 'Não foi possível salvar.', 'error');
    }
  } catch (error) {
    setFeedback(`Não foi possível salvar: ${error.message || error}`, 'error');
  } finally {
    saveInFlight = false;
    els.saveBtn.disabled = false;
  }
}

async function startServer() {
  if (actionInFlight) return;
  actionInFlight = true;
  renderServer({ config: {}, server: { running: false } });
  setFeedback('Iniciando servidor…');
  try {
    const result = await window.fox2txt.start();
    if (result && result.state) applyState(result.state);
    if (result && result.ok) {
      setFeedback('Servidor iniciado.', 'ok');
    } else {
      setFeedback(result && result.error ? result.error : 'Não foi possível iniciar o servidor.', 'error');
    }
  } catch (error) {
    setFeedback(`Não foi possível iniciar: ${error.message || error}`, 'error');
  } finally {
    actionInFlight = false;
    if (initialLoadDone) load(false);
  }
}

async function stopServer() {
  if (actionInFlight) return;
  actionInFlight = true;
  renderServer({ config: {}, server: { running: true } });
  setFeedback('Parando servidor…');
  try {
    const result = await window.fox2txt.stop();
    if (result && result.state) applyState(result.state);
    if (result && result.ok) {
      setFeedback('Servidor parado.', 'ok');
    } else {
      setFeedback(result && result.error ? result.error : 'Não foi possível parar o servidor.', 'error');
    }
  } catch (error) {
    setFeedback(`Não foi possível parar: ${error.message || error}`, 'error');
  } finally {
    actionInFlight = false;
    if (initialLoadDone) load(false);
  }
}

async function pickVfp() {
  try {
    const path = await window.fox2txt.pickVfp();
    if (path) {
      els.vfpPath.value = path;
      const result = await window.fox2txt.testVfp(path);
      renderVfpStatus({}, result && result.message ? result.message : '');
      const ok = Boolean(result && result.ok);
      setFeedback(
        ok
          ? 'Caminho do VFP selecionado.'
          : (result && result.message) || 'VFP inválido.',
        ok ? 'ok' : 'error',
      );
    }
  } catch (error) {
    setFeedback(`Não foi possível abrir o seletor de arquivos: ${error.message || error}`, 'error');
  }
}

async function detectVfp() {
  try {
    const result = await window.fox2txt.detectVfp();
    if (result && result.ok) {
      els.vfpPath.value = result.path;
      renderVfpStatus({}, result.message);
      setFeedback('Caminho do VFP detectado.', 'ok');
    } else {
      renderVfpStatus({}, result && result.message ? result.message : '');
      setFeedback(result && result.message ? result.message : 'VFP não encontrado.', 'warn');
    }
  } catch (error) {
    setFeedback(`Falha ao detectar o VFP: ${error.message || error}`, 'error');
  }
}

async function testVfp() {
  try {
    const result = await window.fox2txt.testVfp(els.vfpPath.value);
    renderVfpStatus({}, result && result.message ? result.message : '');
    setFeedback(
      result && result.message ? result.message : result && result.ok ? 'VFP válido.' : 'VFP inválido.',
      result && result.ok ? 'ok' : 'error',
    );
  } catch (error) {
    setFeedback(`Falha ao testar o VFP: ${error.message || error}`, 'error');
  }
}

async function refreshLog() {
  try {
    const state = await window.fox2txt.get();
    applyState(state);
    setLog(state.log);
  } catch (error) {
    setFeedback(`Falha ao ler o log: ${error.message || error}`, 'error');
  }
}

els.saveBtn.addEventListener('click', save);
els.startBtn.addEventListener('click', startServer);
els.stopBtn.addEventListener('click', stopServer);
els.pickVfpBtn.addEventListener('click', pickVfp);
els.detectVfpBtn.addEventListener('click', detectVfp);
els.testVfpBtn.addEventListener('click', testVfp);
els.refreshLogBtn.addEventListener('click', refreshLog);
els.openDataBtn.addEventListener('click', () => {
  window.fox2txt.openData().catch((error) => setFeedback(error.message, 'error'));
});
els.openLogsBtn.addEventListener('click', () => {
  window.fox2txt.openLogs().catch((error) => setFeedback(error.message, 'error'));
});
els.openConfigBtn.addEventListener('click', () => {
  window.fox2txt.openConfig().catch((error) => setFeedback(error.message, 'error'));
});

if (window.fox2txt) {
  window.fox2txt.onState((state) => {
    applyState(state);
  });

  window.fox2txt.onLog((line) => {
    appendLog(line);
  });

  load(true);
} else {
  setFeedback(
    'A API de configurações não foi carregada. Feche e abra a janela novamente.',
    'error',
  );
}
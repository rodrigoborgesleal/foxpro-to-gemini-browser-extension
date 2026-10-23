'use strict';

/**
 * Configuração persistente do Fox2Txt.
 *
 * Local padrão: %APPDATA%\Fox2Txt\config.json
 * Pode ser sobrescrito com FOX2TXT_CONFIG (arquivo) ou FOX2TXT_CONFIG_DIR (pasta).
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const APP_DIR =
  process.env.FOX2TXT_CONFIG_DIR ||
  path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Fox2Txt');

const CONFIG_FILE = process.env.FOX2TXT_CONFIG || path.join(APP_DIR, 'config.json');
const LOGS_DIR = path.join(APP_DIR, 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'server.log');

const DEFAULTS = {
  vfpPath: '',
  timeoutMs: 60000,
  autoStart: true,
  launchAtLogin: false,
  keepJobs: false,
  debug: false,
  host: '127.0.0.1',
  port: 8765,
  defaultMode: 'classbrowser',
};

function clampInt(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function normalize(raw = {}) {
  return {
    vfpPath: String(raw.vfpPath || '')
      .trim()
      .replace(/^"(.*)"$/, '$1'),
    timeoutMs: clampInt(raw.timeoutMs, 5000, 600000, DEFAULTS.timeoutMs),
    autoStart: raw.autoStart !== false,
    launchAtLogin: raw.launchAtLogin === true,
    keepJobs: raw.keepJobs === true,
    debug: raw.debug === true,
    host: String(raw.host || DEFAULTS.host).trim() || DEFAULTS.host,
    port: clampInt(raw.port, 1024, 65535, DEFAULTS.port),
    defaultMode: ['classbrowser', 'scctext', 'foxbin2prg'].includes(raw.defaultMode)
      ? raw.defaultMode
      : 'classbrowser',
  };
}

function ensureDirs() {
  fs.mkdirSync(APP_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function loadConfig() {
  ensureDirs();
  let stored = {};
  try {
    stored = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    stored = {};
  }
  return normalize(stored);
}

function saveConfig(patch = {}) {
  ensureDirs();
  const next = normalize({ ...loadConfig(), ...patch });
  fs.writeFileSync(CONFIG_FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

function getConfigPath() {
  return CONFIG_FILE;
}

function getLogsDir() {
  ensureDirs();
  return LOGS_DIR;
}

function getLogFile() {
  ensureDirs();
  return LOG_FILE;
}

function getDataDir() {
  return path.join(os.tmpdir(), 'fox2txt');
}

module.exports = {
  APP_DIR,
  CONFIG_FILE,
  LOGS_DIR,
  LOG_FILE,
  DEFAULTS,
  loadConfig,
  saveConfig,
  getConfigPath,
  getLogsDir,
  getLogFile,
  getDataDir,
  normalize,
};

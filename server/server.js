'use strict';

const http = require('http');
const { URL } = require('url');
const {
  extract,
  rebuild,
  enqueue,
  getHealth,
  ensureRuntime,
  getVfpPath,
  ExtractionError,
} = require('./core');
const { loadConfig, getConfigPath } = require('./config');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8765;
const DEFAULT_MAX_BODY = 64 * 1024 * 1024;

function setCors(req, res) {
  const origin = req.headers.origin || '';
  const allowAny = process.env.FOX2TXT_ALLOW_ALL === '1';
  const allowed =
    allowAny ||
    !origin ||
    /^chrome-extension:\/\//i.test(origin) ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

  if (allowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Max-Age', '600');
  return allowed;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

async function readJsonBody(req, maxBody) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBody) {
      throw new ExtractionError('Corpo da requisição muito grande.', 'BODY_TOO_LARGE');
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new ExtractionError('JSON inválido.', 'INVALID_JSON');
  }
}

function fromBase64(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return Buffer.from(value, 'base64');
  } catch {
    return null;
  }
}

function debugEnabled() {
  return process.env.FOX2TXT_DEBUG === '1' || loadConfig().debug;
}

/**
 * Cria (mas não inicia) o servidor HTTP. O mesmo objeto é usado pelo CLI
 * (`node server.js`) e pelo app de bandeja (Electron).
 */
function createFoxServer(options = {}) {
  const config = loadConfig();
  const host = String(options.host || process.env.FOX2TXT_HOST || config.host || DEFAULT_HOST);
  const port = Number(options.port || process.env.FOX2TXT_PORT || config.port || DEFAULT_PORT);
  const maxBody = Number(
    options.maxBody || process.env.FOX2TXT_MAX_BODY || DEFAULT_MAX_BODY,
  );
  const logger = options.logger || console;
  const log = (...args) => logger.log(...args);
  const logError = (...args) => (logger.error || logger.log)(...args);

  let listening = false;
  let actualPort = port;
  const sockets = new Set();

  const server = http.createServer(async (req, res) => {
    const allowed = setCors(req, res);
    const url = new URL(req.url, `http://${host}:${actualPort}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(allowed ? 204 : 403, { 'Content-Length': '0' });
      res.end();
      return;
    }

    if (!allowed) {
      sendJson(res, 403, { ok: false, error: 'Origem não autorizada.' });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, {
        ...getHealth(),
        server: { host, port: actualPort, url: info().url },
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(
        [
          'Fox2Txt - servidor local de extração de formulários Visual FoxPro',
          '',
          `Versão : ${require('./package.json').version}`,
          `VFP    : ${getVfpPath() || 'não encontrado'}`,
          `Config : ${getConfigPath()}`,
          '',
          'GET  /health',
          'POST /extract   { fileName, scx(base64), sct(base64), mode: "classbrowser"|"scctext"|"foxbin2prg" }',
          'POST /rebuild   { fileName, scx(base64), sct(base64), text: ".sc2 editado" }',
          '',
        ].join('\n'),
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/extract') {
      const started = Date.now();
      try {
        const body = await readJsonBody(req, maxBody);
        const scx = fromBase64(body.scx);
        const sct = fromBase64(body.sct);
        const fileName = String(body.fileName || 'form.scx');
        const mode = String(body.mode || loadConfig().defaultMode || 'classbrowser');

        log(
          `extract ${fileName} (mode=${mode}, scx=${scx ? scx.length : 0}B, sct=${
            sct ? sct.length : 0
          }B)`,
        );

        const result = await enqueue(() =>
          extract({
            fileName,
            scx,
            sct,
            mode,
            timeoutMs: body.timeoutMs,
          }),
        );

        log(`ok ${fileName} ${result.stats.bytes}B em ${result.stats.totalMs}ms`);
        sendJson(res, 200, result);
      } catch (err) {
        const known = err instanceof ExtractionError;
        const status = known && /INVALID|MISSING|BODY_TOO_LARGE/.test(err.code) ? 400 : 500;
        logError(`ERRO ${url.pathname}: ${err.message}`);
        if (known && err.details && debugEnabled()) {
          logError(err.details);
        }
        sendJson(res, status, {
          ok: false,
          error: err.message || 'Erro desconhecido.',
          code: known ? err.code : 'INTERNAL_ERROR',
          details: known && debugEnabled() ? err.details : undefined,
          ms: Date.now() - started,
        });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/rebuild') {
      const started = Date.now();
      try {
        const body = await readJsonBody(req, maxBody);
        const scx = fromBase64(body.scx);
        const sct = fromBase64(body.sct);
        const fileName = String(body.fileName || 'form.scx');
        const text = String(body.text || '');

        log(
          `rebuild ${fileName} (scx=${scx ? scx.length : 0}B, sct=${
            sct ? sct.length : 0
          }B, texto=${Buffer.byteLength(text, 'utf8')}B)`,
        );

        const result = await enqueue(() =>
          rebuild({
            fileName,
            scx,
            sct,
            text,
            timeoutMs: body.timeoutMs,
          }),
        );

        log(
          `rebuild ok ${fileName} ${result.stats.scxBytes}B/${result.stats.sctBytes}B ` +
            `em ${result.stats.totalMs}ms`,
        );
        sendJson(res, 200, result);
      } catch (err) {
        const known = err instanceof ExtractionError;
        const status = known && /INVALID|MISSING|BODY_TOO_LARGE|EMPTY_TEXT|TEXT_ENCODING/.test(err.code)
          ? 400
          : 500;
        logError(`ERRO ${url.pathname}: ${err.message}`);
        if (known && err.details && debugEnabled()) {
          logError(err.details);
        }
        sendJson(res, status, {
          ok: false,
          error: err.message || 'Erro desconhecido.',
          code: known ? err.code : 'INTERNAL_ERROR',
          details: known && debugEnabled() ? err.details : undefined,
          ms: Date.now() - started,
        });
      }
      return;
    }

    sendJson(res, 404, { ok: false, error: 'Rota não encontrada.' });
  });

  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });

  server.on('error', (err) => {
    logError(`erro no servidor: ${err.message}`);
  });

  function info() {
    return {
      host,
      port: actualPort,
      url: `http://${host}:${actualPort}`,
      running: listening,
    };
  }

  function start() {
    if (listening) return Promise.resolve(info());
    return new Promise((resolve, reject) => {
      const onError = (err) => {
        server.off('listening', onListening);
        reject(err);
      };
      const onListening = () => {
        server.off('error', onError);
        listening = true;
        actualPort = server.address().port;
        resolve(info());
      };
      server.once('error', onError);
      server.once('listening', onListening);
      server.listen(port, host);
    });
  }

  function stop() {
    return new Promise((resolve) => {
      if (!listening) {
        resolve();
        return;
      }
      // Fecha conexões keep-alive para liberar a porta imediatamente.
      for (const socket of sockets) socket.destroy();
      sockets.clear();
      server.close(() => {
        listening = false;
        resolve();
      });
      setTimeout(() => {
        listening = false;
        resolve();
      }, 2000).unref();
    });
  }

  return {
    server,
    start,
    stop,
    info,
    get running() {
      return listening;
    },
  };
}

async function startServer(options = {}) {
  const app = createFoxServer(options);
  try {
    await app.start();
    return app;
  } catch (error) {
    await app.stop().catch(() => {});
    throw error;
  }
}

if (require.main === module) {
  const stamp = () => `[${new Date().toISOString()}]`;
  const cliLogger = {
    log: (...args) => console.log(stamp(), ...args),
    error: (...args) => console.error(stamp(), ...args),
  };

  startServer({ logger: cliLogger })
    .then((app) => {
      const info = app.info();
      const vfp = getVfpPath();
      console.log('');
      console.log('  Fox2Txt - servidor local');
      console.log(`  URL   : ${info.url}`);
      console.log(`  VFP   : ${vfp || 'NÃO ENCONTRADO (defina nas configurações ou em FOX2TXT_VFP)'}`);
      console.log(`  Config: ${getConfigPath()}`);
      console.log('');
      console.log('  Deixe esta janela aberta e use a extensão do Chrome.');
      console.log('  Ctrl+C encerra.');
      console.log('');

      ensureRuntime();

      for (const signal of ['SIGINT', 'SIGTERM']) {
        process.on(signal, () => {
          console.log('\nEncerrando...');
          app.stop().finally(() => process.exit(0));
        });
      }
    })
    .catch((error) => {
      if (error && error.code === 'EADDRINUSE') {
        const port = loadConfig().port;
        console.error(
          `A porta ${port} já está em uso. Feche o outro processo ou altere a porta nas configurações.`,
        );
      } else {
        console.error('Erro ao iniciar o servidor:', error.message || error);
      }
      process.exit(1);
    });
}

module.exports = {
  createFoxServer,
  startServer,
};

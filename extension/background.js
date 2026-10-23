'use strict';

/**
 * Service worker da extensão.
 *
 * Regra de ativação:
 *   o painel lateral (e o ícone da barra) só ficam disponíveis em uma aba
 *   `gemini.google.com` que tenha uma conta Google logada. Em qualquer outra
 *   aba o ícone fica desabilitado e o painel é desligado.
 *
 * Quem descobre o estado de login é `gemini-auth.js`, injetado na própria
 * página do Gemini. Ele responde sob demanda e também avisa quando o estado
 * muda (login/logout), sem precisar recarregar a aba.
 */

const GEMINI_PATTERN = /^https:\/\/gemini\.google\.com\//;
const GEMINI_APP_URL = 'https://gemini.google.com/app';
const AUTH_SCRIPT = 'gemini-auth.js';
const PANEL_PATH = 'sidepanel.html';
const AUTH_TTL_MS = 15000;
const AUTH_TIMEOUT_MS = 1500;

/** tabId -> { isGemini, loggedIn, account, checkedAt } */
const accessByTab = new Map();
/** tabId -> Promise (evita sincronizações concorrentes) */
const syncing = new Map();

const isGeminiUrl = (url) => GEMINI_PATTERN.test(String(url || ''));

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('tempo esgotado')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function notifyPanel(tabId, state) {
  chrome.runtime
    .sendMessage({
      type: 'fox2txt:access',
      tabId,
      isGemini: Boolean(state?.isGemini),
      loggedIn: Boolean(state?.loggedIn),
    })
    .catch(() => {
      /* painel fechado */
    });
}

/** Ajusta ícone, título, badge e disponibilidade do painel para a aba. */
async function applyTabAccess(tabId, state) {
  const enabled = Boolean(state?.isGemini && state?.loggedIn);

  await chrome.sidePanel
    .setOptions({ tabId, path: PANEL_PATH, enabled })
    .catch(() => {});

  if (enabled) {
    await chrome.action.enable(tabId).catch(() => {});
    await chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {});
    await chrome.action.setTitle({ tabId, title: 'FoxPro → Gemini' }).catch(() => {});
    return;
  }

  if (state?.isGemini) {
    // Logado? Não. Ainda assim o ícone fica clicável para explicar o motivo.
    await chrome.action.enable(tabId).catch(() => {});
    await chrome.action
      .setBadgeBackgroundColor({ tabId, color: '#b06000' })
      .catch(() => {});
    await chrome.action.setBadgeText({ tabId, text: '!' }).catch(() => {});
    await chrome.action
      .setTitle({
        tabId,
        title: 'Faça login na sua conta Google no Gemini para ativar a extensão',
      })
      .catch(() => {});
    return;
  }

  await chrome.action.disable(tabId).catch(() => {});
  await chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {});
  await chrome.action
    .setTitle({ tabId, title: 'Disponível apenas em gemini.google.com (com conta logada)' })
    .catch(() => {});
}

async function askAuth(tabId) {
  const reply = await withTimeout(
    chrome.tabs.sendMessage(tabId, { type: 'fox2txt:get-auth' }),
    AUTH_TIMEOUT_MS,
  );
  return reply?.state || null;
}

/**
 * Lê o estado de login da aba. Se o content script ainda não estiver na página
 * (aba aberta antes da instalação/atualização), injeta `gemini-auth.js`.
 */
async function readAuth(tabId) {
  try {
    const state = await askAuth(tabId);
    if (state) return state;
  } catch {
    /* content script ausente: tenta injetar */
  }

  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: [AUTH_SCRIPT] });
  } catch {
    return null;
  }

  try {
    return await askAuth(tabId);
  } catch {
    return null;
  }
}

async function syncTab(tabId) {
  if (syncing.has(tabId)) return syncing.get(tabId);

  const job = (async () => {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab) {
      accessByTab.delete(tabId);
      return null;
    }

    let state;
    let inconclusive = false;
    let hadPrevious = false;
    if (!isGeminiUrl(tab.url)) {
      state = { isGemini: false, loggedIn: false, account: '', checkedAt: Date.now() };
    } else {
      const auth = await readAuth(tabId);
      const previous = accessByTab.get(tabId);
      hadPrevious = Boolean(previous);
      // Sem sinal claro (página ainda montando) mantém a última conclusão;
      // o content script avisa quando o DOM definir o estado.
      inconclusive = !auth || auth.reason === 'indefinido' || auth.reason === 'erro';
      state = {
        isGemini: true,
        loggedIn: inconclusive
          ? Boolean(previous?.isGemini && previous?.loggedIn)
          : auth.loggedIn === true,
        account: auth?.account || previous?.account || '',
        checkedAt: Date.now(),
      };
    }

    accessByTab.set(tabId, state);

    // Sem conclusão e sem histórico: não mexe no ícone/painel; espera o
    // content script mandar um sinal definitivo.
    if (inconclusive && !hadPrevious) return state;

    await applyTabAccess(tabId, state);
    notifyPanel(tabId, state);
    return state;
  })().finally(() => {
    syncing.delete(tabId);
  });

  syncing.set(tabId, job);
  return job;
}

async function getAccess(tabId, { force = false } = {}) {
  if (tabId == null) return null;

  let state = accessByTab.get(tabId);
  if (!state || force || Date.now() - state.checkedAt > AUTH_TTL_MS) {
    state = await syncTab(tabId);
  }
  if (!state) return null;

  return {
    ...state,
    tabId,
    allowed: Boolean(state.isGemini && state.loggedIn),
  };
}

async function focusWindow(windowId) {
  if (windowId == null) return;
  await chrome.windows.update(windowId, { focused: true }).catch(() => {});
}

/** Abre (ou reutiliza) a aba do Gemini. `login` leva à tela /app. */
async function openGemini({ login = false } = {}) {
  const tabs = await chrome.tabs.query({ url: 'https://gemini.google.com/*' });
  const target = tabs.find((tab) => tab.active) || tabs[0];

  if (target) {
    await chrome.tabs.update(target.id, { active: true }).catch(() => {});
    await focusWindow(target.windowId);
    if (login && !String(target.url || '').includes('/app')) {
      await chrome.tabs.update(target.id, { url: GEMINI_APP_URL }).catch(() => {});
    }
    return { ok: true, tabId: target.id, reused: true };
  }

  const created = await chrome.tabs.create({ url: GEMINI_APP_URL, active: true });
  await focusWindow(created.windowId);
  return { ok: true, tabId: created.id, reused: false };
}

function showLoginHint(tabId) {
  chrome.tabs.sendMessage(tabId, { type: 'fox2txt:login-hint' }).catch(() => {});
}

async function syncAllTabs() {
  const tabs = await chrome.tabs.query({}).catch(() => []);
  await Promise.allSettled(tabs.map((tab) => (tab.id != null ? syncTab(tab.id) : null)));
}

async function configureSidePanel() {
  // O clique no ícone é tratado aqui, não pelo comportamento padrão, para que
  // o painel só abra quando a aba for o Gemini logado.
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  // Padrão: painel desligado em qualquer aba; `applyTabAccess` liga só no Gemini.
  await chrome.sidePanel.setOptions({ path: PANEL_PATH, enabled: false }).catch(() => {});
}

chrome.runtime.onInstalled.addListener(() => {
  configureSidePanel();
  syncAllTabs();
});

chrome.runtime.onStartup.addListener(() => {
  configureSidePanel();
  syncAllTabs();
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  syncTab(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    syncTab(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  accessByTab.delete(tabId);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  const [tab] = await chrome.tabs
    .query({ active: true, windowId })
    .catch(() => []);
  if (tab?.id != null) syncTab(tab.id);
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) return;
  if (!isGeminiUrl(tab.url)) {
    syncTab(tab.id);
    return;
  }

  const state = accessByTab.get(tab.id);

  if (state && !state.loggedIn) {
    chrome.tabs.update(tab.id, { active: true }).catch(() => {});
    showLoginHint(tab.id);
    syncTab(tab.id);
    return;
  }

  // `sidePanel.open` precisa acontecer dentro do gesto do usuário, por isso a
  // decisão usa o cache (sincronizado em onActivated/onUpdated) sem `await`.
  chrome.sidePanel
    .open({ tabId: tab.id, windowId: tab.windowId })
    .catch(() => showLoginHint(tab.id));

  syncTab(tab.id);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') return undefined;

  if (message.type === 'fox2txt:auth' && sender.tab?.id != null) {
    const tabId = sender.tab.id;
    if (!isGeminiUrl(sender.tab.url || message.url)) return undefined;

    const state = {
      isGemini: true,
      loggedIn: message.loggedIn === true,
      account: message.account || '',
      checkedAt: Date.now(),
    };
    accessByTab.set(tabId, state);
    applyTabAccess(tabId, state);
    notifyPanel(tabId, state);
    return undefined;
  }

  if (message.type === 'fox2txt:get-access') {
    getAccess(message.tabId, { force: Boolean(message.force) })
      .then((access) => sendResponse(access || { isGemini: false, loggedIn: false, allowed: false }))
      .catch(() => sendResponse({ isGemini: false, loggedIn: false, allowed: false }));
    return true;
  }

  if (message.type === 'fox2txt:open-gemini') {
    openGemini({ login: Boolean(message.login) })
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  return undefined;
});

// Garante o estado padrão mesmo quando o worker acorda sem onInstalled/onStartup.
configureSidePanel();
chrome.tabs
  .query({ active: true, lastFocusedWindow: true })
  .then(([tab]) => {
    if (tab?.id != null) syncTab(tab.id);
  })
  .catch(() => {});

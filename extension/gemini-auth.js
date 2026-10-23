'use strict';

/**
 * Content script do Gemini.
 *
 * Descobre se a aba tem uma conta Google logada e informa o service worker.
 * Também é injetado sob demanda (`chrome.scripting.executeScript`) em abas que
 * já estavam abertas quando a extensão foi instalada/atualizada.
 *
 * A detecção usa apenas sinais do DOM — nenhum cookie é lido.
 */
(() => {
  const FLAG = '__fox2txtAuthInstalled';
  if (globalThis[FLAG]) return;
  globalThis[FLAG] = true;

  /** Presentes apenas com sessão Google ativa. */
  const SIGNED_IN_SELECTORS = [
    'a[href*="accounts.google.com/SignOutOptions"]',
    '[data-test-id="user-avatar"]',
    '[data-test-id="profile-avatar"]',
    'img[data-test-id="user-avatar"]',
    'button[aria-label^="Conta do Google"]',
    'a[aria-label^="Conta do Google"]',
    'button[aria-label^="Google Account"]',
    'a[aria-label^="Google Account"]',
  ];

  /** Presentes na tela de visitante / sem sessão. */
  const SIGNED_OUT_SELECTORS = [
    'a[href*="accounts.google.com/ServiceLogin"]',
    'a[href*="accounts.google.com/signin"]',
    'a[href*="accounts.google.com/AccountChooser"]',
    'a[href*="accounts.google.com/AddSession"]',
  ];

  const SIGNED_IN_LABEL = /^(conta do google|google account)\b/i;
  const SIGNED_OUT_TEXT = /^(fazer login|entrar|sign in|log in)\b/i;
  const COMPOSER_SELECTORS = [
    'rich-textarea .ql-editor[contenteditable="true"]',
    'rich-textarea [contenteditable="true"]',
    'input-area-v2 [contenteditable="true"]',
    '[contenteditable="true"][role="textbox"]',
  ];

  const isVisible = (el) => {
    if (!el || !el.isConnected) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;
    const style = getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none';
  };

  const firstVisible = (selectors) => {
    for (const selector of selectors) {
      for (const el of document.querySelectorAll(selector)) {
        if (isVisible(el)) return el;
      }
    }
    return null;
  };

  const accountFrom = (label) => {
    const match = String(label || '').match(/[^\s():]+@[^\s():]+\.[a-z]{2,}/i);
    return match ? match[0] : '';
  };

  function detect() {
    try {
      if (!/^https:\/\/gemini\.google\.com\//.test(location.href)) {
        return { loggedIn: false, account: '', reason: 'fora-do-gemini' };
      }

      const signedIn = firstVisible(SIGNED_IN_SELECTORS);
      if (signedIn) {
        return {
          loggedIn: true,
          account: accountFrom(signedIn.getAttribute('aria-label')),
          reason: 'avatar',
        };
      }

      for (const el of document.querySelectorAll('[aria-label]')) {
        const label = el.getAttribute('aria-label') || '';
        if (SIGNED_IN_LABEL.test(label) && isVisible(el)) {
          return { loggedIn: true, account: accountFrom(label), reason: 'rotulo-conta' };
        }
      }

      if (firstVisible(SIGNED_OUT_SELECTORS)) {
        return { loggedIn: false, account: '', reason: 'link-de-login' };
      }

      // O próprio Gemini marca a página de visitante com esta classe.
      if (document.body?.classList.contains('viewer-signed-out')) {
        return { loggedIn: false, account: '', reason: 'pagina-de-visitante' };
      }

      const bodyText = document.body?.innerText || '';
      if (/fazer login para|faça login para|sign in to (continue|test|try)/i.test(bodyText)) {
        return { loggedIn: false, account: '', reason: 'texto-de-login' };
      }

      // O editor de mensagens só existe na experiência autenticada.
      if (firstVisible(COMPOSER_SELECTORS)) {
        return { loggedIn: true, account: '', reason: 'editor' };
      }

      for (const el of document.querySelectorAll('button, a, [role="button"]')) {
        const label = `${el.getAttribute('aria-label') || ''} ${el.textContent || ''}`.trim();
        if (SIGNED_OUT_TEXT.test(label) && isVisible(el)) {
          return { loggedIn: false, account: '', reason: 'botao-de-login' };
        }
      }

      // Sem sinal claro: trata como não logado (o painel continua bloqueado).
      return { loggedIn: false, account: '', reason: 'indefinido' };
    } catch {
      return { loggedIn: false, account: '', reason: 'erro' };
    }
  }

  let lastKey = '';
  let reportTimer = 0;

  function report() {
    const state = detect();
    // Sem sinal claro a página ainda está montando: não derruba o painel.
    if (state.reason === 'indefinido' || state.reason === 'erro') return;
    const key = `${state.loggedIn}|${state.account}`;
    if (key === lastKey) return;
    lastKey = key;
    try {
      chrome.runtime
        .sendMessage({
          type: 'fox2txt:auth',
          loggedIn: state.loggedIn,
          account: state.account,
          reason: state.reason,
          url: location.href,
        })
        .catch(() => {});
    } catch {
      /* extensão recarregada: o content script antigo fica órfão */
    }
  }

  function scheduleReport(delay = 400) {
    clearTimeout(reportTimer);
    reportTimer = setTimeout(report, delay);
  }

  function watch() {
    const start = () => {
      // Primeiro cálculo com o DOM já montado (SPA do Gemini).
      scheduleReport(300);
      const observer = new MutationObserver(() => scheduleReport());
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-label', 'href', 'src'],
      });
      setInterval(report, 5000);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') scheduleReport(150);
    });
    window.addEventListener('pageshow', () => scheduleReport(150));
  }

  function showLoginHint() {
    try {
      const existing = document.getElementById('fox2txt-login-hint');
      if (existing) existing.remove();

      const box = document.createElement('div');
      box.id = 'fox2txt-login-hint';
      box.textContent =
        'Faça login na sua conta Google no Gemini para ativar a extensão FoxPro → Gemini.';
      box.style.cssText = [
        'position:fixed',
        'right:20px',
        'bottom:20px',
        'z-index:2147483647',
        'max-width:320px',
        'padding:12px 16px',
        'border-radius:12px',
        'background:#1f1f1f',
        'color:#fff',
        'font:13px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
        'box-shadow:0 8px 28px rgba(0,0,0,.35)',
      ].join(';');
      document.body.append(box);
      setTimeout(() => box.remove(), 8000);
    } catch {
      /* página sem body: ignora */
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== 'object') return undefined;
    if (message.type === 'fox2txt:get-auth') {
      sendResponse({ state: detect(), url: location.href });
      return undefined;
    }
    if (message.type === 'fox2txt:login-hint') {
      showLoginHint();
      sendResponse({ ok: true });
      return undefined;
    }
    return undefined;
  });

  watch();
  report();
})();

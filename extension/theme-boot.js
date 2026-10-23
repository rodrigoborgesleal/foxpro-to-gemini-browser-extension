'use strict';

/**
 * Aplica o tema salvo antes da primeira pintura para evitar "flash" de tema.
 * A preferência definitiva continua sendo validada em sidepanel.js.
 */
try {
  const saved = localStorage.getItem('fox2txt.theme');
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.dataset.theme = saved;
  }
} catch {
  /* localStorage indisponível: segue o tema do sistema */
}

'use strict';

const API = 'http://127.0.0.1:8765';

/* ------------------------------------------------------------------
 * Base de linguagem VFP 9 (vfp-language.js / vfp-highlight.js)
 * ------------------------------------------------------------------ */

const VFP = window.VFP_LANGUAGE || {};
const LAYOUT = window.VfpLayout || null;
const HIGHLIGHT = window.VfpHighlight || {
  highlight: (value) =>
    String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return map[ch];
    }),
};

const VFP_FUNCTIONS = Array.isArray(VFP.FUNCTIONS) ? VFP.FUNCTIONS : [];
const VFP_FUNCTION_MAP = new Map(VFP_FUNCTIONS.map((fn) => [fn.name.toUpperCase(), fn]));
const VFP_COMMANDS = Array.isArray(VFP.COMMANDS) ? VFP.COMMANDS : [];
const VFP_BASE_CLASSES = Array.isArray(VFP.BASE_CLASS_NAMES) ? VFP.BASE_CLASS_NAMES : [];
const VFP_BASE_SET = new Set(VFP_BASE_CLASSES.map((name) => name.toUpperCase()));
const VFP_SQL_WORDS = new Set();
for (const phrase of VFP.SQL_KEYWORDS || []) {
  for (const word of String(phrase).split(/\s+/)) {
    if (word) VFP_SQL_WORDS.add(word.toUpperCase());
  }
}
const pemsFor = typeof VFP.pemsFor === 'function'
  ? VFP.pemsFor
  : () => ({ properties: [], events: [], methods: [] });
const pemsAll = typeof VFP.pemsAll === 'function'
  ? VFP.pemsAll
  : () => ({ properties: [], events: [], methods: [] });

const els = {
  serverDot: document.getElementById('serverDot'),
  serverText: document.getElementById('serverText'),
  folderInput: document.getElementById('folderInput'),
  folderInfo: document.getElementById('folderInfo'),
  formSelect: document.getElementById('formSelect'),
  formMeta: document.getElementById('formMeta'),
  extractBtn: document.getElementById('extractBtn'),
  insertBtn: document.getElementById('insertBtn'),
  status: document.getElementById('status'),
  previewBox: document.getElementById('previewBox'),
  preview: document.getElementById('preview'),
  previewEditor: document.getElementById('previewEditor'),
  previewGutter: document.getElementById('previewGutter'),
  previewHighlight: document.getElementById('previewHighlight'),
  previewStats: document.getElementById('previewStats'),
  tabCode: document.getElementById('tabCode'),
  tabLayout: document.getElementById('tabLayout'),
  layoutView: document.getElementById('layoutView'),
  layoutStage: document.getElementById('layoutStage'),
  layoutCanvas: document.getElementById('layoutCanvas'),
  layoutForm: document.getElementById('layoutForm'),
  layoutInfo: document.getElementById('layoutInfo'),
  layoutNote: document.getElementById('layoutNote'),
  layoutZoom: document.getElementById('layoutZoom'),
  layoutZoomLabel: document.getElementById('layoutZoomLabel'),
  layoutFitBtn: document.getElementById('layoutFitBtn'),
  editorCursor: document.getElementById('editorCursor'),
  editorDirty: document.getElementById('editorDirty'),
  editorInfo: document.getElementById('editorInfo'),
  expandBtn: document.getElementById('expandBtn'),
  intelliPopup: document.getElementById('intelliPopup'),
  intelliList: document.getElementById('intelliList'),
  intelliHelp: document.getElementById('intelliHelp'),
  copyBtn: document.getElementById('copyBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  insertTextBtn: document.getElementById('insertTextBtn'),
  themeToggle: document.getElementById('themeToggle'),
  main: document.getElementById('main'),
  gate: document.getElementById('gate'),
  gateTitle: document.getElementById('gateTitle'),
  gateText: document.getElementById('gateText'),
  gateNote: document.getElementById('gateNote'),
  gateAction: document.getElementById('gateAction'),
  gateRetry: document.getElementById('gateRetry'),
};

const state = {
  byPath: new Map(),
  forms: [],
  rootName: '',
  text: '',
  fileName: '',
  attachmentName: '',
  extractedFormPath: '',
  extractedMode: '',
  editorDirty: false,
  expanded: false,
  layout: null,
  previewView: 'code',
  layoutSize: { width: 0, height: 0 },
  layoutScale: 1,
  layoutFit: true,
  completion: {
    open: false,
    suppress: false,
    items: [],
    index: 0,
    start: 0,
    end: 0,
    context: null,
  },
  completionTimer: 0,
  busy: false,
  serverOk: false,
  // Ativação: só libera em aba do Gemini com conta logada.
  allowed: false,
  accessMode: 'checking',
  tabId: null,
};

const norm = (value) => String(value || '').replace(/\\/g, '/').toLowerCase();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const THEME_KEY = 'fox2txt.theme';
const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
let themePreference = 'system';

function systemTheme() {
  return themeMedia.matches ? 'dark' : 'light';
}

function readBootTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

function effectiveTheme() {
  return themePreference === 'light' || themePreference === 'dark'
    ? themePreference
    : systemTheme();
}

function renderTheme() {
  const theme = effectiveTheme();
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  if (!els.themeToggle) return;
  els.themeToggle.setAttribute('aria-checked', String(isDark));
  const label = isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro';
  els.themeToggle.setAttribute('aria-label', label);
  els.themeToggle.title = label;
}

function applyThemePreference(preference, { persist = false } = {}) {
  themePreference = preference === 'light' || preference === 'dark' ? preference : 'system';
  renderTheme();
  if (!persist) return;

  try {
    localStorage.setItem(THEME_KEY, themePreference);
  } catch {
    /* localStorage indisponível: a preferência ainda vale nesta sessão */
  }
  if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
    chrome.storage.local.set({ theme: themePreference }).catch(() => {});
  }
}

function toggleTheme() {
  applyThemePreference(effectiveTheme() === 'dark' ? 'light' : 'dark', { persist: true });
}

async function loadStoredPreferences() {
  try {
    return await chrome.storage.local.get({ mode: 'classbrowser', theme: 'system' });
  } catch {
    return { mode: 'classbrowser', theme: 'system' };
  }
}

function fmtInt(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}

function fmtBytes(bytes) {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/* ------------------------------------------------------------------
 * Editor da prévia: realce de sintaxe, IntelliSense e modo expandido.
 *
 * O realce fica num <pre> atrás do <textarea> transparente; o texto do
 * textarea continua sendo a fonte da verdade. O IntelliSense usa a base
 * estática de vfp-language.js (Foxcode.DBF do VFP 9) e os símbolos do
 * próprio código (DEFINE CLASS, ADD OBJECT, PROCEDURE, #DEFINE, variáveis).
 * ------------------------------------------------------------------ */

const KIND_LETTER = {
  keyword: 'K',
  function: 'ƒ',
  class: 'C',
  property: 'P',
  event: 'E',
  method: 'M',
  variable: 'V',
  constant: '#',
  object: 'O',
  sql: 'S',
};

const KIND_PRIORITY = {
  variable: 0,
  object: 0,
  constant: 0,
  sql: 0,
  property: 1,
  event: 1,
  method: 1,
  function: 2,
  keyword: 3,
  class: 4,
};

const BLOCK_STARTERS = new Set([
  'IF',
  'FOR',
  'SCAN',
  'TRY',
  'WITH',
  'DO WHILE',
  'DO CASE',
  'DEFINE CLASS',
  'PROCEDURE',
  'FUNCTION',
  'SELECT',
  'UPDATE',
  'INSERT INTO',
  'DELETE FROM',
  'CREATE CURSOR',
  'ALTER TABLE',
]);

function baseClassName(name) {
  const key = String(name || '').toLowerCase();
  return (VFP.BASE_CLASS_DISPLAY && VFP.BASE_CLASS_DISPLAY[key]) || name;
}

function previewVisible() {
  return Boolean(els.previewBox && !els.previewBox.hidden);
}

function editorVisible() {
  return previewVisible() && state.previewView === 'code' && Boolean(els.preview);
}

function setPreviewView(view) {
  const next = view === 'layout' && state.layout ? 'layout' : 'code';
  state.previewView = next;
  const code = next === 'code';

  if (els.previewEditor) els.previewEditor.hidden = !code;
  if (els.layoutView) els.layoutView.hidden = code;
  if (els.tabCode) {
    els.tabCode.classList.toggle('is-active', code);
    els.tabCode.setAttribute('aria-selected', String(code));
  }
  if (els.tabLayout) {
    els.tabLayout.classList.toggle('is-active', !code);
    els.tabLayout.setAttribute('aria-selected', String(!code));
  }

  if (code) {
    requestAnimationFrame(() => {
      syncEditorScroll();
      updateCursorStatus();
    });
  } else {
    closeCompletion();
    requestAnimationFrame(() => {
      if (state.layoutFit) fitLayout();
    });
  }
}

function setLayoutScale(scale) {
  const next = Math.min(2, Math.max(0.1, Number(scale) || 1));
  state.layoutScale = next;
  const width = state.layoutSize.width || 0;
  const height = state.layoutSize.height || 0;

  if (els.layoutForm) els.layoutForm.style.transform = `scale(${next})`;
  if (els.layoutCanvas) {
    els.layoutCanvas.style.width = `${width * next}px`;
    els.layoutCanvas.style.height = `${height * next}px`;
  }
  if (els.layoutZoom) els.layoutZoom.value = String(Math.round(next * 100));
  if (els.layoutZoomLabel) els.layoutZoomLabel.textContent = `${Math.round(next * 100)}%`;
}

function fitLayout() {
  if (!els.layoutStage || !state.layoutSize.width || !state.layoutSize.height) return;
  const availableWidth = els.layoutStage.clientWidth - 28;
  const availableHeight = els.layoutStage.clientHeight - 28;
  if (availableWidth <= 0 || availableHeight <= 0) return;
  const scale = Math.min(
    1,
    availableWidth / state.layoutSize.width,
    availableHeight / state.layoutSize.height,
  );
  state.layoutFit = true;
  setLayoutScale(scale);
}

function renderLayout() {
  if (!els.layoutForm) return;
  if (!state.layout || !LAYOUT) {
    els.layoutForm.replaceChildren();
    if (els.layoutInfo) els.layoutInfo.textContent = '';
    if (els.layoutNote) {
      els.layoutNote.textContent = LAYOUT
        ? 'Layout não disponível para este formulário.'
        : 'Renderizador de layout não carregado.';
    }
    return;
  }

  const result = LAYOUT.render(els.layoutForm, state.layout);
  state.layoutSize = { width: result.width, height: result.height };
  if (els.layoutInfo) {
    els.layoutInfo.textContent = `${result.width} × ${result.height} px · ${fmtInt(
      result.count,
    )} objeto(s)`;
  }
  if (els.layoutNote) {
    const warnings = Array.isArray(result.warnings) ? result.warnings : [];
    els.layoutNote.textContent = warnings.length
      ? `Aproximação do layout: ${warnings.slice(0, 2).join(' ')}`
      : 'Posições, tamanhos, cores e fontes vêm do .scx. Propriedades não gravadas usam os padrões do VFP 9.';
  }
  state.layoutFit = true;
  requestAnimationFrame(fitLayout);
}

function resetLayout() {
  state.layout = null;
  state.previewView = 'code';
  state.layoutSize = { width: 0, height: 0 };
  state.layoutScale = 1;
  state.layoutFit = true;
  if (els.layoutForm) {
    els.layoutForm.replaceChildren();
    els.layoutForm.style.transform = 'scale(1)';
  }
  if (els.layoutCanvas) {
    els.layoutCanvas.style.width = '';
    els.layoutCanvas.style.height = '';
  }
  if (els.layoutInfo) els.layoutInfo.textContent = '';
  if (els.layoutNote) els.layoutNote.textContent = '';
  if (els.layoutZoom) els.layoutZoom.value = '100';
  if (els.layoutZoomLabel) els.layoutZoomLabel.textContent = '100%';
  if (els.tabLayout) {
    els.tabLayout.disabled = true;
    els.tabLayout.title = 'Layout indisponível para esta extração';
  }
  setPreviewView('code');
}

function syncEditorScroll() {
  if (!els.preview || !els.previewHighlight) return;
  els.previewHighlight.scrollTop = els.preview.scrollTop;
  els.previewHighlight.scrollLeft = els.preview.scrollLeft;
  if (els.previewGutter) {
    els.previewGutter.style.transform = `translateY(-${els.preview.scrollTop}px)`;
  }
}

function renderEditor() {
  if (!els.preview || !els.previewHighlight) return;
  const text = els.preview.value;
  // O \n final evita que o <pre> "coma" a última linha vazia e desalinhe o scroll.
  els.previewHighlight.innerHTML = `${HIGHLIGHT.highlight(text)}\n`;

  // A barra horizontal do textarea ocupa altura; compensa no <pre> para o
  // scroll máximo dos dois coincidir e o realce não desalinhar no fim.
  const scrollbar = Math.max(0, els.preview.offsetHeight - els.preview.clientHeight);
  els.previewHighlight.style.paddingBottom = `${12 + scrollbar}px`;

  const lines = text ? text.split('\n').length : 1;
  const numbers = new Array(lines);
  for (let i = 1; i <= lines; i += 1) numbers[i - 1] = i;
  if (els.previewGutter) els.previewGutter.textContent = numbers.join('\n');
  if (els.previewEditor) {
    els.previewEditor.style.setProperty('--gutter-ch', String(String(lines).length));
  }
  syncEditorScroll();
}

function setEditorDirty(dirty) {
  state.editorDirty = Boolean(dirty);
  if (els.editorDirty) els.editorDirty.hidden = !state.editorDirty;
}

function updateEditorInfo(text) {
  if (!els.editorInfo) return;
  const value = text == null ? (els.preview ? els.preview.value : '') : text;
  const lines = value ? value.split('\n').length : 1;
  els.editorInfo.textContent = `${fmtInt(value.length)} caracteres · ${fmtInt(
    lines,
  )} linhas · ${EDITOR_INFO_DEFAULT}`;
}

function updateCursorStatus() {
  if (!els.preview || !els.editorCursor) return;
  const pos = els.preview.selectionStart || 0;
  const before = els.preview.value.slice(0, pos);
  const line = before.split('\n').length;
  const col = pos - before.lastIndexOf('\n');
  const selected = Math.abs(els.preview.selectionEnd - els.preview.selectionStart);
  els.editorCursor.textContent =
    selected > 0 ? `Ln ${line}, Col ${col} (${selected} sel.)` : `Ln ${line}, Col ${col}`;
}

function setExpanded(expanded, { focus = true } = {}) {
  const next = Boolean(expanded) && previewVisible();
  state.expanded = next;
  if (els.previewBox) els.previewBox.classList.toggle('expanded', next);
  document.body.classList.toggle('editor-open', next);

  if (els.expandBtn) {
    els.expandBtn.setAttribute('aria-expanded', String(next));
    els.expandBtn.title = next ? 'Recolher a prévia' : 'Expandir a prévia';
    const label = els.expandBtn.querySelector('.expand-label');
    if (label) label.textContent = next ? 'Recolher' : 'Expandir';
  }

  closeCompletion();
  if (next && editorVisible()) {
    els.preview.focus();
    requestAnimationFrame(() => {
      syncEditorScroll();
      updateCursorStatus();
    });
  } else if (next && state.previewView === 'layout') {
    requestAnimationFrame(() => {
      if (state.layoutFit) fitLayout();
    });
  } else if (focus && els.expandBtn && previewVisible()) {
    els.expandBtn.focus();
  }
}

function toggleExpanded() {
  setExpanded(!state.expanded);
}

function onEditorInput() {
  if (!els.preview) return;
  state.text = els.preview.value;
  setEditorDirty(true);
  renderEditor();
  updateCursorStatus();
  updateEditorInfo(state.text);
  scheduleCompletion(45);
}

function scheduleCompletion(delay = 45) {
  clearTimeout(state.completionTimer);
  if (state.completion.suppress) return;
  state.completionTimer = setTimeout(() => openCompletion({ manual: false }), delay);
}

function closeCompletion() {
  clearTimeout(state.completionTimer);
  state.completion.open = false;
  state.completion.items = [];
  state.completion.index = 0;
  if (els.intelliPopup) els.intelliPopup.hidden = true;
  if (els.intelliList) els.intelliList.textContent = '';
  if (els.intelliHelp) els.intelliHelp.textContent = '';
  if (els.preview) els.preview.removeAttribute('aria-activedescendant');
}

function lineAt(text, pos) {
  return text.slice(0, pos).split('\n').length - 1;
}

function wordRangeAt(text, pos) {
  let start = pos;
  while (start > 0 && /[A-Za-z0-9_]/.test(text[start - 1])) start -= 1;
  return { start, end: pos, word: text.slice(start, pos) };
}

function isInsideTextBlock(text, pos) {
  const before = text.slice(0, pos).split('\n');
  let inText = false;
  for (const line of before) {
    if (inText) {
      if (/^\s*ENDTEXT\b/i.test(line)) inText = false;
    } else if (/^\s*TEXT\b/i.test(line) && !/\bENDTEXT\b/i.test(line)) {
      inText = true;
    }
  }
  return inText;
}

function isCodeContext(text, pos) {
  const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
  const line = text.slice(lineStart, pos);
  if (/^\s*NOTE\b/i.test(line)) return false;

  let quote = '';
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) {
        if (line[i + 1] === quote) {
          i += 1;
          continue;
        }
        quote = '';
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '[') {
      quote = ch === '[' ? ']' : ch;
      continue;
    }
    if (ch === '&' && line[i + 1] === '&') return false;
    if (ch === '*' && line.slice(0, i).trim() === '') return false;
  }
  return !quote;
}

function isSqlContext(text, pos) {
  const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
  const line = text.slice(lineStart, pos);
  const sqlStart =
    /^\s*(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+(?:CURSOR|TABLE|SQL|VIEW)|ALTER\s+TABLE|DROP\s+TABLE)\b/i;
  if (sqlStart.test(line)) return true;

  let cursor = lineStart;
  while (cursor > 0) {
    const prevEnd = cursor - 1;
    const prevStart = text.lastIndexOf('\n', prevEnd - 1) + 1;
    const prevLine = text.slice(prevStart, prevEnd);
    if (!/;\s*$/.test(prevLine)) break;
    if (sqlStart.test(prevLine)) return true;
    cursor = prevStart;
  }
  return false;
}

function scanSymbols(text) {
  const lines = text.split('\n');
  const classes = [];
  const classStack = [];
  const objects = new Map();
  const procedures = [];
  const defines = [];
  const variables = new Map();
  let inProcedure = false;

  const addVariable = (name, line) => {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) return;
    variables.set(name.toLowerCase(), { name, line });
  };

  lines.forEach((line, index) => {
    if (/^\s*(?:PROCEDURE|FUNCTION)\b/i.test(line)) inProcedure = true;

    let match = /^\s*DEFINE\s+CLASS\s+([A-Za-z_][A-Za-z0-9_]*)\s+AS\s+([A-Za-z_][A-Za-z0-9_.]*)/i.exec(line);
    if (match) {
      const entry = {
        name: match[1],
        baseClass: match[2],
        start: index,
        end: lines.length - 1,
      };
      classes.push(entry);
      classStack.push(entry);
      objects.set(match[1].toLowerCase(), match[2]);
    }

    if (/^\s*ENDDEFINE\b/i.test(line)) {
      const entry = classStack.pop();
      if (entry) entry.end = index;
    }

    match = /^\s*ADD\s+OBJECT\s+([A-Za-z_][A-Za-z0-9_]*)\s+AS\s+([A-Za-z_][A-Za-z0-9_.]*)/i.exec(line);
    if (match) objects.set(match[1].toLowerCase(), match[2]);

    match = /^\s*(?:PROCEDURE|FUNCTION)\s+([A-Za-z_][A-Za-z0-9_.]*)/i.exec(line);
    if (match) procedures.push({ name: match[1], line: index });

    match = /^\s*#(?:DEFINE|UNDEF)\s+([A-Za-z_][A-Za-z0-9_]*)/i.exec(line);
    if (match) defines.push({ name: match[1], line: index });

    match = /^\s*(?:LOCAL|PRIVATE|PUBLIC|REGIONAL)\s+(.+)$/i.exec(line);
    if (match) {
      for (const chunk of match[1].split(',')) {
        addVariable(chunk.trim().split(/[\s=]/)[0], index);
      }
    }

    match = /^\s*LPARAMETERS?\s+(.+)$/i.exec(line);
    if (match) {
      for (const chunk of match[1].split(',')) {
        addVariable(chunk.trim().split(/[\s=]/)[0], index);
      }
    }

    match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*CREATEOBJECT\s*\(\s*["']([^"']+)["']/i.exec(line);
    if (match) {
      addVariable(match[1], index);
      objects.set(match[1].toLowerCase(), match[2]);
    } else if (!(classStack.length > 0 && !inProcedure)) {
      match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*[^=]/i.exec(line);
      if (match) addVariable(match[1], index);
    }

    if (/^\s*END(?:PROC|FUNC)\b/i.test(line)) inProcedure = false;
  });

  return {
    classes,
    objects,
    procedures: procedures.filter((item) => !item.name.includes('.')),
    defines,
    variables: Array.from(variables.values()),
  };
}

function owningClassAt(classes, line) {
  let found = null;
  for (const entry of classes) {
    if (line >= entry.start && line <= entry.end) found = entry;
  }
  return found;
}

function resolveBaseClass(root, chain, symbols, line) {
  const upper = String(root || '').toUpperCase();
  const owning = owningClassAt(symbols.classes, line);

  if (upper === 'M' || upper === '_M') return null;
  if (upper === 'THIS' || upper === 'THISFORM' || upper === 'THISFORMSET' || upper === '_SCREEN') {
    const parts = chain.split('.');
    const last = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    if (last && last !== 'parent') {
      const objectBase = symbols.objects.get(last);
      if (objectBase) return objectBase;
    }
    if (upper === 'THISFORMSET') return owning ? owning.baseClass : 'formset';
    return owning ? owning.baseClass : 'form';
  }

  const last = chain.split('.').pop().toLowerCase();
  return symbols.objects.get(last) || symbols.objects.get(String(root).toLowerCase()) || null;
}

function completionContext(manual) {
  if (!editorVisible() || !els.preview) return null;
  if (els.preview.selectionStart !== els.preview.selectionEnd) return null;

  const pos = els.preview.selectionStart;
  const text = els.preview.value;
  if (!isCodeContext(text, pos) || isInsideTextBlock(text, pos)) return null;

  const before = text.slice(0, pos);
  const symbols = scanSymbols(text);
  const line = lineAt(text, pos);
  const dotted =
    /([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)?$/.exec(
      before,
    );

  if (dotted) {
    const chain = dotted[1];
    const prefix = dotted[2] || '';
    const root = chain.split('.')[0];
    return {
      kind: 'members',
      prefix,
      start: pos - prefix.length,
      end: pos,
      root,
      chain,
      baseClass: resolveBaseClass(root, chain, symbols, line),
      symbols,
      manual,
    };
  }

  const word = wordRangeAt(text, pos);
  const sql = isSqlContext(text, pos);
  let asContext = false;
  if (!sql) {
    const beforeWord = text.slice(0, word.start).replace(/\s+$/, '');
    const prev = /([A-Za-z_][A-Za-z0-9_]*)$/.exec(beforeWord);
    asContext = Boolean(prev && /^AS$/i.test(prev[1]));
  }

  if (!manual && !word.word && !asContext) return null;
  if (asContext) {
    return {
      kind: 'classes',
      prefix: word.word,
      start: word.start,
      end: pos,
      symbols,
      manual,
    };
  }
  return {
    kind: 'general',
    prefix: word.word,
    start: word.start,
    end: pos,
    symbols,
    sql,
    manual,
  };
}

function buildMemberItems(context) {
  const items = [];
  const seen = new Set();
  const base = context.baseClass;
  const suffix = base ? ` · ${baseClassName(base)}` : '';

  if (String(context.root).toUpperCase() === 'M' || String(context.root).toUpperCase() === '_M') {
    for (const variable of context.symbols.variables) {
      items.push({
        label: variable.name,
        kind: 'variable',
        detail: `Variável (linha ${variable.line + 1})`,
        sig: variable.name,
      });
    }
    return items;
  }

  const pems = base ? pemsFor(base) : pemsAll();
  const add = (name, kind, detail) => {
    const key = String(name).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ label: name, kind, detail: `${detail}${suffix}`, sig: name });
  };

  for (const name of pems.properties) add(name, 'property', 'Propriedade');
  for (const name of pems.events) add(name, 'event', 'Evento');
  for (const name of pems.methods) add(name, 'method', 'Método');
  return items;
}

function buildClassItems(context) {
  const seen = new Set();
  const items = [];
  const add = (name, detail) => {
    const key = String(name).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ label: name, kind: 'class', detail, sig: name });
  };
  for (const name of VFP_BASE_CLASSES) add(baseClassName(name), 'Classe base VFP');
  for (const entry of context.symbols.classes) add(entry.name, 'Classe deste projeto');
  return items;
}

function buildGeneralItems(context) {
  const items = [];
  const seen = new Set();
  const add = (item) => {
    const key = String(item.label).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  for (const variable of context.symbols.variables) {
    add({
      label: variable.name,
      kind: 'variable',
      detail: `Variável (linha ${variable.line + 1})`,
      sig: variable.name,
    });
  }
  for (const define of context.symbols.defines) {
    add({ label: define.name, kind: 'constant', detail: '#DEFINE', sig: define.name });
  }
  for (const procedure of context.symbols.procedures) {
    add({
      label: procedure.name,
      kind: 'function',
      detail: `Rotina deste arquivo (linha ${procedure.line + 1})`,
      sig: procedure.name,
    });
  }
  for (const entry of context.symbols.classes) {
    add({
      label: entry.name,
      kind: 'class',
      detail: `Classe deste arquivo · AS ${entry.baseClass}`,
      sig: entry.name,
    });
  }
  for (const [name, base] of context.symbols.objects) {
    if (context.symbols.classes.some((entry) => entry.name.toLowerCase() === name)) continue;
    add({
      label: name,
      kind: 'object',
      detail: `Objeto · ${baseClassName(base)}`,
      sig: name,
    });
  }

  for (const fn of VFP_FUNCTIONS) {
    add({
      label: fn.name,
      kind: 'function',
      detail: fn.sig,
      doc: fn.doc,
      sig: fn.sig,
      insert: `${fn.name}()`,
      caretOffset: fn.name.length + 1,
    });
  }

  for (const command of VFP_COMMANDS) {
    const insert = BLOCK_STARTERS.has(command.name.toUpperCase())
      ? `${command.name} `
      : command.name;
    add({
      label: command.name,
      kind: 'keyword',
      detail: 'Comando VFP',
      doc: command.sig,
      sig: command.sig || command.name,
      insert,
      caretOffset: insert.length,
    });
  }

  for (const name of VFP_BASE_CLASSES) {
    const display = baseClassName(name);
    add({ label: display, kind: 'class', detail: 'Classe base VFP', sig: display });
  }

  if (context.sql) {
    for (const word of VFP_SQL_WORDS) {
      add({ label: word, kind: 'sql', detail: 'SQL', sig: word });
    }
  }

  return items;
}

function filterItems(items, prefix) {
  const query = String(prefix || '').toLowerCase();
  const ranked = [];

  for (const item of items) {
    const label = String(item.label || '').toLowerCase();
    let score;
    if (!query) score = 0;
    else if (label === query) score = 0;
    else if (label.startsWith(query)) score = 1;
    else if (label.includes(query)) score = 2;
    else continue;
    ranked.push({ item, score });
  }

  ranked.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    const pa = KIND_PRIORITY[a.item.kind] ?? 9;
    const pb = KIND_PRIORITY[b.item.kind] ?? 9;
    if (pa !== pb) return pa - pb;
    const lengthDiff = String(a.item.label).length - String(b.item.label).length;
    if (lengthDiff) return lengthDiff;
    return String(a.item.label).localeCompare(String(b.item.label), 'pt-BR');
  });

  return ranked.slice(0, 80).map((entry) => entry.item);
}

function openCompletion({ manual = false } = {}) {
  if (!editorVisible()) {
    closeCompletion();
    return;
  }
  if (!manual && state.completion.suppress) return;

  const context = completionContext(manual);
  if (!context) {
    closeCompletion();
    return;
  }

  let items = [];
  if (context.kind === 'members') items = buildMemberItems(context);
  else if (context.kind === 'classes') items = buildClassItems(context);
  else items = buildGeneralItems(context);

  const filtered = filterItems(items, context.prefix);
  if (!filtered.length) {
    closeCompletion();
    return;
  }

  const previous = state.completion.open ? state.completion.items[state.completion.index] : null;
  const keepIndex = previous
    ? filtered.findIndex((item) => item.label === previous.label && item.kind === previous.kind)
    : -1;

  state.completion.open = true;
  state.completion.items = filtered;
  state.completion.index = keepIndex >= 0 ? keepIndex : 0;
  state.completion.start = context.start;
  state.completion.end = context.end;
  state.completion.context = context;

  renderCompletionList();
  if (els.intelliPopup) els.intelliPopup.hidden = false;
  updateCompletionSelection(state.completion.index, { scroll: false });
  positionCompletion();
}

function renderCompletionList() {
  if (!els.intelliList) return;
  els.intelliList.textContent = '';

  state.completion.items.forEach((item, index) => {
    const node = document.createElement('li');
    node.className = 'intelli-item';
    node.id = `intelliItem${index}`;
    node.setAttribute('role', 'option');
    node.setAttribute('aria-selected', 'false');
    node.dataset.index = String(index);

    const badge = document.createElement('span');
    badge.className = `intelli-kind k-${item.kind}`;
    badge.textContent = KIND_LETTER[item.kind] || '·';

    const label = document.createElement('span');
    label.className = 'intelli-label';
    label.textContent = item.label;

    const detail = document.createElement('span');
    detail.className = 'intelli-detail';
    detail.textContent = item.detail || '';

    node.append(badge, label, detail);
    node.addEventListener('mousedown', (event) => event.preventDefault());
    node.addEventListener('click', () => acceptCompletion(index));
    node.addEventListener('mouseenter', () => updateCompletionSelection(index, { scroll: false }));
    els.intelliList.append(node);
  });
}

function updateCompletionSelection(index, { scroll = true } = {}) {
  if (!state.completion.open || !state.completion.items.length) return;
  const count = state.completion.items.length;
  const next = ((index % count) + count) % count;
  state.completion.index = next;

  const nodes = els.intelliList ? els.intelliList.querySelectorAll('.intelli-item') : [];
  nodes.forEach((node, i) => node.setAttribute('aria-selected', String(i === next)));
  const active = nodes[next];
  if (active && scroll) active.scrollIntoView({ block: 'nearest' });

  const item = state.completion.items[next];
  if (els.intelliHelp && item) {
    els.intelliHelp.textContent = '';
    const strong = document.createElement('strong');
    strong.textContent = item.sig || item.label;
    const doc = document.createElement('span');
    doc.textContent = item.doc || item.detail || '';
    els.intelliHelp.append(strong, doc);
  }
  if (els.preview && active) els.preview.setAttribute('aria-activedescendant', active.id);
}

function caretPoint() {
  const ta = els.preview;
  const style = window.getComputedStyle(ta);
  const mirror = document.createElement('div');
  mirror.setAttribute('aria-hidden', 'true');
  mirror.style.cssText =
    'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;z-index:-1;' +
    'overflow:hidden;white-space:pre;overflow-wrap:normal;word-break:normal;border:0;';
  mirror.style.width = `${ta.clientWidth}px`;
  mirror.style.boxSizing = 'border-box';
  mirror.style.fontFamily = style.fontFamily;
  mirror.style.fontSize = style.fontSize;
  mirror.style.fontWeight = style.fontWeight;
  mirror.style.fontStyle = style.fontStyle;
  mirror.style.letterSpacing = style.letterSpacing;
  mirror.style.lineHeight = style.lineHeight;
  mirror.style.tabSize = style.tabSize;
  mirror.style.padding = style.padding;
  mirror.textContent = ta.value.slice(0, ta.selectionStart);

  const marker = document.createElement('span');
  marker.textContent = '\u200b';
  mirror.append(marker);
  document.body.append(mirror);

  const taRect = ta.getBoundingClientRect();
  const x = taRect.left + marker.offsetLeft - ta.scrollLeft;
  const y = taRect.top + marker.offsetTop - ta.scrollTop;
  const lineHeight = parseFloat(style.lineHeight) || 18;
  mirror.remove();
  return { x, y, lineHeight };
}

function positionCompletion() {
  const popup = els.intelliPopup;
  if (!popup || popup.hidden) return;

  const point = caretPoint();
  const rect = popup.getBoundingClientRect();
  const margin = 8;
  let left = point.x;
  let top = point.y + point.lineHeight + 4;

  if (left + rect.width > window.innerWidth - margin) {
    left = window.innerWidth - rect.width - margin;
  }
  if (left < margin) left = margin;

  if (top + rect.height > window.innerHeight - margin) {
    top = point.y - rect.height - 6;
  }
  if (top < margin) top = Math.max(margin, window.innerHeight - rect.height - margin);

  popup.style.left = `${Math.round(left)}px`;
  popup.style.top = `${Math.round(top)}px`;
}

function acceptCompletion(index = state.completion.index) {
  if (!state.completion.open) return;
  const item = state.completion.items[index];
  if (!item) return;

  const ta = els.preview;
  const end = ta.selectionStart;
  // Recalcula o prefixo atual: o usuário pode ter digitado desde que o popup abriu.
  const start = wordRangeAt(ta.value, end).start;
  let insert = item.insert != null ? item.insert : item.label;
  let caretOffset = item.caretOffset != null ? item.caretOffset : insert.length;
  const after = ta.value.slice(end);

  if (item.kind === 'function' && after.startsWith('(')) {
    if (insert.endsWith('()')) {
      insert = insert.slice(0, -2);
      caretOffset = insert.length;
    } else if (insert.endsWith('(')) {
      insert = insert.slice(0, -1);
      caretOffset = insert.length;
    }
  }
  if (
    item.kind === 'keyword' &&
    BLOCK_STARTERS.has(String(item.label).toUpperCase()) &&
    after &&
    !/^\s/.test(after) &&
    !insert.endsWith(' ')
  ) {
    insert += ' ';
    caretOffset = insert.length;
  }

  state.completion.suppress = true;
  closeCompletion();

  ta.focus();
  ta.setSelectionRange(start, end);
  let inserted = false;
  try {
    inserted = document.execCommand('insertText', false, insert);
  } catch {
    inserted = false;
  }
  if (!inserted) {
    ta.setRangeText(insert, start, end, 'end');
  }

  const caret = start + caretOffset;
  ta.setSelectionRange(caret, caret);
  state.text = ta.value;
  setEditorDirty(true);
  renderEditor();
  updateCursorStatus();
  updateEditorInfo(state.text);
  setTimeout(() => {
    state.completion.suppress = false;
  }, 250);
}

function onEditorKeyDown(event) {
  if (state.completion.open) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      updateCompletionSelection(state.completion.index + 1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      updateCompletionSelection(state.completion.index - 1);
      return;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      acceptCompletion();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCompletion();
      return;
    }
    if (event.key === 'Home' || event.key === 'End' || event.key === 'PageUp' || event.key === 'PageDown') {
      closeCompletion();
    }
  }

  if ((event.ctrlKey || event.metaKey) && (event.key === ' ' || event.key.toLowerCase() === 'j')) {
    event.preventDefault();
    openCompletion({ manual: true });
    return;
  }

  if (event.key === 'Escape' && state.expanded) {
    event.preventDefault();
    setExpanded(false);
    return;
  }

  if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    insertPlainText('\t');
  }
}

function insertPlainText(text) {
  if (!els.preview) return;
  const ta = els.preview;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  ta.setRangeText(text, start, end, 'end');
  state.text = ta.value;
  setEditorDirty(true);
  renderEditor();
  updateCursorStatus();
  updateEditorInfo(state.text);
}

function onEditorScroll() {
  syncEditorScroll();
  closeCompletion();
}

function onEditorKeyUp(event) {
  if (state.completion.open) return;
  if (
    ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(
      event.key,
    )
  ) {
    updateCursorStatus();
  }
}

function onEditorSelectionChange() {
  if (document.activeElement === els.preview) updateCursorStatus();
}

function onEditorBlur() {
  setTimeout(() => {
    if (document.activeElement !== els.preview) closeCompletion();
  }, 150);
}

function setServer(ok, label) {
  state.serverOk = ok;
  els.serverDot.classList.toggle('ok', ok);
  els.serverDot.classList.toggle('off', !ok);
  els.serverText.textContent = label;
}

function setStatus(message, kind = '', busy = false) {
  els.status.className = `status ${kind}`.trim();
  els.status.textContent = '';
  if (busy) {
    const spinner = document.createElement('span');
    spinner.className = 'busy';
    els.status.append(spinner);
  }
  els.status.append(document.createTextNode(message));
}

function setBusy(busy) {
  state.busy = busy;
  const locked = !state.allowed;
  const form = getSelectedForm();
  const canExtract = Boolean(form && findSct(form));
  els.extractBtn.disabled = busy || locked || !canExtract;
  els.insertBtn.disabled = busy || locked || !canExtract;
  els.insertTextBtn.disabled = busy || locked || els.previewBox.hidden;
  els.formSelect.disabled = busy || locked || state.forms.length === 0;
  els.folderInput.disabled = busy || locked;
}

/* ------------------------------------------------------------------
 * Ativação: apenas em aba do Gemini (gemini.google.com) com conta logada.
 * O service worker monitora a aba; aqui só refletimos o estado na interface.
 * ------------------------------------------------------------------ */

function showGate(mode) {
  state.accessMode = mode;
  document.body.dataset.access = mode;
  els.gate.hidden = false;
  els.main.hidden = true;

  if (mode === 'logged-out') {
    els.gateTitle.textContent = 'Entre na sua conta Google';
    els.gateText.textContent =
      'Detectamos o Gemini, mas nenhuma conta está logada nesta aba. O painel é liberado automaticamente assim que o login for reconhecido.';
    els.gateAction.dataset.action = 'login';
    els.gateAction.textContent = 'Abrir tela de login';
    els.gateNote.textContent = 'O código só é anexado quando há uma conta logada.';
  } else if (mode === 'not-gemini') {
    els.gateTitle.textContent = 'Abra o Gemini para começar';
    els.gateText.textContent =
      'Esta extensão é ativada apenas em uma aba do Gemini (gemini.google.com).';
    els.gateAction.dataset.action = 'open-gemini';
    els.gateAction.textContent = 'Abrir Gemini';
    els.gateNote.textContent =
      'Depois de abrir a aba do Gemini, o painel é liberado automaticamente.';
  } else if (mode === 'error') {
    els.gateTitle.textContent = 'Não foi possível verificar a aba';
    els.gateText.textContent =
      'O componente da extensão não respondeu. Recarregue a extensão em chrome://extensions e tente novamente.';
    els.gateAction.dataset.action = 'open-gemini';
    els.gateAction.textContent = 'Abrir Gemini';
    els.gateNote.textContent = '';
  } else {
    els.gateTitle.textContent = 'Verificando a aba…';
    els.gateText.textContent = 'Confirmando se o Gemini está aberto e com uma conta logada.';
    els.gateAction.dataset.action = 'open-gemini';
    els.gateAction.textContent = 'Abrir Gemini';
    els.gateNote.textContent = 'A extensão só é ativada em uma aba do Gemini com conta Google logada.';
  }

  els.gateAction.hidden = mode === 'checking';
  setBusy(state.busy);
}

function renderAccess(info) {
  const isGemini = Boolean(info?.isGemini);
  const loggedIn = Boolean(info?.loggedIn);
  const allowed = Boolean(info?.allowed ?? (isGemini && loggedIn));
  const mode = allowed ? 'ready' : isGemini ? 'logged-out' : 'not-gemini';

  const changed = mode !== state.accessMode;
  state.allowed = allowed;
  state.tabId = info?.tabId ?? null;

  if (!allowed) {
    showGate(mode);
    return;
  }

  state.accessMode = mode;
  document.body.dataset.access = mode;
  els.gate.hidden = true;
  els.main.hidden = false;
  if (changed) setStatus('');
  setBusy(state.busy);
}

let accessInFlight = null;
let accessTimer = 0;

function scheduleAccessCheck(delay = 250) {
  clearTimeout(accessTimer);
  accessTimer = setTimeout(() => {
    refreshAccess();
  }, delay);
}

async function refreshAccess({ force = false } = {}) {
  if (accessInFlight) return accessInFlight;

  accessInFlight = (async () => {
    let info = null;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      info = await chrome.runtime.sendMessage({
        type: 'fox2txt:get-access',
        tabId: tab?.id,
        force,
      });
    } catch {
      info = null;
    }

    if (!info) {
      state.allowed = false;
      showGate('error');
      return;
    }
    renderAccess(info);
  })().finally(() => {
    accessInFlight = null;
  });

  return accessInFlight;
}

async function onGateAction() {
  const login = els.gateAction.dataset.action === 'login';
  els.gateAction.disabled = true;
  try {
    await chrome.runtime.sendMessage({ type: 'fox2txt:open-gemini', login });
  } catch {
    /* o service worker avisa; o botão "Verificar novamente" continua disponível */
  } finally {
    els.gateAction.disabled = false;
  }
  setTimeout(() => refreshAccess({ force: true }), 800);
  setTimeout(() => refreshAccess({ force: true }), 3000);
}

function getMode() {
  return document.querySelector('input[name="mode"]:checked')?.value || 'classbrowser';
}

function getSelectedForm() {
  const path = els.formSelect.value;
  return state.forms.find((form) => form.path === path) || null;
}

function findSct(form) {
  return state.byPath.get(norm(form.path.replace(/\.scx$/i, '.sct'))) || null;
}

async function checkHealth() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${API}/health`, { signal: controller.signal, cache: 'no-store' });
    const data = await response.json();
    if (data.ok) {
      setServer(true, data.busy ? 'ocupado' : 'online');
    } else {
      setServer(false, 'VFP ausente');
    }
  } catch {
    setServer(false, 'offline');
  } finally {
    clearTimeout(timer);
  }
}

function onFolderSelected() {
  const files = Array.from(els.folderInput.files || []);
  if (!files.length) return;

  state.byPath = new Map(files.map((file) => [norm(file.webkitRelativePath || file.name), file]));
  state.rootName = (files[0].webkitRelativePath || files[0].name).split('/')[0];
  state.forms = files
    .filter((file) => /\.scx$/i.test(file.name))
    .map((file) => ({ file, path: norm(file.webkitRelativePath || file.name) }))
    .sort((a, b) => a.path.localeCompare(b.path, 'pt-BR'));

  els.formSelect.innerHTML = '';

  if (!state.forms.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Nenhum arquivo .scx encontrado nesta pasta';
    els.formSelect.append(option);
    els.formSelect.disabled = true;
    els.folderInfo.textContent = `${state.rootName} — nenhum formulário .scx`;
    els.formMeta.textContent = '';
    setBusy(false);
    return;
  }

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = `Selecione um formulário (${state.forms.length})…`;
  els.formSelect.append(placeholder);

  for (const form of state.forms) {
    const option = document.createElement('option');
    option.value = form.path;
    option.textContent = form.file.webkitRelativePath || form.file.name;
    els.formSelect.append(option);
  }

  els.formSelect.disabled = false;
  els.folderInfo.textContent = `${state.rootName} — ${state.forms.length} formulário(s) .scx`;
  els.formMeta.textContent = '';
  setBusy(false);
  setStatus('');
}

const EDITOR_INFO_DEFAULT =
  'A prévia é editável: o texto alterado é usado em Copiar, Baixar e Inserir como texto.';

function resetPreview() {
  state.text = '';
  state.attachmentName = '';
  state.extractedFormPath = '';
  state.extractedMode = '';

  closeCompletion();
  setExpanded(false, { focus: false });
  resetLayout();
  setEditorDirty(false);

  els.previewBox.hidden = true;
  if (els.preview) {
    els.preview.value = '';
    els.preview.scrollTop = 0;
    els.preview.scrollLeft = 0;
  }
  if (els.previewHighlight) els.previewHighlight.innerHTML = '';
  if (els.previewGutter) els.previewGutter.textContent = '1';
  if (els.editorCursor) els.editorCursor.textContent = 'Ln 1, Col 1';
  if (els.editorInfo) els.editorInfo.textContent = EDITOR_INFO_DEFAULT;
  els.previewStats.textContent = '';
  els.copyBtn.disabled = true;
  els.downloadBtn.disabled = true;
  els.insertTextBtn.disabled = true;
}

function onFormSelected() {
  const form = getSelectedForm();
  if (!form) {
    els.formMeta.textContent = '';
    resetPreview();
    setBusy(false);
    return;
  }

  const sct = findSct(form);
  const parts = [fmtBytes(form.file.size)];
  parts.push(
    sct
      ? `memo .sct (${fmtBytes(sct.size)})`
      : 'sem .sct na pasta — selecione a pasta que contém o .scx e o .sct',
  );
  els.formMeta.textContent = parts.join(' · ');
  resetPreview();
  setBusy(false);
}

async function readBase64(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function showResult(data) {
  const stats = data.stats || {};
  const statsParts = [
    fmtInt(stats.chars) + ' caracteres',
    fmtInt(stats.lines) + ' linhas',
    fmtBytes(stats.bytes),
    `VFP ${stats.vfpMs} ms`,
    `total ${(stats.totalMs / 1000).toFixed(1)} s`,
  ];
  if (stats.layout) statsParts.push(`${fmtInt(stats.layout)} objeto(s) no layout`);
  els.previewStats.textContent = statsParts.join(' · ');

  state.text = data.text || '';
  state.layout =
    data.layout && Array.isArray(data.layout.objects) && data.layout.objects.length
      ? data.layout
      : null;
  els.previewBox.hidden = false;

  if (els.tabLayout) {
    els.tabLayout.disabled = !state.layout;
    els.tabLayout.title = state.layout
      ? 'Ver a prévia visual do formulário'
      : 'Layout indisponível para esta extração';
  }
  if (state.layout) {
    setPreviewView('layout');
  } else {
    state.layoutSize = { width: 0, height: 0 };
    state.layoutScale = 1;
    state.layoutFit = true;
    setPreviewView('code');
  }
  renderLayout();

  els.preview.value = state.text;
  els.preview.scrollTop = 0;
  els.preview.scrollLeft = 0;
  els.preview.setSelectionRange(0, 0);
  setEditorDirty(false);
  renderEditor();
  updateCursorStatus();
  updateEditorInfo();

  els.copyBtn.disabled = !state.text;
  els.downloadBtn.disabled = !state.text;
  els.insertTextBtn.disabled = !state.text || !state.allowed;
}

async function extract({ insert }) {
  if (state.busy) return;
  if (!state.allowed) {
    setStatus(
      'A extensão só é ativada em uma aba do Gemini com conta Google logada. Abra o Gemini e faça login.',
      'error',
    );
    refreshAccess({ force: true });
    return;
  }
  const form = getSelectedForm();
  if (!form) return;

  setBusy(true);

  try {
    // Se a prévia do formulário atual foi editada, anexa o texto editado
    // diretamente em vez de extrair de novo e perder as alterações.
    const useEdited =
      insert &&
      state.editorDirty &&
      Boolean(state.text) &&
      state.extractedFormPath === form.path &&
      String(state.extractedMode).toLowerCase() === getMode().toLowerCase() &&
      Boolean(state.attachmentName);

    if (useEdited) {
      await attachTextToGemini(state.text, state.attachmentName, { edited: true });
      return;
    }

    setStatus('Lendo arquivos do formulário…', '', true);

    const sctFile = findSct(form);
    if (!sctFile) {
      throw new Error(
        'O arquivo .sct (memo) não está na pasta selecionada. Selecione a pasta que contém o .scx e o .sct juntos.',
      );
    }

    const scx = await readBase64(form.file);
    const sct = await readBase64(sctFile);
    const mode = getMode();

    setStatus(
      mode === 'classbrowser'
        ? 'Extraindo com o Class Browser do VFP…'
        : 'Extraindo com o SCCTEXT do VFP…',
      '',
      true,
    );

    const started = performance.now();
    const response = await fetch(`${API}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: form.file.name, mode, scx, sct }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      throw new Error(data.error || `Falha HTTP ${response.status}`);
    }

    state.text = data.text;
    state.fileName = form.file.name;
    const usedMode = data.stats?.mode || mode;
    const baseName =
      String(form.file.name)
        .replace(/\.[^.]+$/, '')
        .replace(/[\\/:*?"<>|]+/g, '_') || 'formulario';
    state.attachmentName = `${baseName}.${usedMode}.txt`;
    state.extractedFormPath = form.path;
    state.extractedMode = usedMode;
    showResult(data);

    const seconds = ((performance.now() - started) / 1000).toFixed(1);
    setStatus(
      `Extração concluída: ${fmtInt(data.stats.chars)} caracteres em ${seconds}s.`,
      'ok',
    );

    if (insert) {
      await attachTextToGemini(data.text, state.attachmentName);
    }
  } catch (error) {
    const message = error?.message || String(error);
    if (/failed to fetch|networkerror|load failed|fetch/i.test(message) || !state.serverOk) {
      setStatus(
        'Servidor local offline. Execute server\\start-server.cmd (ou "npm start" em server\\) e tente de novo.',
        'error',
      );
    } else {
      setStatus(message, 'error');
    }
    checkHealth();
  } finally {
    setBusy(false);
  }
}

async function attachTextToGemini(text, fileName, { edited = false } = {}) {
  setStatus(`Anexando ${fileName}${edited ? ' (prévia editada)' : ''} ao Gemini…`, '', true);
  const result = await attachToGemini({ text, fileName });
  const how = result.method === 'drop' ? 'arrastado' : 'selecionado';
  setStatus(
    `Arquivo ${result.fileName} anexado ao Gemini (${how})${edited ? ' com as edições da prévia' : ''}. ` +
      'Escreva sua mensagem e pressione Enter para enviar.',
    'ok',
  );
  return result;
}

async function ensureGeminiTab() {
  const [current] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (current?.id != null && /^https:\/\/gemini\.google\.com\//.test(current.url || '')) {
    if (current.status !== 'complete') {
      await waitForTab(current.id, 30000);
      await sleep(1000);
    }
    return current;
  }

  const tabs = await chrome.tabs.query({ url: 'https://gemini.google.com/*' });
  const existing = tabs.find((tab) => tab.active) || tabs[0];

  if (existing) {
    await chrome.tabs.update(existing.id, { active: true });
    if (existing.windowId) {
      await chrome.windows.update(existing.windowId, { focused: true }).catch(() => {});
    }
    if (existing.status !== 'complete') {
      await waitForTab(existing.id, 30000);
      await sleep(1000);
    }
    return existing;
  }

  const created = await chrome.tabs.create({ url: 'https://gemini.google.com/app', active: true });
  await waitForTab(created.id, 30000);
  await sleep(1500);
  return created;
}

async function waitForTab(tabId, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.status === 'complete') return tab;
    } catch {
      throw new Error('A aba do Gemini foi fechada.');
    }
    await sleep(500);
  }
  throw new Error('O Gemini demorou demais para carregar.');
}

async function attachToGemini({ text, fileName }) {
  const tab = await ensureGeminiTab();
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const [injection] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: attachFileInPage,
        args: [text, fileName],
      });

      const result = injection?.result;
      if (!result) {
        throw new Error(injection?.error?.message || 'A página do Gemini não respondeu.');
      }
      if (!result.ok) {
        throw new Error(result.error || 'Falha ao anexar o arquivo no Gemini.');
      }
      return result;
    } catch (error) {
      const message = error?.message || String(error);
      if (/cannot access|no tab|tab was closed|frame.*removed|executeScript|nothing to inject/i.test(message)) {
        lastError = error;
        await sleep(800);
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Não foi possível falar com a aba do Gemini.');
}

async function insertTextInGemini(text) {
  const tab = await ensureGeminiTab();
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: 'MAIN',
    func: insertTextInPage,
    args: [text],
  });

  const result = injection?.result;
  if (!result) {
    throw new Error(injection?.error?.message || 'A página do Gemini não respondeu.');
  }
  if (!result.ok) {
    throw new Error(result.error || 'Falha ao inserir o texto no Gemini.');
  }
  return result;
}

/**
 * Plano B: insere o código como texto no editor do Gemini.
 * Executada no mundo principal para acessar a instância Quill do editor.
 */
async function insertTextInPage(text) {
  try {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const findEditor = () => {
      const selectors = [
        'rich-textarea .ql-editor[contenteditable="true"]',
        'rich-textarea [contenteditable="true"]',
        'div.ql-editor[contenteditable="true"]',
        '[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"]',
      ];
      for (const selector of selectors) {
        const nodes = Array.from(document.querySelectorAll(selector));
        const visible = nodes.find((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        if (visible) return visible;
        if (nodes.length) return nodes[0];
      }
      return null;
    };

    let editor = findEditor();
    const deadline = Date.now() + 8000;
    while (!editor && Date.now() < deadline) {
      await sleep(250);
      editor = findEditor();
    }
    if (!editor) {
      throw new Error(
        'Campo de mensagem do Gemini não encontrado. Faça login e abra gemini.google.com/app.',
      );
    }

    const bodyText = (document.body.innerText || '').toLowerCase();
    if (
      bodyText.includes('faça login para testar as ferramentas') ||
      bodyText.includes('sign in to test tools')
    ) {
      throw new Error(
        'O Gemini não está logado nesta aba. Faça login em gemini.google.com e tente novamente.',
      );
    }

    editor.focus();
    const host = editor.closest('rich-textarea') || editor.parentElement;
    const quill = (host && host.__quill) || editor.__quill || null;

    if (quill && typeof quill.insertText === 'function') {
      try {
        quill.insertText(quill.getLength(), text, 'user');
        quill.setSelection(quill.getLength(), 0);
        await sleep(80);
        return { ok: true, method: 'quill', chars: text.length };
      } catch {
        /* tenta o próximo método */
      }
    }

    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    let inserted = false;
    try {
      inserted = document.execCommand('insertText', false, text);
    } catch {
      inserted = false;
    }
    if (inserted) return { ok: true, method: 'execCommand', chars: text.length };

    editor.textContent = `${editor.textContent || ''}${text}`;
    editor.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }),
    );
    return { ok: true, method: 'dom', chars: text.length };
  } catch (error) {
    return { ok: false, error: error && error.message ? error.message : String(error) };
  }
}

/**
 * Executada no mundo principal da página (chrome.scripting world: "MAIN").
 *
 * Precisa rodar no mundo da página porque o Gemini lê `event.dataTransfer`
 * em listeners Angular; objetos sintéticos criados no mundo isolado do
 * content script não são visíveis para eles.
 *
 * Deve ser autocontida: só recebe `text` e `fileName` por argumento.
 */
async function attachFileInPage(text, fileName) {
  try {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const isVisible = (el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const findEditor = () => {
      const selectors = [
        'rich-textarea .ql-editor[contenteditable="true"]',
        'rich-textarea [contenteditable="true"]',
        'div.ql-editor[contenteditable="true"]',
        '[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"]',
      ];
      for (const selector of selectors) {
        const nodes = Array.from(document.querySelectorAll(selector));
        const visible = nodes.find(isVisible);
        if (visible) return visible;
        if (nodes.length) return nodes[0];
      }
      return null;
    };

    const findDropZone = () => {
      const editor = findEditor();
      if (editor) {
        const zone = editor.closest('.xap-uploader-dropzone');
        if (zone) return zone;
      }
      const zones = Array.from(document.querySelectorAll('.xap-uploader-dropzone'));
      return zones.find(isVisible) || zones[0] || null;
    };

    const findFileInput = () => {
      const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
      return (
        inputs.find((input) => /\.txt|text\/plain/i.test(input.accept || '')) ||
        inputs.find((input) => input.multiple) ||
        inputs[0] ||
        null
      );
    };

    const countChips = () => document.querySelectorAll('[data-test-id="uploaded-file"]').length;
    const countErrors = () =>
      document.querySelectorAll(
        '.gem-attachment-loading-error, [data-test-id="file-preview-error"]',
      ).length;
    const countNames = (needle) => {
      const labels = document.querySelectorAll(
        '[data-test-id="filename-label"], [data-test-id="uploaded-file"]',
      );
      let count = 0;
      for (const label of labels) {
        if ((label.textContent || '').toLowerCase().includes(needle)) count += 1;
      }
      return count;
    };
    const mark = () => ({
      chips: countChips(),
      names: countNames(fileName.toLowerCase()),
      errors: countErrors(),
    });
    const waitForAttachment = async (needle, baseline) => {
      const deadline = Date.now() + 6000;
      while (Date.now() < deadline) {
        if (countErrors() > baseline.errors) return false;
        if (countChips() > baseline.chips || countNames(needle) > baseline.names) return true;
        await sleep(200);
      }
      return false;
    };

    const file = new File([text], fileName, {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    let zone = findDropZone();
    let input = findFileInput();
    const readyDeadline = Date.now() + 8000;
    while (!zone && !input && Date.now() < readyDeadline) {
      await sleep(250);
      zone = findDropZone();
      input = findFileInput();
    }

    // 1) Drop sintético: é o mesmo caminho do arrastar-e-soltar nativo.
    if (zone) {
      const baseline = mark();
      const dataTransfer = {
        types: ['Files'],
        items: [],
        files: [file],
        effectAllowed: 'all',
        dropEffect: 'copy',
        getData: () => '',
        setData: () => {},
        clearData: () => {},
      };

      try {
        for (const type of ['dragenter', 'dragover', 'drop']) {
          const event = new Event(type, { bubbles: true, cancelable: true });
          Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
          zone.dispatchEvent(event);
        }
      } catch {
        /* tenta o input de arquivo abaixo */
      }

      if (await waitForAttachment(fileName.toLowerCase(), baseline)) {
        return { ok: true, method: 'drop', fileName, bytes: file.size };
      }
    }

    // 2) Fallback: input[type=file] do menu "Envio e ferramentas".
    if (!input) {
      const menuOpen = Array.from(document.querySelectorAll('[role="menu"]')).some(isVisible);
      const toolsButton = Array.from(document.querySelectorAll('button[aria-label]')).find((button) =>
        /envio e ferramentas|enviar e ferramentas|send and tools|ferramentas|tools/i.test(
          button.getAttribute('aria-label') || '',
        ),
      );
      if (toolsButton && !menuOpen) {
        toolsButton.click();
        const inputDeadline = Date.now() + 2000;
        while (!findFileInput() && Date.now() < inputDeadline) await sleep(100);
        input = findFileInput();
      }
    }

    if (input) {
      const baseline = mark();
      try {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } catch {
        /* cai no diagnóstico abaixo */
      }

      if (await waitForAttachment(fileName.toLowerCase(), baseline)) {
        return { ok: true, method: 'input', fileName, bytes: file.size };
      }
    }

    const bodyText = (document.body.innerText || '').toLowerCase();
    if (bodyText.includes('fazer login') || bodyText.includes('sign in')) {
      throw new Error(
        'O Gemini não está logado nesta aba. Faça login em gemini.google.com e tente novamente.',
      );
    }
    if (!zone && !input) {
      throw new Error(
        'Área de anexos do Gemini não encontrada. Abra gemini.google.com/app, faça login e deixe o campo de mensagem visível.',
      );
    }
    if (bodyText.includes('não é compatível') || bodyText.includes('not compatible')) {
      throw new Error('O Gemini recusou o arquivo .txt (formato não compatível).');
    }
    throw new Error(
      `O arquivo ${fileName} não apareceu como anexo no Gemini. Verifique se o campo de mensagem está disponível e tente novamente.`,
    );
  } catch (error) {
    return { ok: false, error: error && error.message ? error.message : String(error) };
  }
}

async function insertTextFallback() {
  if (!state.text || state.busy) return;
  if (!state.allowed) {
    setStatus(
      'A extensão só é ativada em uma aba do Gemini com conta Google logada.',
      'error',
    );
    return;
  }
  setBusy(true);
  setStatus('Abrindo o Gemini e inserindo o código como texto…', '', true);
  try {
    const result = await insertTextInGemini(state.text);
    const method =
      result.method === 'quill' ? 'Quill' : result.method === 'execCommand' ? 'editor' : 'DOM';
    setStatus(
      `Código inserido como texto (${method}). Revise e pressione Enter para enviar.`,
      'ok',
    );
  } catch (error) {
    setStatus(error?.message || String(error), 'error');
  } finally {
    setBusy(false);
  }
}

async function copyText() {
  if (!state.text) return;
  try {
    await navigator.clipboard.writeText(state.text);
    setStatus('Código copiado para a área de transferência.', 'ok');
  } catch {
    setStatus('Não foi possível copiar. Use a prévia para selecionar o texto.', 'error');
  }
}

function downloadText() {
  if (!state.text) return;
  const blob = new Blob([state.text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download =
    state.attachmentName ||
    `${state.fileName.replace(/\.[^.]+$/, '') || 'formulario'}.${getMode()}.txt`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function init() {
  showGate('checking');
  els.folderInput.addEventListener('change', onFolderSelected);
  els.formSelect.addEventListener('change', onFormSelected);
  els.extractBtn.addEventListener('click', () => extract({ insert: false }));
  els.insertBtn.addEventListener('click', () => extract({ insert: true }));
  els.copyBtn.addEventListener('click', copyText);
  els.downloadBtn.addEventListener('click', downloadText);
  els.insertTextBtn.addEventListener('click', insertTextFallback);
  if (els.themeToggle) els.themeToggle.addEventListener('click', toggleTheme);
  els.gateAction.addEventListener('click', onGateAction);
  els.gateRetry.addEventListener('click', () => refreshAccess({ force: true }));

  // Editor da prévia + IntelliSense.
  if (els.preview) {
    els.preview.addEventListener('input', onEditorInput);
    els.preview.addEventListener('scroll', onEditorScroll);
    els.preview.addEventListener('keydown', onEditorKeyDown);
    els.preview.addEventListener('keyup', onEditorKeyUp);
    els.preview.addEventListener('click', updateCursorStatus);
    els.preview.addEventListener('blur', onEditorBlur);
  }
  document.addEventListener('selectionchange', onEditorSelectionChange);
  if (els.expandBtn) els.expandBtn.addEventListener('click', toggleExpanded);
  if (els.tabCode) els.tabCode.addEventListener('click', () => setPreviewView('code'));
  if (els.tabLayout) {
    els.tabLayout.addEventListener('click', () => {
      if (state.layout) setPreviewView('layout');
    });
  }
  if (els.layoutZoom) {
    els.layoutZoom.addEventListener('input', () => {
      state.layoutFit = false;
      setLayoutScale(Number(els.layoutZoom.value) / 100);
    });
  }
  if (els.layoutFitBtn) els.layoutFitBtn.addEventListener('click', fitLayout);
  window.addEventListener('resize', () => {
    if (state.completion.open) positionCompletion();
    if (state.previewView === 'layout' && state.layoutFit) fitLayout();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (state.completion.open) {
      event.preventDefault();
      closeCompletion();
      return;
    }
    if (state.expanded) {
      event.preventDefault();
      setExpanded(false);
    }
  });

  // Mantém o painel sincronizado quando a aba ativa ou o login mudam.
  chrome.tabs.onActivated.addListener(() => scheduleAccessCheck(120));
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url || changeInfo.status === 'complete') scheduleAccessCheck(300);
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'fox2txt:access') scheduleAccessCheck(120);
  });
  setInterval(() => {
    if (!state.allowed) refreshAccess();
  }, 5000);

  for (const radio of document.querySelectorAll('input[name="mode"]')) {
    radio.addEventListener('change', () => {
      chrome.storage.local.set({ mode: getMode() }).catch(() => {});
      resetPreview();
    });
  }

  const stored = await loadStoredPreferences();
  const radio = document.querySelector(`input[name="mode"][value="${stored.mode}"]`);
  if (radio) radio.checked = true;

  const storedTheme =
    stored.theme === 'light' || stored.theme === 'dark' ? stored.theme : readBootTheme();
  applyThemePreference(storedTheme || 'system', {
    persist: storedTheme === 'light' || storedTheme === 'dark',
  });

  themeMedia.addEventListener('change', () => {
    if (themePreference === 'system') renderTheme();
  });

  await refreshAccess({ force: true });
  await checkHealth();
  setInterval(checkHealth, 20000);
}

init();

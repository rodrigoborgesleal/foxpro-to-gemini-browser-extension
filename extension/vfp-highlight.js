'use strict';
/**
 * vfp-highlight.js - realce de sintaxe Visual FoxPro 9 para a pre-visualizacao.
 *
 * Nao usa innerHTML com o codigo do usuario: cada token e escapado antes de
 * receber um <span>. As regras seguem o lexico do VFP 9 (comentarios * / NOTE /
 * &&, strings com " ' e [], datas {^...}, #DEFINE, TEXT ... ENDTEXT, macros &,
 * variaveis de sistema _SCREEN, THIS/THISFORM e PEMs depois do ponto).
 */
(function (root) {
  const LANG =
    root.VFP_LANGUAGE ||
    (typeof require === 'function' ? require('./vfp-language.js') : null) ||
    {};

  const KEYWORDS = new Set((LANG.KEYWORDS || []).map((s) => String(s).toUpperCase()));
  const SQL_KEYWORDS = new Set((LANG.SQL_KEYWORDS || []).map((s) => String(s).toUpperCase()));
  const SQL_WORDS = new Set();
  for (const phrase of SQL_KEYWORDS) {
    for (const word of phrase.split(/\s+/)) {
      if (word) SQL_WORDS.add(word);
    }
  }
  const FUNCTIONS = new Set((LANG.FUNCTIONS || []).map((f) => String(f.name).toUpperCase()));
  const BASE_CLASSES = new Set(
    (LANG.BASE_CLASS_NAMES || []).map((s) => String(s).toUpperCase()),
  );
  const SYSTEM_VARS = new Set((LANG.SYSTEM_VARS || []).map((s) => String(s).toUpperCase()));
  const CONSTANTS = new Set((LANG.CONSTANTS || []).map((s) => String(s).toUpperCase()));

  const PEMS = new Set();
  function addPems(bucket) {
    if (!bucket) return;
    for (const list of [bucket.properties, bucket.events, bucket.methods]) {
      for (const name of list || []) PEMS.add(String(name).toUpperCase());
    }
  }
  addPems(LANG.COMMON_PEM);
  for (const spec of Object.values(LANG.BASE_CLASSES || {})) addPems(spec);

  const THIS_WORDS = new Set([
    'THIS',
    'THISFORM',
    'THISFORMSET',
    'THIS_OBJECT',
    'THIS_PARENT',
    'THIS_ACCESS',
    'THIS_ASSIGN',
  ]);

  const SQL_START_RE =
    /^\s*(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+(?:CURSOR|TABLE|SQL|VIEW)|ALTER\s+TABLE|DROP\s+TABLE)\b/i;

  const DATE_RE =
    /\{\s*(?:\^?\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:[ ,:]+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)?|\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?|[:/])\s*\}/i;
  const NUMBER_RE = /^(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][-+]?\d+)?|\.\d+(?:[eE][-+]?\d+)?)/;
  const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*/;
  const MACRO_RE = /^&[A-Za-z_][A-Za-z0-9_]*\.?/;
  const BOOL_RE = /^\.[A-Za-z]+\./;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        default:
          return '&#39;';
      }
    });
  }

  function span(cls, value) {
    return `<span class="${cls}">${escapeHtml(value)}</span>`;
  }

  function nextNonSpace(line, index) {
    for (let i = index; i < line.length; i += 1) {
      if (!/\s/.test(line[i])) return line[i];
    }
    return '';
  }

  function prevNonSpace(line, index) {
    for (let i = index - 1; i >= 0; i -= 1) {
      if (!/\s/.test(line[i])) return line[i];
    }
    return '';
  }

  /** Consome uma string VFP: "...", '...' ou [...], com delimitador duplicado. */
  function scanString(line, start) {
    const open = line[start];
    const close = open === '[' ? ']' : open;
    let i = start + 1;
    while (i < line.length) {
      if (line[i] === close) {
        if (line[i + 1] === close) {
          i += 2;
          continue;
        }
        return i + 1;
      }
      i += 1;
    }
    return line.length;
  }

  function scanIdentifier(line, start) {
    const match = IDENT_RE.exec(line.slice(start));
    return match ? start + match[0].length : start + 1;
  }

  function classifyWord(word, prevChar, nextChar, flags) {
    const upper = word.toUpperCase();

    if (flags.expectEntity) {
      flags.expectEntity = false;
      return 'vfp-entity';
    }
    if (flags.expectType) {
      flags.expectType = false;
      return BASE_CLASSES.has(upper) ? 'vfp-type' : 'vfp-entity';
    }
    if (flags.expectDefine) {
      flags.expectDefine = false;
      return 'vfp-constant';
    }
    if (THIS_WORDS.has(upper)) return 'vfp-this';
    if (upper.startsWith('_') || SYSTEM_VARS.has(upper)) return 'vfp-system';
    if (CONSTANTS.has(upper)) return 'vfp-constant';

    const isCall = nextChar === '(';
    if (isCall && FUNCTIONS.has(upper)) return 'vfp-function';
    if (prevChar === '.' && PEMS.has(upper)) return 'vfp-pem';
    if (flags.sql && SQL_WORDS.has(upper)) return 'vfp-sql';
    if (nextChar === '=' && PEMS.has(upper)) return 'vfp-pem';
    if (KEYWORDS.has(upper)) return 'vfp-keyword';
    if (FUNCTIONS.has(upper)) return 'vfp-function';
    return '';
  }

  /**
   * Realca um trecho que nao e o inicio de uma linha de pre-processador.
   * Retorna HTML escapado.
   */
  function scanSegment(line, flags) {
    let out = '';
    let i = 0;

    while (i < line.length) {
      const ch = line[i];

      // Comentario de linha && (fora de string). No VFP, && comenta o resto.
      if (ch === '&' && line[i + 1] === '&') {
        out += span('vfp-comment', line.slice(i));
        break;
      }

      // Strings "..." / '...' / [...]
      if (ch === '"' || ch === "'" || ch === '[') {
        const end = scanString(line, i);
        out += span('vfp-string', line.slice(i, end));
        i = end;
        continue;
      }

      // Data/datahora literal: {^2024-01-01}, {}, {12:30}
      if (ch === '{') {
        const rest = line.slice(i);
        const match = DATE_RE.exec(rest);
        if (match && match.index === 0) {
          out += span('vfp-date', match[0]);
          i += match[0].length;
          continue;
        }
      }

      // Numero (inclui hexadecimal e moeda $).
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(line[i + 1] || ''))) {
        const match = NUMBER_RE.exec(line.slice(i));
        if (match) {
          out += span('vfp-number', match[0]);
          i += match[0].length;
          continue;
        }
      }

      // $123.45 (moeda)
      if (ch === '$' && /[0-9]/.test(line[i + 1] || '')) {
        const match = NUMBER_RE.exec(line.slice(i + 1));
        if (match) {
          out += span('vfp-number', `$${match[0]}`);
          i += 1 + match[0].length;
          continue;
        }
      }

      // .T. .F. .NULL. .Y. .N.
      if (ch === '.' && BOOL_RE.test(line.slice(i))) {
        const match = BOOL_RE.exec(line.slice(i));
        out += span('vfp-constant', match[0]);
        i += match[0].length;
        continue;
      }

      // Macro substitution: &nome ou &nome.
      if (ch === '&' && MACRO_RE.test(line.slice(i))) {
        const match = MACRO_RE.exec(line.slice(i));
        out += span('vfp-macro', match[0]);
        i += match[0].length;
        continue;
      }

      // Identificador / palavra-chave / PEM.
      if (/[A-Za-z_]/.test(ch)) {
        const end = scanIdentifier(line, i);
        const word = line.slice(i, end);
        const prevChar = prevNonSpace(line, i);
        const nextChar = nextNonSpace(line, end);
        const cls = classifyWord(word, prevChar, nextChar, flags);
        out += cls ? span(cls, word) : escapeHtml(word);

        const upper = word.toUpperCase();
        if (upper === 'PROCEDURE' || upper === 'FUNCTION' || upper === 'CLASS' || upper === 'OBJECT') {
          flags.expectEntity = true;
        } else if (upper === 'AS' && !flags.sql) {
          flags.expectType = true;
        }
        i = end;
        continue;
      }

      // Operadores compostos.
      const two = line.slice(i, i + 2);
      if (['<=', '>=', '<>', '!=', '=='].includes(two)) {
        out += span('vfp-operator', two);
        i += 2;
        continue;
      }

      // Continuacao de linha (; no fim).
      if (ch === ';' && /^\s*$/.test(line.slice(i + 1))) {
        out += span('vfp-continuation', ';');
        i += 1;
        continue;
      }

      if ('=+-*/%^$:#!&|<>'.includes(ch)) {
        out += span('vfp-operator', ch);
        i += 1;
        continue;
      }

      out += escapeHtml(ch);
      i += 1;
    }

    return out;
  }

  function highlightPreprocessor(line) {
    const match = /^(\s*)(#\w+)([\s\S]*)$/.exec(line);
    if (!match) return scanSegment(line, {});
    const [, spaces, directive, rest] = match;
    const flags = {
      expectDefine: /^#(?:DEFINE|UNDEF)$/i.test(directive),
    };
    return (
      escapeHtml(spaces) +
      span('vfp-preproc', directive) +
      (flags.expectDefine ? scanSegment(rest, flags) : scanSegment(rest, flags))
    );
  }

  function highlightTextBlock(line) {
    const mergeRe = /(<<[^>]*>>|<\([^)]*\)>|<[A-Za-z_]\w*>|\$[A-Za-z_]\w*)/g;
    let out = '';
    let last = 0;
    let match;
    while ((match = mergeRe.exec(line)) !== null) {
      out += escapeHtml(line.slice(last, match.index));
      out += span('vfp-textmerge', match[0]);
      last = match.index + match[0].length;
    }
    out += escapeHtml(line.slice(last));
    return `<span class="vfp-text">${out}</span>`;
  }

  function highlightLine(line, state) {
    if (/^\s*\*/.test(line)) return span('vfp-comment', line);
    if (/^\s*NOTE\b/i.test(line)) return span('vfp-comment', line);
    if (/^\s*#\w+/.test(line)) return highlightPreprocessor(line);
    if (/^\s*TEXT\b/i.test(line)) {
      state.inText = !/\bENDTEXT\b/i.test(line);
      return scanSegment(line, {});
    }
    return scanSegment(line, { sql: Boolean(state.inSql) });
  }

  function highlight(code) {
    const normalized = String(code == null ? '' : code).replace(/\r\n?/g, '\n');
    const lines = normalized.split('\n');
    const state = { inText: false, inSql: false };
    const out = [];

    for (const line of lines) {
      if (state.inText) {
        if (/^\s*ENDTEXT\b/i.test(line)) {
          state.inText = false;
          out.push(scanSegment(line, {}));
        } else {
          out.push(highlightTextBlock(line));
        }
        continue;
      }

      if (!state.inSql && SQL_START_RE.test(line)) state.inSql = true;
      out.push(highlightLine(line, state));
      if (state.inSql && !/;\s*$/.test(line)) state.inSql = false;
    }

    return out.join('\n');
  }

  const api = { highlight, escapeHtml };
  root.VfpHighlight = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

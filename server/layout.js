'use strict';

/**
 * Converte o dump do SCCTEXT em uma lista de objetos visuais com as
 * propriedades de layout. O SCCTEXT grava um bloco por objeto:
 *
 *   [ RECORD]
 *   [CLASS] commandbutton
 *   [BASECLASS] commandbutton
 *   [OBJNAME] CmdSalvar
 *   [PARENT] form1
 *   [START PROPERTIES]
 *   Top = 10
 *   Left = 20
 *   ...
 *   [END PROPERTIES]
 */

const NON_VISUAL = new Set([
  'dataenvironment',
  'cursor',
  'relation',
  'timer',
  'custom',
  'session',
  'collection',
  'exception',
  'hyperlink',
]);

const PAGE_PROP = /^Page(\d+)\.(.+)$/i;

function norm(value) {
  return String(value == null ? '' : value).trim().toLowerCase();
}

function unquote(value) {
  let text = String(value == null ? '' : value).trim();
  if (text.length < 2) return text;
  const quote = text[0];
  if ((quote !== '"' && quote !== "'") || text[text.length - 1] !== quote) return text;
  text = text.slice(1, -1);
  return text.split(`${quote}${quote}`).join(quote);
}

function parseRecords(text) {
  const lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  const records = [];
  let current = null;
  let mode = 'meta';
  let lastProp = null;

  const flush = () => {
    if (!current) return;
    if (current.className && current.objName) records.push(current);
    current = null;
    lastProp = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '[ RECORD]') {
      flush();
      current = {
        platform: '',
        uniqueId: '',
        className: '',
        baseClass: '',
        classLib: '',
        objName: '',
        parent: '',
        props: {},
      };
      mode = 'meta';
      continue;
    }

    if (!current) continue;
    if (trimmed === '[EOF]') {
      flush();
      break;
    }

    if (trimmed.startsWith('[BINSTART ')) {
      mode = 'bin';
      continue;
    }
    if (trimmed.startsWith('[BINEND ')) {
      mode = 'meta';
      continue;
    }
    if (mode === 'bin') continue;

    if (trimmed === '[START PROPERTIES]') {
      mode = 'props';
      lastProp = null;
      continue;
    }
    if (trimmed === '[END PROPERTIES]') {
      mode = 'meta';
      lastProp = null;
      continue;
    }
    if (trimmed === '[START METHODS]') {
      mode = 'methods';
      lastProp = null;
      continue;
    }
    if (trimmed === '[END METHODS]') {
      mode = 'meta';
      lastProp = null;
      continue;
    }
    if (mode === 'methods') continue;

    const tag = trimmed.match(/^\[([A-Z0-9]+)\]\s?(.*)$/);
    if (tag && mode !== 'props') {
      const value = tag[2].trim();
      switch (tag[1]) {
        case 'PLATFORM':
          current.platform = value;
          break;
        case 'UNIQUEID':
          current.uniqueId = value;
          break;
        case 'CLASS':
          current.className = value;
          break;
        case 'CLASSLOC':
          current.classLib = value;
          break;
        case 'BASECLASS':
          current.baseClass = value;
          break;
        case 'OBJNAME':
          current.objName = value;
          break;
        case 'PARENT':
          current.parent = value;
          break;
        default:
          break;
      }
      continue;
    }

    if (mode === 'props') {
      const separator = line.indexOf('=');
      if (separator > 0) {
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim();
        if (key) {
          current.props[key] = value;
          lastProp = key;
        }
      } else if (lastProp) {
        current.props[lastProp] += `\n${trimmed}`;
      }
    }
  }

  flush();
  return records;
}

function isVisual(record) {
  const className = norm(record.className);
  const baseClass = norm(record.baseClass);
  if (!className || !record.objName) return false;
  return !NON_VISUAL.has(className) && !NON_VISUAL.has(baseClass);
}

function buildLayout(text) {
  const records = parseRecords(text);
  const objects = [];

  for (const record of records) {
    if (!isVisual(record)) continue;

    const name = String(record.objName).trim();
    const parent = norm(record.parent);
    const path = norm(parent ? `${parent}.${name}` : name);

    objects.push({
      name,
      path,
      parent,
      class: norm(record.className),
      baseClass: norm(record.baseClass),
      classLib: String(record.classLib || '').trim(),
      order: objects.length,
      props: { ...record.props },
      synthetic: false,
    });
  }

  // O SCCTEXT não cria um registro para cada página do PageFrame; ele grava
  // Page1.Name, Page1.Caption etc. dentro do próprio pageframe.
  const pages = [];
  for (const object of objects) {
    if (object.class !== 'pageframe') continue;
    if (objects.some((item) => item.parent === object.path && item.class === 'page')) continue;

    const groups = new Map();
    for (const [key, value] of Object.entries(object.props)) {
      const match = key.match(PAGE_PROP);
      if (!match) continue;
      const index = Number(match[1]);
      if (!Number.isFinite(index) || index < 1) continue;
      if (!groups.has(index)) groups.set(index, {});
      groups.get(index)[match[2]] = value;
    }

    for (const [index, props] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
      const name = unquote(props.Name) || `Page${index}`;
      pages.push({
        name,
        path: norm(`${object.path}.${name}`),
        parent: object.path,
        class: 'page',
        baseClass: 'page',
        classLib: '',
        order: object.order + index / 1000,
        props: { ...props, Name: props.Name || name },
        synthetic: true,
      });
    }
  }

  const all = objects.concat(pages).sort((a, b) => a.order - b.order);
  all.forEach((object, index) => {
    object.z = index;
  });

  const form =
    all.find((object) => object.class === 'form' && !object.parent) ||
    all.find((object) => object.class === 'form') ||
    null;

  return {
    version: 1,
    form: form ? form.name : '',
    objects: all,
  };
}

module.exports = { buildLayout, parseRecords };

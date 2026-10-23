'use strict';

/* ------------------------------------------------------------------
 * Prévia de layout do formulário Visual FoxPro.
 *
 * Recebe o JSON produzido pelo servidor (objetos com class, baseClass,
 * parent e props) e desenha uma superfície absoluta em HTML/CSS.
 * As propriedades ausentes usam os padrões do VFP 9 como aproximação.
 * ------------------------------------------------------------------ */

(function (global) {
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

  const DEFAULTS = {
    form: { BackColor: '#f0f0f0', ForeColor: '#000', FontName: 'Arial', FontSize: 9 },
    commandbutton: {
      BackColor: '#f0f0f0', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 27, BorderStyle: 0,
    },
    textbox: {
      BackColor: '#ffffff', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 23, BorderStyle: 1, SpecialEffect: 0,
    },
    editbox: {
      BackColor: '#ffffff', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 60, BorderStyle: 1, SpecialEffect: 0,
    },
    label: {
      BackColor: 'transparent', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 18, BackStyle: 0,
    },
    combobox: {
      BackColor: '#ffffff', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 23, BorderStyle: 1, SpecialEffect: 0,
    },
    listbox: {
      BackColor: '#ffffff', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 100, BorderStyle: 1,
    },
    checkbox: {
      BackColor: 'transparent', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 18, BackStyle: 0,
    },
    optionbutton: {
      BackColor: 'transparent', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 18, BackStyle: 0,
    },
    spinner: {
      BackColor: '#ffffff', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 23, BorderStyle: 1,
    },
    shape: {
      BackColor: 'transparent', ForeColor: '#000', Width: 100, Height: 100,
      BorderStyle: 1, BorderWidth: 1, FillStyle: 0, SpecialEffect: 1,
    },
    line: { BorderStyle: 1, BorderWidth: 1, Width: 100, Height: 2 },
    container: {
      BackColor: '#f0f0f0', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 100, BackStyle: 1,
    },
    pageframe: {
      BackColor: '#f0f0f0', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 200, Height: 150, BorderStyle: 1,
    },
    page: {
      BackColor: '#f0f0f0', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 200, Height: 130,
    },
    grid: {
      BackColor: '#ffffff', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 200, Height: 100, BorderStyle: 1, ColumnCount: 2,
    },
    commandgroup: {
      BackColor: '#f0f0f0', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 30, BorderStyle: 1,
    },
    optiongroup: {
      BackColor: '#f0f0f0', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 100, BorderStyle: 1,
    },
    image: { BackColor: 'transparent', Width: 100, Height: 100 },
    olecontrol: {
      BackColor: '#ffffff', ForeColor: '#000', FontName: 'Arial', FontSize: 9,
      Width: 100, Height: 100, BorderStyle: 1,
    },
  };

  function norm(value) {
    return String(value == null ? '' : value).trim().toLowerCase();
  }

  function prop(props, name) {
    if (!props) return undefined;
    if (Object.prototype.hasOwnProperty.call(props, name)) return props[name];
    const wanted = String(name).toLowerCase();
    for (const key of Object.keys(props)) {
      if (key.toLowerCase() === wanted) return props[key];
    }
    return undefined;
  }

  function num(value, fallback) {
    if (value == null || value === '') return fallback;
    const parsed = Number(String(value).trim().replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function bool(value, fallback) {
    if (typeof value === 'boolean') return value;
    const text = String(value == null ? '' : value).trim().toLowerCase();
    if (text === '.t.' || text === 'true' || text === '1' || text === 'yes') return true;
    if (text === '.f.' || text === 'false' || text === '0' || text === 'no') return false;
    return fallback;
  }

  function unquote(value) {
    let text = String(value == null ? '' : value).trim();
    if (text.length < 2) return text;
    const quote = text[0];
    if ((quote !== '"' && quote !== "'") || text[text.length - 1] !== quote) return text;

    // Captions com quebra de linha são gravadas como "a" + CHR(13) + "b".
    if (/\+\s*CHR\(\s*(13|10)\s*\)/i.test(text)) {
      const parts = [];
      const re = /"([^"]*)"|'([^']*)'/g;
      let match;
      while ((match = re.exec(text))) parts.push(match[1] != null ? match[1] : match[2]);
      if (parts.length) return parts.join('\n');
    }

    text = text.slice(1, -1);
    return text.split(`${quote}${quote}`).join(quote);
  }

  function color(value, fallback) {
    if (value == null || value === '') return fallback;
    const text = String(value).trim();
    let match = text.match(/^RGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (match) return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
    match = text.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
    if (match) return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
    if (/^-?\d+$/.test(text)) {
      let numeric = Number(text);
      if (numeric < 0) numeric = 0xffffff;
      const red = numeric & 0xff;
      const green = (numeric >> 8) & 0xff;
      const blue = (numeric >> 16) & 0xff;
      return `rgb(${red}, ${green}, ${blue})`;
    }
    if (/^#[0-9a-f]{3,8}$/i.test(text) || /^[a-z]+$/i.test(text)) return text;
    return fallback;
  }

  function buildTree(layout) {
    const warnings = [];
    const rawObjects = Array.isArray(layout && layout.objects) ? layout.objects : [];
    const nodes = [];
    const byPath = new Map();

    for (const raw of rawObjects) {
      if (!raw || !raw.path) continue;
      const node = Object.assign({}, raw, {
        props: raw.props || {},
        children: [],
        custom: Boolean(
          raw.classLib ||
            (raw.class && raw.baseClass && norm(raw.class) !== norm(raw.baseClass)),
        ),
      });
      nodes.push(node);
      byPath.set(norm(node.path), node);
    }

    let form = null;
    const attached = new Set();
    for (const node of nodes) {
      if (!node.parent) {
        if (node.class === 'form' && !form) form = node;
        continue;
      }
      const parent = byPath.get(norm(node.parent));
      if (parent && parent !== node) {
        parent.children.push(node);
        attached.add(node);
      }
    }

    if (!form) {
      form = {
        name: 'form',
        path: '',
        parent: '',
        class: 'form',
        baseClass: 'form',
        props: {},
        children: [],
        custom: false,
      };
      warnings.push('Formulário não identificado no dump; usando uma superfície vazia.');
    }

    for (const node of nodes) {
      if (node === form || attached.has(node)) continue;
      if (node.class === 'form') continue;
      if (!node.parent || norm(node.parent) === norm(form.path)) {
        form.children.push(node);
      } else {
        warnings.push(`${node.name}: pai "${node.parent}" não encontrado.`);
        form.children.push(node);
      }
    }

    const sort = (node) => {
      node.children.sort((a, b) => {
        const order = num(a.order, 0) - num(b.order, 0);
        return order || String(a.name).localeCompare(String(b.name));
      });
      node.children.forEach(sort);
    };
    sort(form);

    const customCount = nodes.filter((node) => node.custom).length;
    if (customCount > 0) {
      warnings.push(
        `${customCount} objeto(s) usam classe herdada; a classe pai não foi resolvida.`,
      );
    }

    return { form, warnings };
  }

  function unitScale(form) {
    const scaleMode = num(prop(form.props, 'ScaleMode'), 3);
    if (scaleMode === 1) return 1 / 15; // twips -> pixels
    if (scaleMode === 2) return 96 / 72; // pontos -> pixels
    return 1;
  }

  function setFont(el, node, defaults) {
    const props = node.props;
    const name = unquote(prop(props, 'FontName')) || defaults.FontName || 'Arial';
    const size = num(prop(props, 'FontSize'), defaults.FontSize || 9);
    el.style.fontFamily = `"${name.replace(/"/g, '')}", Arial, sans-serif`;
    el.style.fontSize = `${Math.max(1, size)}pt`;
    el.style.fontWeight = bool(prop(props, 'FontBold'), false) ? '700' : '400';
    el.style.fontStyle = bool(prop(props, 'FontItalic'), false) ? 'italic' : 'normal';
    const decoration = [];
    if (bool(prop(props, 'FontUnderline'), false)) decoration.push('underline');
    if (bool(prop(props, 'FontStrikethru'), false)) decoration.push('line-through');
    el.style.textDecoration = decoration.join(' ') || 'none';
  }

  function applyText(el, node) {
    const alignment = num(prop(node.props, 'Alignment'), 0);
    el.style.textAlign = alignment === 1 ? 'right' : alignment === 2 ? 'center' : 'left';
    el.style.whiteSpace = bool(prop(node.props, 'WordWrap'), true) ? 'pre-wrap' : 'pre';
    el.style.overflowWrap = 'break-word';
  }

  function applyBackground(el, node, defaults) {
    const backStyle = num(prop(node.props, 'BackStyle'), defaults.BackStyle == null ? 1 : defaults.BackStyle);
    if (backStyle === 0) {
      el.style.background = 'transparent';
      return;
    }
    el.style.background = color(prop(node.props, 'BackColor'), defaults.BackColor || '#ffffff');
  }

  function applyBorder(el, node, plainColor) {
    const defaults = DEFAULTS[norm(node.class)] || {};
    const borderStyle = num(
      prop(node.props, 'BorderStyle'),
      defaults.BorderStyle == null ? 0 : defaults.BorderStyle,
    );
    if (borderStyle === 0) {
      el.style.border = 'none';
      return;
    }
    const requestedWidth = num(prop(node.props, 'BorderWidth'), 1);
    if (requestedWidth <= 0) {
      el.style.border = 'none';
      return;
    }
    const width = Math.min(6, requestedWidth);
    const borderColor = color(prop(node.props, 'BorderColor'), plainColor || '#8a8a8a');
    const special = num(
      prop(node.props, 'SpecialEffect'),
      defaults.SpecialEffect == null ? 1 : defaults.SpecialEffect,
    );
    if (special === 0) {
      el.style.border = `${width}px solid #7f7f7f`;
      el.style.borderRightColor = '#ffffff';
      el.style.borderBottomColor = '#ffffff';
    } else {
      el.style.border = `${width}px solid ${borderColor}`;
    }
  }

  function box(el, node, ctx) {
    const defaults = DEFAULTS[norm(node.class)] || {};
    const scale = ctx.scale;
    const left = num(prop(node.props, 'Left'), 0) * scale;
    const top = num(prop(node.props, 'Top'), 0) * scale;
    const width = num(prop(node.props, 'Width'), defaults.Width || 0) * scale;
    const height = num(prop(node.props, 'Height'), defaults.Height || 0) * scale;

    el.style.position = 'absolute';
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    if (width > 0) el.style.width = `${width}px`;
    if (height > 0) el.style.height = `${height}px`;
    el.style.boxSizing = 'border-box';
    el.style.minWidth = '0';
    el.style.minHeight = '0';
    el.style.color = color(prop(node.props, 'ForeColor'), defaults.ForeColor || '#000');
    setFont(el, node, defaults);
    applyText(el, node);
  }

  function base(node, ctx, extraClass) {
    const el = document.createElement('div');
    const classes = ['vfp-obj', `vfp-${norm(node.class)}`];
    for (const name of String(extraClass || '').split(/\s+/)) {
      if (name && !classes.includes(name)) classes.push(name);
    }
    if (node.custom) classes.push('vfp-custom');
    el.className = classes.join(' ');
    el.dataset.name = node.name;
    el.dataset.class = node.class;
    el.title = `${node.name} (${node.class})${node.custom ? ' — classe herdada' : ''}`;
    box(el, node, ctx);
    return el;
  }

  function children(node, ctx) {
    const fragment = document.createDocumentFragment();
    for (const child of node.children) {
      if (NON_VISUAL.has(norm(child.class)) || NON_VISUAL.has(norm(child.baseClass))) continue;
      const element = renderNode(child, ctx);
      if (element) fragment.append(element);
    }
    return fragment;
  }

  function cleanCaption(value) {
    return unquote(value)
      .split('\\\\<')
      .join('\u0000')
      .split('\\<')
      .join('')
      .split('\u0000')
      .join('<');
  }

  function caption(node) {
    return cleanCaption(prop(node.props, 'Caption'));
  }

  function valueOf(node) {
    const value = unquote(prop(node.props, 'Value'));
    if (!value || value === '.NULL.') return '';
    return value;
  }

  function renderLabel(node, ctx) {
    const el = base(node, ctx, 'vfp-label');
    el.textContent = caption(node);
    el.style.overflow = 'visible';
    applyBackground(el, node, DEFAULTS.label);
    return el;
  }

  function renderButton(node, ctx) {
    const el = base(node, ctx, 'vfp-button');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '-1');
    el.textContent = caption(node);
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.padding = '0 4px';
    el.style.overflow = 'hidden';
    el.style.background = color(prop(node.props, 'BackColor'), DEFAULTS.commandbutton.BackColor);
    el.style.border = '1px solid #8a8a8a';
    el.style.borderRadius = '2px';
    el.style.boxShadow = 'inset 0 1px 0 #ffffff, inset 0 -1px 0 #b5b5b5';
    if (num(prop(node.props, 'Style'), 0) === 1) el.style.background = 'transparent';
    if (!bool(prop(node.props, 'Enabled'), true)) el.style.color = '#8a8a8a';
    return el;
  }

  function inputElement(node, ctx, className) {
    const el = base(node, ctx, className);
    const defaults = DEFAULTS[norm(node.class)] || DEFAULTS.textbox;
    applyBackground(el, node, defaults);
    applyBorder(el, node, '#8a8a8a');
    el.style.padding = '2px 3px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.overflow = 'hidden';
    return el;
  }

  function renderTextBox(node, ctx) {
    const el = inputElement(node, ctx, 'vfp-input');
    el.textContent = valueOf(node);
    return el;
  }

  function renderEditBox(node, ctx) {
    const el = inputElement(node, ctx, 'vfp-input vfp-editbox');
    el.style.alignItems = 'flex-start';
    el.style.whiteSpace = 'pre-wrap';
    el.textContent = valueOf(node);
    return el;
  }

  function renderComboBox(node, ctx) {
    const el = inputElement(node, ctx, 'vfp-input vfp-combobox');
    const text = document.createElement('span');
    text.className = 'vfp-combo-text';
    text.textContent = valueOf(node) || unquote(prop(node.props, 'Text'));
    const arrow = document.createElement('span');
    arrow.className = 'vfp-combo-arrow';
    arrow.textContent = '▾';
    el.append(text, arrow);
    el.style.justifyContent = 'space-between';
    return el;
  }

  function renderListBox(node, ctx) {
    const el = inputElement(node, ctx, 'vfp-listbox');
    el.style.alignItems = 'stretch';
    el.style.display = 'block';
    el.textContent = '';
    return el;
  }

  function renderChoice(node, ctx, option) {
    const el = base(node, ctx, option ? 'vfp-optionbutton' : 'vfp-checkbox');
    const mark = document.createElement('span');
    mark.className = option ? 'vfp-radio-mark' : 'vfp-check-mark';
    const checked = bool(prop(node.props, 'Value'), false) ||
      String(prop(node.props, 'Value')).trim() === '1';
    if (checked) mark.classList.add('is-checked');
    const text = document.createElement('span');
    text.className = 'vfp-choice-caption';
    text.textContent = caption(node);
    el.append(mark, text);
    applyBackground(el, node, option ? DEFAULTS.optionbutton : DEFAULTS.checkbox);
    return el;
  }

  function renderSpinner(node, ctx) {
    const el = inputElement(node, ctx, 'vfp-input vfp-spinner');
    const text = document.createElement('span');
    text.className = 'vfp-spinner-value';
    text.textContent = valueOf(node);
    const arrows = document.createElement('span');
    arrows.className = 'vfp-spinner-arrows';
    arrows.textContent = '▲\n▼';
    el.append(text, arrows);
    el.style.justifyContent = 'space-between';
    return el;
  }

  function renderShape(node, ctx) {
    const el = base(node, ctx, 'vfp-shape');
    const shape = num(prop(node.props, 'Shape'), 0);
    if (shape === 2 || shape === 3) {
      el.style.borderRadius = '50%';
    } else if (shape === 4 || shape === 5) {
      el.style.borderRadius = `${Math.max(2, num(prop(node.props, 'Curvature'), 8) * ctx.scale)}px`;
    }
    const fillStyle = num(prop(node.props, 'FillStyle'), 0);
    el.style.background = fillStyle === 1
      ? color(prop(node.props, 'FillColor'), '#ffffff')
      : 'transparent';
    applyBorder(el, node, '#000000');
    return el;
  }

  function renderLine(node, ctx) {
    const defaults = DEFAULTS.line;
    const width = Math.max(1, num(prop(node.props, 'Width'), defaults.Width) * ctx.scale);
    const height = Math.max(1, num(prop(node.props, 'Height'), defaults.Height) * ctx.scale);
    const left = num(prop(node.props, 'Left'), 0) * ctx.scale;
    const top = num(prop(node.props, 'Top'), 0) * ctx.scale;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', `vfp-obj vfp-line${node.custom ? ' vfp-custom' : ''}`);
    svg.dataset.name = node.name;
    svg.style.position = 'absolute';
    svg.style.left = `${left}px`;
    svg.style.top = `${top}px`;
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.style.overflow = 'visible';
    const line = document.createElementNS(ns, 'line');
    const slant = bool(prop(node.props, 'LineSlant'), false);
    line.setAttribute('x1', '0');
    line.setAttribute('y1', slant ? '0' : String(height));
    line.setAttribute('x2', String(width));
    line.setAttribute('y2', slant ? String(height) : '0');
    line.setAttribute('stroke', color(prop(node.props, 'BorderColor'), '#000000'));
    line.setAttribute('stroke-width', String(Math.max(1, num(prop(node.props, 'BorderWidth'), 1))));
    svg.append(line);
    return svg;
  }

  function renderImage(node, ctx) {
    const el = base(node, ctx, 'vfp-image');
    const picture = unquote(prop(node.props, 'Picture'));
    el.textContent = picture ? picture.split(/[\\/]/).pop() : 'imagem';
    return el;
  }

  function renderOle(node, ctx) {
    const el = base(node, ctx, 'vfp-ole');
    const oleClass = unquote(prop(node.props, 'OLEClass')) || unquote(prop(node.props, 'Class')) || 'ActiveX';
    el.textContent = oleClass;
    return el;
  }

  function renderContainer(node, ctx) {
    const el = base(node, ctx, 'vfp-container');
    const defaults = DEFAULTS.container;
    applyBackground(el, node, defaults);
    applyBorder(el, node, '#8a8a8a');
    el.style.overflow = 'hidden';
    el.append(children(node, ctx));
    return el;
  }

  function pageElement(page, ctx, width, height) {
    const el = document.createElement('div');
    el.className = `vfp-obj vfp-page${page.custom ? ' vfp-custom' : ''}`;
    el.dataset.name = page.name;
    el.dataset.class = page.class;
    el.style.position = 'absolute';
    el.style.left = '0';
    el.style.top = '0';
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.boxSizing = 'border-box';
    el.style.overflow = 'hidden';
    el.style.color = color(prop(page.props, 'ForeColor'), DEFAULTS.page.ForeColor);
    setFont(el, page, DEFAULTS.page);
    el.style.background = color(prop(page.props, 'BackColor'), DEFAULTS.page.BackColor);
    el.append(children(page, ctx));
    return el;
  }

  function renderPageFrame(node, ctx) {
    const el = base(node, ctx, 'vfp-pageframe');
    const defaults = DEFAULTS.pageframe;
    applyBackground(el, node, defaults);
    applyBorder(el, node, '#8a8a8a');
    el.style.overflow = 'hidden';

    const width = Math.max(1, num(prop(node.props, 'Width'), defaults.Width) * ctx.scale);
    const height = Math.max(1, num(prop(node.props, 'Height'), defaults.Height) * ctx.scale);
    const tabsOn = bool(prop(node.props, 'Tabs'), true);
    const pages = node.children
      .filter((child) => norm(child.class) === 'page')
      .sort((a, b) => num(a.order, 0) - num(b.order, 0));
    const showTabs = tabsOn;
    const tabHeight = showTabs ? 22 : 0;
    if (!tabsOn && pages.length > 1) {
      ctx.warnings.push(
        `${node.name}: PageFrame com Tabs = .F.; apenas a página ativa aparece no preview.`,
      );
    }

    if (pages.length === 0) {
      const body = document.createElement('div');
      body.className = 'vfp-pageframe-body';
      body.style.position = 'absolute';
      body.style.inset = '0';
      body.style.overflow = 'hidden';
      body.append(children(node, ctx));
      el.append(body);
      return el;
    }

    const bar = document.createElement('div');
    bar.className = 'vfp-pageframe-tabs';
    bar.setAttribute('role', 'tablist');
    bar.style.position = 'absolute';
    bar.style.left = '0';
    bar.style.top = '0';
    bar.style.width = `${width}px`;
    bar.style.height = `${tabHeight}px`;
    bar.style.display = showTabs ? 'flex' : 'none';

    const body = document.createElement('div');
    body.className = 'vfp-pageframe-body';
    body.style.position = 'absolute';
    body.style.left = '0';
    body.style.top = `${tabHeight}px`;
    body.style.width = `${width}px`;
    body.style.height = `${Math.max(0, height - tabHeight)}px`;
    body.style.overflow = 'hidden';

    let active = num(prop(node.props, 'ActivePage'), 1) - 1;
    if (active < 0 || active >= pages.length) active = 0;

    const tabs = [];
    const pageEls = [];
    pages.forEach((page, index) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'vfp-pageframe-tab';
      tab.textContent = caption(page) || page.name;
      tab.title = page.name;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(index === active));
      tab.addEventListener('click', () => {
        tabs.forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));
        pageEls.forEach((item, i) => {
          item.hidden = i !== index;
        });
      });
      bar.append(tab);
      tabs.push(tab);

      const pageEl = pageElement(page, ctx, width, Math.max(0, height - tabHeight));
      pageEl.hidden = index !== active;
      body.append(pageEl);
      pageEls.push(pageEl);
    });

    el.append(bar, body);
    for (const child of node.children) {
      if (norm(child.class) === 'page') continue;
      const element = renderNode(child, ctx);
      if (element) el.append(element);
    }
    return el;
  }

  function columnInfo(node) {
    const count = Math.max(1, Math.min(60, num(prop(node.props, 'ColumnCount'), DEFAULTS.grid.ColumnCount)));
    const widths = unquote(prop(node.props, 'ColumnWidths'))
      .split(',')
      .map((item) => Number(String(item).trim()))
      .filter((item) => Number.isFinite(item) && item > 0);
    const captions = [];
    for (let index = 1; index <= count; index += 1) {
      captions.push(
        unquote(prop(node.props, `Column${index}.Header1.Caption`)) ||
          unquote(prop(node.props, `Column${index}.Header1.Name`)) ||
          `Coluna ${index}`,
      );
    }
    return { count, widths, captions };
  }

  function renderGrid(node, ctx) {
    const el = base(node, ctx, 'vfp-grid');
    const defaults = DEFAULTS.grid;
    applyBackground(el, node, defaults);
    applyBorder(el, node, '#8a8a8a');
    el.style.overflow = 'hidden';
    el.style.padding = '0';
    el.style.display = 'block';

    const { count, widths, captions } = columnInfo(node);
    const table = document.createElement('table');
    table.className = 'vfp-grid-table';
    table.style.width = '100%';
    table.style.height = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.tableLayout = 'fixed';
    table.style.font = 'inherit';

    const colgroup = document.createElement('colgroup');
    for (let index = 0; index < count; index += 1) {
      const col = document.createElement('col');
      const width = widths[index];
      if (width) col.style.width = `${width * ctx.scale}px`;
      colgroup.append(col);
    }
    table.append(colgroup);

    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    captions.forEach((text) => {
      const cell = document.createElement('th');
      cell.textContent = text;
      cell.style.border = '1px solid #b0b0b0';
      cell.style.background = '#e8e8e8';
      cell.style.padding = '1px 3px';
      cell.style.textAlign = 'left';
      cell.style.fontWeight = '400';
      cell.style.overflow = 'hidden';
      headRow.append(cell);
    });
    head.append(headRow);
    table.append(head);

    const body = document.createElement('tbody');
    const rowHeight = Math.max(14, num(prop(node.props, 'RowHeight'), 18) * ctx.scale);
    const rows = Math.max(1, Math.min(20, Math.floor((num(prop(node.props, 'Height'), defaults.Height) * ctx.scale) / rowHeight) - 1));
    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
      const row = document.createElement('tr');
      row.style.height = `${rowHeight}px`;
      for (let colIndex = 0; colIndex < count; colIndex += 1) {
        const cell = document.createElement('td');
        cell.style.border = '1px solid #d0d0d0';
        cell.style.padding = '1px 3px';
        cell.style.background = rowIndex % 2 ? '#f7f7f7' : '#ffffff';
        row.append(cell);
      }
      body.append(row);
    }
    table.append(body);
    el.append(table);
    return el;
  }

  function renderGroup(node, ctx, option) {
    const existing = node.children.filter((child) =>
      option ? norm(child.class) === 'optionbutton' : norm(child.class) === 'commandbutton',
    );
    if (existing.length) return renderContainer(node, ctx);

    const el = base(node, ctx, option ? 'vfp-optiongroup' : 'vfp-commandgroup');
    const defaults = option ? DEFAULTS.optiongroup : DEFAULTS.commandgroup;
    const props = node.props;
    applyBackground(el, node, defaults);
    applyBorder(el, node, '#8a8a8a');
    el.style.overflow = 'hidden';
    el.style.padding = '2px';

    const prefix = option ? 'Option' : 'Button';
    const count = Math.max(1, Math.min(20, num(prop(props, 'ButtonCount'), 2)));
    const hasPositions = Array.from({ length: count }, (_, i) => i + 1).some(
      (index) => prop(props, `${prefix}${index}.Left`) != null,
    );

    if (!hasPositions) {
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'space-around';
      el.style.gap = '2px';
    } else {
      el.style.padding = '0';
    }

    for (let index = 1; index <= count; index += 1) {
      const item = document.createElement('span');
      item.className = option ? 'vfp-group-option' : 'vfp-group-button';
      if (hasPositions) {
        item.style.position = 'absolute';
        item.style.left = `${num(prop(props, `${prefix}${index}.Left`), 0) * ctx.scale}px`;
        item.style.top = `${num(prop(props, `${prefix}${index}.Top`), 0) * ctx.scale}px`;
        item.style.width = `${
          num(prop(props, `${prefix}${index}.Width`), 100) * ctx.scale
        }px`;
        item.style.height = `${
          num(prop(props, `${prefix}${index}.Height`), 18) * ctx.scale
        }px`;
      }

      if (option) {
        const mark = document.createElement('span');
        mark.className = 'vfp-radio-mark';
        const value = prop(props, `${prefix}${index}.Value`);
        if (bool(value, false) || String(value).trim() === '1') {
          mark.classList.add('is-checked');
        }
        item.append(mark);
      }

      const label = document.createElement('span');
      label.textContent =
        cleanCaption(prop(props, `${prefix}${index}.Caption`)) ||
        cleanCaption(prop(props, `Button${index}.Caption`)) ||
        `Botão ${index}`;
      item.append(label);
      el.append(item);
    }
    return el;
  }

  function renderPlaceholder(node, ctx) {
    const el = base(node, ctx, 'vfp-placeholder');
    const text = caption(node) || node.name;
    el.textContent = `${node.class}: ${text}`;
    return el;
  }

  function renderNode(node, ctx) {
    switch (norm(node.class)) {
      case 'form':
        return null;
      case 'label':
        return renderLabel(node, ctx);
      case 'commandbutton':
        return renderButton(node, ctx);
      case 'textbox':
        return renderTextBox(node, ctx);
      case 'editbox':
        return renderEditBox(node, ctx);
      case 'combobox':
        return renderComboBox(node, ctx);
      case 'listbox':
        return renderListBox(node, ctx);
      case 'checkbox':
        return renderChoice(node, ctx, false);
      case 'optionbutton':
        return renderChoice(node, ctx, true);
      case 'spinner':
        return renderSpinner(node, ctx);
      case 'shape':
        return renderShape(node, ctx);
      case 'line':
        return renderLine(node, ctx);
      case 'image':
        return renderImage(node, ctx);
      case 'olecontrol':
        return renderOle(node, ctx);
      case 'container':
        return renderContainer(node, ctx);
      case 'pageframe':
        return renderPageFrame(node, ctx);
      case 'page':
        return renderContainer(node, ctx);
      case 'grid':
        return renderGrid(node, ctx);
      case 'commandgroup':
        return renderGroup(node, ctx, false);
      case 'optiongroup':
        return renderGroup(node, ctx, true);
      default:
        return renderPlaceholder(node, ctx);
    }
  }

  function countObjects(node) {
    let total = 0;
    for (const child of node.children) {
      total += 1 + countObjects(child);
    }
    return total;
  }

  function render(container, layout) {
    const { form, warnings } = buildTree(layout);
    const scale = unitScale(form);
    const defaults = DEFAULTS.form;
    const width = Math.max(1, num(prop(form.props, 'Width'), 400) * scale);
    const height = Math.max(1, num(prop(form.props, 'Height'), 300) * scale);

    container.replaceChildren();
    container.className = 'layout-form';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.background = color(prop(form.props, 'BackColor'), defaults.BackColor);
    container.style.color = color(prop(form.props, 'ForeColor'), defaults.ForeColor);
    setFont(container, form, defaults);
    container.style.overflow = 'hidden';
    container.style.outline = '1px solid rgba(0, 0, 0, 0.28)';

    if (!layout || !Array.isArray(layout.objects) || layout.objects.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'vfp-empty';
      empty.textContent = 'Layout não disponível para este formulário.';
      container.append(empty);
      return { width, height, count: 0, warnings };
    }

    const ctx = { scale, warnings };
    container.append(children(form, ctx));
    return { width, height, count: countObjects(form), warnings };
  }

  global.VfpLayout = { render };
})(window);

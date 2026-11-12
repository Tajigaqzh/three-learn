import Quill, { Delta, Module, Parchment } from 'quill';

type ClipboardMatcher = (node: Node, delta: Delta, scroll: unknown) => Delta;

type ClipboardModule = {
  addMatcher: (selector: number | string, matcher: ClipboardMatcher) => void;
};

type FormatMap = Record<string, unknown>;

const { Scope, StyleAttributor } = Parchment;

const WORD_FORMATS = {
  fontFamily: new StyleAttributor('word-font-family', 'font-family', { scope: Scope.INLINE }),
  fontSize: new StyleAttributor('word-font-size', 'font-size', { scope: Scope.INLINE }),
  letterSpacing: new StyleAttributor('word-letter-spacing', 'letter-spacing', {
    scope: Scope.INLINE,
  }),
  textTransform: new StyleAttributor('word-text-transform', 'text-transform', {
    scope: Scope.INLINE,
  }),
  verticalAlign: new StyleAttributor('word-vertical-align', 'vertical-align', {
    scope: Scope.INLINE,
  }),
  marginTop: new StyleAttributor('word-margin-top', 'margin-top', { scope: Scope.BLOCK }),
  marginRight: new StyleAttributor('word-margin-right', 'margin-right', { scope: Scope.BLOCK }),
  marginBottom: new StyleAttributor('word-margin-bottom', 'margin-bottom', {
    scope: Scope.BLOCK,
  }),
  marginLeft: new StyleAttributor('word-margin-left', 'margin-left', { scope: Scope.BLOCK }),
  textIndent: new StyleAttributor('word-text-indent', 'text-indent', { scope: Scope.BLOCK }),
  lineHeight: new StyleAttributor('word-line-height', 'line-height', { scope: Scope.BLOCK }),
  cellBackground: new StyleAttributor('table-cell-background', 'background-color', {
    scope: Scope.BLOCK,
  }),
  cellBorderTop: new StyleAttributor('table-cell-border-top', 'border-top-width', {
    scope: Scope.BLOCK,
  }),
  cellBorderRight: new StyleAttributor('table-cell-border-right', 'border-right-width', {
    scope: Scope.BLOCK,
  }),
  cellBorderBottom: new StyleAttributor('table-cell-border-bottom', 'border-bottom-width', {
    scope: Scope.BLOCK,
  }),
  cellBorderLeft: new StyleAttributor('table-cell-border-left', 'border-left-width', {
    scope: Scope.BLOCK,
  }),
  cellBorderColor: new StyleAttributor('table-cell-border-color', 'border-color', {
    scope: Scope.BLOCK,
  }),
  cellBorderTopStyle: new StyleAttributor('table-cell-border-top-style', 'border-top-style', {
    scope: Scope.BLOCK,
  }),
  cellBorderRightStyle: new StyleAttributor('table-cell-border-right-style', 'border-right-style', {
    scope: Scope.BLOCK,
  }),
  cellBorderBottomStyle: new StyleAttributor(
    'table-cell-border-bottom-style',
    'border-bottom-style',
    { scope: Scope.BLOCK },
  ),
  cellBorderLeftStyle: new StyleAttributor('table-cell-border-left-style', 'border-left-style', {
    scope: Scope.BLOCK,
  }),
  cellPadding: new StyleAttributor('table-cell-padding', 'padding', { scope: Scope.BLOCK }),
  cellWidth: new StyleAttributor('table-cell-width', 'width', { scope: Scope.BLOCK }),
  cellVerticalAlign: new StyleAttributor('table-cell-vertical-align', 'vertical-align', {
    scope: Scope.BLOCK,
  }),
};

Object.values(WORD_FORMATS).forEach((format) => Quill.register(format, true));

const CELL_BORDER_FORMATS = {
  top: ['table-cell-border-top', 'table-cell-border-top-style'],
  right: ['table-cell-border-right', 'table-cell-border-right-style'],
  bottom: ['table-cell-border-bottom', 'table-cell-border-bottom-style'],
  left: ['table-cell-border-left', 'table-cell-border-left-style'],
} as const;

const TABLE_UP_CELL_FORMAT = 'table-up-cell-inner';
const CELL_FORMAT_CSS_PROPERTIES: Record<string, string> = {
  'table-cell-background': 'background-color',
  'table-cell-border-top': 'border-top-width',
  'table-cell-border-right': 'border-right-width',
  'table-cell-border-bottom': 'border-bottom-width',
  'table-cell-border-left': 'border-left-width',
  'table-cell-border-color': 'border-color',
  'table-cell-border-top-style': 'border-top-style',
  'table-cell-border-right-style': 'border-right-style',
  'table-cell-border-bottom-style': 'border-bottom-style',
  'table-cell-border-left-style': 'border-left-style',
  'table-cell-padding': 'padding',
  'table-cell-vertical-align': 'vertical-align',
};

function cssLengthToPixels(value: string): string | undefined {
  const match = value.trim().match(/^(-?\d*\.?\d+)\s*(pt|px|in|cm|mm|pc)?$/i);

  if (!match) return undefined;

  const amount = Number(match[1]);
  const unit = (match[2] || 'px').toLowerCase();
  const factors: Record<string, number> = {
    pt: 4 / 3,
    px: 1,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    pc: 16,
  };
  const factor = factors[unit];

  if (factor === undefined) return undefined;

  return `${Math.round(amount * factor * 100) / 100}px`;
}

function cleanFontFamily(value: string): string | undefined {
  const family = value
    .replace(/^["']|["']$/g, '')
    .split(',')[0]
    .trim();

  return family || undefined;
}

function parseBorder(value: string): { width?: string; style?: string; color?: string } {
  const tokens = value.trim().split(/\s+/);
  const widthIndex = tokens.findIndex((token) => /^\d*\.?\d+(pt|px)?$/i.test(token));
  const styleIndex = tokens.findIndex((token) =>
    /^(none|solid|dashed|dotted|double|groove|ridge|inset|outset)$/i.test(token),
  );
  const width = widthIndex < 0 ? undefined : cssLengthToPixels(tokens[widthIndex]);
  const style = styleIndex < 0 ? undefined : tokens[styleIndex].toLowerCase();
  const color = tokens
    .filter((_token, index) => index !== widthIndex && index !== styleIndex)
    .join(' ')
    .replace(/^windowtext$/i, '#000000');

  return {
    width,
    style,
    color: color || undefined,
  };
}

function getInlineFormats(element: HTMLElement): FormatMap {
  const style = element.style;
  const formats: FormatMap = {};
  const fontFamily =
    style.getPropertyValue('mso-fareast-font-family') ||
    style.getPropertyValue('font-family') ||
    element.getAttribute('face') ||
    '';
  const fontSize = style.getPropertyValue('font-size');
  const color = style.getPropertyValue('color');
  const backgroundColor = style.getPropertyValue('background-color');
  const letterSpacing = style.getPropertyValue('letter-spacing');
  const fontStyle = style.getPropertyValue('font-style');
  const fontWeight = style.getPropertyValue('font-weight');
  const textDecoration = [
    style.getPropertyValue('text-decoration'),
    style.getPropertyValue('text-underline'),
  ]
    .join(' ')
    .toLowerCase();

  if (fontFamily) formats['word-font-family'] = cleanFontFamily(fontFamily);
  if (fontSize) formats['word-font-size'] = cssLengthToPixels(fontSize);
  if (color) formats.color = color;
  if (backgroundColor) formats.background = backgroundColor;
  if (letterSpacing) formats['word-letter-spacing'] = cssLengthToPixels(letterSpacing);
  if (fontStyle.toLowerCase() === 'italic' || fontStyle.toLowerCase() === 'oblique') {
    formats.italic = true;
  }
  if (fontWeight.toLowerCase() === 'bold' || Number.parseInt(fontWeight, 10) >= 600) {
    formats.bold = true;
  }
  if (textDecoration.includes('underline')) formats.underline = true;
  if (textDecoration.includes('line-through')) formats.strike = true;
  if (textDecoration.includes('overline')) formats['word-text-transform'] = 'overline';
  if (style.textTransform) formats['word-text-transform'] = style.textTransform;
  if (style.verticalAlign) formats['word-vertical-align'] = style.verticalAlign;

  return Object.fromEntries(Object.entries(formats).filter(([, value]) => value !== undefined));
}

function getBlockFormats(element: HTMLElement): FormatMap {
  const style = element.style;
  const formats: FormatMap = {};
  const align = style.textAlign || element.getAttribute('align');

  if (align && ['left', 'right', 'center', 'justify'].includes(align.toLowerCase())) {
    formats.align = align.toLowerCase();
  }

  const lengths = [
    ['margin-top', 'word-margin-top'],
    ['margin-right', 'word-margin-right'],
    ['margin-bottom', 'word-margin-bottom'],
    ['margin-left', 'word-margin-left'],
    ['text-indent', 'word-text-indent'],
    ['line-height', 'word-line-height'],
  ];

  lengths.forEach(([property, format]) => {
    const value = style.getPropertyValue(property);

    if (value) {
      formats[format] =
        property === 'line-height' && /^\d*\.?\d+$/.test(value) ? value : cssLengthToPixels(value);
    }
  });

  if (element.tagName.match(/^H[1-6]$/)) {
    formats.header = Number(element.tagName.slice(1));
  }

  return Object.fromEntries(Object.entries(formats).filter(([, value]) => value !== undefined));
}

function getCellFormats(element: HTMLTableCellElement): FormatMap {
  const style = element.style;
  const formats: FormatMap = {};
  const background = style.backgroundColor || style.getPropertyValue('background-color');
  const padding = style.padding;
  const verticalAlign = style.verticalAlign || element.getAttribute('valign');

  if (background && background !== 'transparent') formats['table-cell-background'] = background;
  if (padding) {
    formats['table-cell-padding'] = padding
      .split(/\s+/)
      .map((part) => cssLengthToPixels(part) || part)
      .join(' ');
  }
  if (verticalAlign) formats['table-cell-vertical-align'] = verticalAlign;

  let borderColor: string | undefined;

  Object.entries(CELL_BORDER_FORMATS).forEach(([side, [widthFormat, styleFormat]]) => {
    const borderValue = style.getPropertyValue(`border-${side}`);
    const alternateValue = style.getPropertyValue(`mso-border-${side}-alt`);
    const border = parseBorder(alternateValue || borderValue);

    if (border.width) formats[widthFormat] = border.width;
    if (border.style) formats[styleFormat] = border.style;
    if (border.color && border.color.toLowerCase() !== 'none') {
      borderColor ||= border.color;
    }

    const explicitWidth = style.getPropertyValue(`border-${side}-width`);

    if (explicitWidth) formats[widthFormat] = cssLengthToPixels(explicitWidth);
  });

  if (borderColor) formats['table-cell-border-color'] = borderColor;

  return Object.fromEntries(Object.entries(formats).filter(([, value]) => value !== undefined));
}

function mergeFormatsIntoDelta(delta: Delta, formats: FormatMap, block: boolean): Delta {
  if (Object.keys(formats).length === 0) return delta;

  return delta.reduce((result, op) => {
    if (op.insert === undefined || op.insert === null) return result;

    if (typeof op.insert !== 'string') {
      return result.insert(op.insert, op.attributes ?? {});
    }

    if (!block) {
      return result.insert(op.insert, { ...op.attributes, ...formats });
    }

    const segments = op.insert.match(/[^\n]*\n|[^\n]+$/g) || [];

    segments.forEach((segment) => {
      const isLineBreak = segment.endsWith('\n');
      result.insert(segment, isLineBreak ? { ...op.attributes, ...formats } : op.attributes);
    });

    return result;
  }, new Delta());
}

function mergeCellFormatsIntoTableUp(delta: Delta, formats: FormatMap): Delta {
  delta.ops.forEach((op) => {
    const cellValue = op.attributes?.[TABLE_UP_CELL_FORMAT];

    if (!cellValue || typeof cellValue !== 'object') return;

    const style = document.createElement('div').style;
    const value = cellValue as Record<string, unknown>;

    style.cssText = typeof value.style === 'string' ? value.style : '';
    style.removeProperty('width');
    Object.entries(formats).forEach(([name, formatValue]) => {
      const property = CELL_FORMAT_CSS_PROPERTIES[name];

      if (property && typeof formatValue === 'string') {
        style.setProperty(property, formatValue);
      }
    });
    value.style = style.cssText;

    if (value.width !== undefined) delete value.width;
  });

  return delta;
}

function wordElementMatcher(node: Node, delta: Delta): Delta {
  if (!(node instanceof HTMLElement)) return delta;

  const tagName = node.tagName.toLowerCase();

  if (tagName === 'td' || tagName === 'th') {
    const formats = getCellFormats(node as HTMLTableCellElement);

    return mergeCellFormatsIntoTableUp(delta, formats);
  }

  if (/^(p|div|li|h[1-6])$/.test(tagName)) {
    (node as HTMLElement).style.removeProperty('width');

    return mergeFormatsIntoDelta(delta, getBlockFormats(node), true);
  }

  if (/^(span|font|b|strong|i|em|u|s|strike|sub|sup)$/.test(tagName)) {
    const formats = getInlineFormats(node);

    if (tagName === 'b' || tagName === 'strong') formats.bold = true;
    if (tagName === 'i' || tagName === 'em') formats.italic = true;
    if (tagName === 'u') formats.underline = true;
    if (tagName === 's' || tagName === 'strike') formats.strike = true;
    if (tagName === 'sub') formats['word-vertical-align'] = 'sub';
    if (tagName === 'sup') formats['word-vertical-align'] = 'super';

    return mergeFormatsIntoDelta(delta, formats, false);
  }

  return delta;
}

class WordPastePlugin extends Module {
  constructor(quill: Quill) {
    super(quill);

    const clipboard = quill.getModule('clipboard') as ClipboardModule;
    clipboard.addMatcher(Node.ELEMENT_NODE, wordElementMatcher);
    clipboard.addMatcher('td', wordElementMatcher);
    clipboard.addMatcher('th', wordElementMatcher);
  }
}

Quill.register('modules/wordPaste', WordPastePlugin);

export default WordPastePlugin;

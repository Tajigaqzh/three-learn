import { useEffect, useRef, useState } from 'react';
import { SafeArea } from 'antd-mobile';
import Quill, { Delta } from 'quill';
import TableUp, { TableCellInnerFormat } from 'quill-table-up';
import IPhoneXSimulator from '@/components/IPhoneXSimulator/IPhoneXSimulator';
import 'quill/dist/quill.snow.css';
import 'quill-table-up/index.css';
import './WordPastePlugin';
import './index.less';

Quill.register({ [`modules/${TableUp.moduleName}`]: TableUp }, true);

type ToolbarHandlerContext = {
  quill: Quill;
};

type QuillFormats = Record<string, unknown>;

type QuillRange = {
  index: number;
  length: number;
};

type TableModule = {
  insertTable: (rows: number, columns: number) => void;
  setCellAttrs: (
    cells: TableCellInnerFormat[],
    attribute: string,
    value?: unknown,
    isStyle?: boolean,
  ) => void;
};

type HighlightRegistryCompat = {
  delete: (name: string) => boolean;
  set: (name: string, highlight: unknown) => void;
};

type HighlightConstructorCompat = new (...ranges: Range[]) => unknown;
type QuillBlot = Parameters<Quill['getIndex']>[0];

function isQuillBlot(value: ReturnType<typeof Quill.find>): value is QuillBlot {
  return value !== null && !(value instanceof Quill);
}

function getCustomHighlightApi() {
  const registry = (CSS as unknown as { highlights?: HighlightRegistryCompat }).highlights;
  const HighlightConstructor = (globalThis as unknown as { Highlight?: HighlightConstructorCompat })
    .Highlight;

  return { registry, HighlightConstructor };
}

const BLOCK_FORMATS = new Set([
  'align',
  'blockquote',
  'code-block',
  'direction',
  'header',
  'indent',
  'list',
  'word-line-height',
  'word-margin-bottom',
  'word-margin-left',
  'word-margin-right',
  'word-margin-top',
  'word-text-indent',
  'table-cell-background',
  'table-cell-border-bottom',
  'table-cell-border-color',
  'table-cell-border-left',
  'table-cell-border-right',
  'table-cell-border-top',
  'table-cell-border-top-style',
  'table-cell-border-right-style',
  'table-cell-border-bottom-style',
  'table-cell-border-left-style',
  'table-cell-padding',
  'table-cell-width',
  'table-cell-vertical-align',
]);
const TOOLBAR_SELECTION_HIGHLIGHT = 'quill-toolbar-selection';

function buildDelta() {
  return new Delta();
}

const Index = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    if (previewHtml === null) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewHtml(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewHtml]);

  const openPreview = () => {
    const editorContent = editorRef.current?.querySelector('.ql-editor');

    if (!editorContent) return;

    const previewContent = editorContent.cloneNode(true) as HTMLElement;

    previewContent.removeAttribute('contenteditable');
    previewContent.querySelectorAll('[contenteditable]').forEach((element) => {
      element.removeAttribute('contenteditable');
    });

    setPreviewHtml(previewContent.innerHTML);
  };

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) return;

    const toolbar = editor
      .closest('.antd-mobile-editor-page')
      ?.querySelector<HTMLElement>('#antd-mobile-toolbar');
    const pristineToolbarHtml = toolbar?.innerHTML ?? '';
    const formatPainterButton = editor
      .closest('.antd-mobile-editor-page')
      ?.querySelector<HTMLButtonElement>('.ql-format-painter');
    let copiedFormats: QuillFormats | null = null;
    let isFormatPainterActive = false;
    let lastSelection: QuillRange | null = null;

    const clearToolbarSelectionHighlight = () => {
      getCustomHighlightApi().registry?.delete(TOOLBAR_SELECTION_HIGHLIGHT);
    };

    const preserveSelectionHighlight = () => {
      const { registry, HighlightConstructor } = getCustomHighlightApi();

      if (!registry || !HighlightConstructor) return;

      const selection = window.getSelection();

      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      if (!editor.contains(range.commonAncestorContainer)) return;

      registry.set(TOOLBAR_SELECTION_HIGHLIGHT, new HighlightConstructor(range.cloneRange()));
    };

    const getTargetRange = (quill: Quill) => quill.getSelection() ?? lastSelection;

    const createInlineFormatHandler = (formatName: string) =>
      function (this: ToolbarHandlerContext) {
        const range = getTargetRange(this.quill);

        if (!range) return;

        const isActive = Boolean(this.quill.getFormat(range)[formatName]);
        this.quill.setSelection(range.index, range.length, 'silent');

        if (range.length > 0) {
          this.quill.formatText(range.index, range.length, formatName, !isActive, 'user');
        } else {
          this.quill.format(formatName, !isActive, 'user');
        }

        this.quill.setSelection(range.index, range.length, 'silent');
      };

    const handleColor = function (this: ToolbarHandlerContext, value: string | false) {
      const range = getTargetRange(this.quill);

      if (!range) return;

      this.quill.setSelection(range.index, range.length, 'silent');

      if (range.length > 0) {
        this.quill.formatText(range.index, range.length, 'color', value || false, 'user');
      } else {
        this.quill.format('color', value || false, 'user');
      }

      this.quill.setSelection(range.index, range.length, 'silent');
    };

    const handleFirstLineIndent = function (this: ToolbarHandlerContext, value: string) {
      const range = getTargetRange(this.quill);

      if (!range) return;

      this.quill.setSelection(range.index, range.length, 'silent');
      this.quill.format('word-text-indent', value || false, 'user');
      this.quill.setSelection(range.index, range.length, 'silent');
    };

    const tablePicker = toolbar?.querySelector<HTMLElement>('.table-picker');
    const tablePickerLabel = toolbar?.querySelector<HTMLElement>('.table-picker-label');
    const tableCellMenu = editor
      .closest('.antd-mobile-editor-page')
      ?.querySelector<HTMLElement>('.table-cell-menu');
    const tableCellMenuHeading = tableCellMenu?.querySelector<HTMLElement>(
      '.table-cell-menu-heading',
    );
    const tableRowHandle = editor
      .closest('.antd-mobile-editor-page')
      ?.querySelector<HTMLButtonElement>('.table-row-handle');
    let activeCellIndex: number | null = null;
    let activeRowCellIndexes: number[] | null = null;
    let activeTableCells: HTMLTableCellElement[] = [];
    let selectedTableRow: HTMLTableRowElement | null = null;
    let hoveredTableRow: HTMLTableRowElement | null = null;
    let activeBorderWidth = '3px';

    const handleInsertTableMenu = () => {
      if (tablePicker) {
        tablePicker.hidden = !tablePicker.hidden;
      }
    };

    const setFormatPainterActive = (active: boolean) => {
      isFormatPainterActive = active;
      formatPainterButton?.classList.toggle('ql-active', active);
      formatPainterButton?.setAttribute('aria-pressed', String(active));
    };

    const cancelFormatPainterForToolbarAction = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      preserveSelectionHighlight();

      if (target.closest('.ql-format-painter')) return;

      if (isFormatPainterActive) {
        copiedFormats = null;
        setFormatPainterActive(false);
      }
    };

    const handleFormatPainter = function (this: ToolbarHandlerContext) {
      if (isFormatPainterActive) {
        copiedFormats = null;
        setFormatPainterActive(false);
        return;
      }

      const range = this.quill.getSelection();

      if (!range) return;

      copiedFormats = Object.fromEntries(
        Object.entries(this.quill.getFormat(range)).map(([name, value]) => [
          name,
          Array.isArray(value) ? value[0] : value,
        ]),
      );
      setFormatPainterActive(true);
    };

    const quill = new Quill(editor, {
      theme: 'snow',
      modules: {
        [TableUp.moduleName]: {
          full: true,
        },
        wordPaste: true,
        toolbar: {
          container: '#antd-mobile-toolbar',
          handlers: {
            bold: createInlineFormatHandler('bold'),
            italic: createInlineFormatHandler('italic'),
            underline: createInlineFormatHandler('underline'),
            strike: createInlineFormatHandler('strike'),
            color: handleColor,
            'first-line-indent': handleFirstLineIndent,
            'format-painter': handleFormatPainter,
            'insert-table': handleInsertTableMenu,
          },
        },
      },
    });

    quill.setContents(buildDelta());

    const closeTableCellMenu = () => {
      if (tableCellMenu) {
        tableCellMenu.hidden = true;
      }
      activeRowCellIndexes = null;
      activeTableCells = [];
    };

    const hideTableRowHandle = () => {
      if (tableRowHandle) {
        tableRowHandle.hidden = true;
      }
      hoveredTableRow = null;
    };

    const positionTableCellMenu = (left: number, top: number) => {
      if (!tableCellMenu) return;

      tableCellMenu.hidden = false;
      const menuWidth = tableCellMenu.offsetWidth;
      const menuHeight = tableCellMenu.offsetHeight;
      tableCellMenu.style.left = `${Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8))}px`;
      tableCellMenu.style.top = `${Math.max(8, Math.min(top, window.innerHeight - menuHeight - 8))}px`;
    };

    const selectTableRow = (row: HTMLTableRowElement | null) => {
      selectedTableRow?.classList.remove('is-row-selected');
      selectedTableRow = row;
      selectedTableRow?.classList.add('is-row-selected');
    };

    const handleEditorPointerDown = (event: PointerEvent) => {
      const cell = (event.target as HTMLElement).closest<HTMLTableCellElement>('td');

      if (cell) {
        selectTableRow(cell.parentElement as HTMLTableRowElement);
      } else {
        selectTableRow(null);
        closeTableCellMenu();
      }
    };

    const handleEditorPointerMove = (event: PointerEvent) => {
      const row = (event.target as HTMLElement).closest<HTMLTableRowElement>('tr');

      if (!row || !tableRowHandle) {
        hideTableRowHandle();
        return;
      }

      hoveredTableRow = row;
      const rowRect = row.getBoundingClientRect();
      tableRowHandle.hidden = false;
      tableRowHandle.style.left = `${Math.max(4, rowRect.left - 24)}px`;
      tableRowHandle.style.top = `${rowRect.top + 2}px`;
    };

    const handleEditorPointerLeave = (event: PointerEvent) => {
      const nextTarget = event.relatedTarget as Node | null;

      if (
        (nextTarget && tableRowHandle?.contains(nextTarget)) ||
        (nextTarget && tableCellMenu?.contains(nextTarget))
      ) {
        return;
      }

      hideTableRowHandle();
    };

    const handleTableRowButtonClick = () => {
      if (!hoveredTableRow || !tableCellMenu || !tableRowHandle) return;

      activeRowCellIndexes = Array.from(hoveredTableRow.cells)
        .map((cell) => Quill.find(cell))
        .filter(isQuillBlot)
        .map((blot) => quill.getIndex(blot));
      activeTableCells = Array.from(hoveredTableRow.cells) as HTMLTableCellElement[];

      if (activeRowCellIndexes.length === 0) return;

      activeCellIndex = activeRowCellIndexes[0];
      lastSelection = { index: activeCellIndex, length: 0 };
      selectTableRow(hoveredTableRow);
      tablePicker?.setAttribute('hidden', '');

      if (tableCellMenuHeading) {
        tableCellMenuHeading.textContent = '整行格式';
      }

      const handleRect = tableRowHandle.getBoundingClientRect();
      positionTableCellMenu(handleRect.right + 6, handleRect.top);
    };

    const handleCellContextMenu = (event: MouseEvent) => {
      const cell = (event.target as HTMLElement).closest<HTMLTableCellElement>('td');

      if (!cell || !tableCellMenu) return;

      const cellBlot = Quill.find(cell);

      if (!isQuillBlot(cellBlot)) return;

      event.preventDefault();
      activeRowCellIndexes = null;
      activeTableCells = [cell];
      activeCellIndex = quill.getIndex(cellBlot);
      lastSelection = { index: activeCellIndex, length: 0 };
      selectTableRow(cell.parentElement as HTMLTableRowElement);
      tablePicker?.setAttribute('hidden', '');
      if (tableCellMenuHeading) {
        tableCellMenuHeading.textContent = '单元格格式';
      }
      positionTableCellMenu(event.clientX, event.clientY);
    };

    const handleTableCellMenuClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');

      const targetIndexes =
        activeRowCellIndexes ?? (activeCellIndex === null ? [] : [activeCellIndex]);

      if (!button || targetIndexes.length === 0 || !tableCellMenu) return;

      const tableModule = quill.getModule(TableUp.moduleName) as TableModule;
      const tableCellInners = activeTableCells
        .map((cell) => cell.querySelector<HTMLElement>('.ql-table-cell-inner'))
        .map((cellInner) => (cellInner ? Quill.find(cellInner) : null))
        .filter((blot): blot is TableCellInnerFormat => blot instanceof TableCellInnerFormat);

      const cellStyleNames: Record<string, string> = {
        'table-cell-background': 'background-color',
        'table-cell-border-color': 'border-color',
        'table-cell-border-top': 'border-top-width',
        'table-cell-border-right': 'border-right-width',
        'table-cell-border-bottom': 'border-bottom-width',
        'table-cell-border-left': 'border-left-width',
      };

      const formatTargets = (name: string, value: unknown) => {
        const cellStyleName = cellStyleNames[name];

        if (cellStyleName && tableCellInners.length > 0) {
          tableModule.setCellAttrs(tableCellInners, cellStyleName, value || undefined, true);
          return;
        }

        targetIndexes.forEach((index) => {
          quill.formatLine(index, 1, name, value, 'user');
        });
      };

      const formatTargetsWith = (formats: QuillFormats) => {
        const cellStyles = Object.entries(formats).filter(([name]) => cellStyleNames[name]);

        if (cellStyles.length > 0 && tableCellInners.length > 0) {
          cellStyles.forEach(([name, value]) => {
            tableModule.setCellAttrs(
              tableCellInners,
              cellStyleNames[name],
              value || undefined,
              true,
            );
          });
          return;
        }

        targetIndexes.forEach((index) => {
          quill.formatLine(index, 1, formats, 'user');
        });
      };

      if (button.hasAttribute('data-cell-background')) {
        formatTargets('table-cell-background', button.dataset.cellBackground || false);
        return;
      }

      if (button.hasAttribute('data-border-width')) {
        activeBorderWidth = button.dataset.borderWidth || '1px';
        tableCellMenu
          ?.querySelectorAll<HTMLButtonElement>('[data-border-width]')
          .forEach((item) =>
            item.classList.toggle('is-active', item.dataset.borderWidth === activeBorderWidth),
          );
        return;
      }

      if (button.hasAttribute('data-border-color')) {
        formatTargets('table-cell-border-color', button.dataset.borderColor || false);
        return;
      }

      const borderSide = button.dataset.cellBorder;
      const borderFormats = {
        top: 'table-cell-border-top',
        right: 'table-cell-border-right',
        bottom: 'table-cell-border-bottom',
        left: 'table-cell-border-left',
      } as const;

      if (borderSide && borderSide in borderFormats) {
        const formatName = borderFormats[borderSide as keyof typeof borderFormats];
        const styleName = cellStyleNames[formatName];
        const shouldRemove =
          activeTableCells.length > 0
            ? activeTableCells.every(
                (cell) => cell.style.getPropertyValue(styleName) === activeBorderWidth,
              )
            : targetIndexes.every(
                (index) => quill.getFormat(index, 1)[formatName] === activeBorderWidth,
              );
        formatTargets(formatName, shouldRemove ? false : activeBorderWidth);
        button.classList.toggle('is-active', !shouldRemove);
        return;
      }

      if (button.dataset.cellBorderAll !== undefined) {
        formatTargetsWith(
          Object.fromEntries(Object.values(borderFormats).map((name) => [name, activeBorderWidth])),
        );
        tableCellMenu
          ?.querySelectorAll<HTMLButtonElement>('[data-cell-border]')
          .forEach((item) => item.classList.add('is-active'));
        return;
      }

      if (button.dataset.cellBorderReset !== undefined) {
        formatTargetsWith(
          Object.fromEntries(Object.values(borderFormats).map((name) => [name, false])),
        );
        formatTargets('table-cell-border-color', false);
        tableCellMenu
          .querySelectorAll<HTMLButtonElement>('[data-cell-border]')
          .forEach((item) => item.classList.remove('is-active'));
      }
    };

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;

      if (
        tableCellMenu?.contains(target) ||
        tableRowHandle?.contains(target) ||
        target.closest('td')
      ) {
        return;
      }

      closeTableCellMenu();
      selectTableRow(null);
      hideTableRowHandle();
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTableCellMenu();
        selectTableRow(null);
      }
    };

    const handleTablePickerPointerOver = (event: PointerEvent) => {
      const cell = (event.target as HTMLElement).closest<HTMLButtonElement>('.table-grid-cell');

      if (!cell || !tablePicker) return;

      const rows = Number(cell.dataset.row);
      const columns = Number(cell.dataset.column);
      tablePicker.querySelectorAll<HTMLButtonElement>('.table-grid-cell').forEach((item) => {
        item.classList.toggle(
          'is-selected',
          Number(item.dataset.row) <= rows && Number(item.dataset.column) <= columns,
        );
      });

      if (tablePickerLabel) {
        tablePickerLabel.textContent = `${rows} × ${columns} 表格`;
      }
    };

    const handleTablePickerClick = (event: MouseEvent) => {
      const cell = (event.target as HTMLElement).closest<HTMLButtonElement>('.table-grid-cell');

      if (!cell || !lastSelection) return;

      const rows = Number(cell.dataset.row);
      const columns = Number(cell.dataset.column);
      const requestedIndex = lastSelection.index + lastSelection.length;
      const [line, offset] = quill.getLine(requestedIndex);

      if (!line) return;

      const lineStart = requestedIndex - offset;
      const lineContentLength = Math.max(0, line.length() - 1);
      const lineEnd = lineStart + lineContentLength;
      const lineHasContent = quill.getText(lineStart, lineContentLength).length > 0;
      const insertIndex = lineHasContent ? lineEnd + 1 : lineEnd;
      const tableModule = quill.getModule(TableUp.moduleName) as TableModule;

      if (lineHasContent) {
        quill.insertText(lineEnd, '\n', 'user');
      }

      quill.setSelection(insertIndex, 0, 'silent');
      tableModule.insertTable(rows, columns);
      tablePicker?.setAttribute('hidden', '');
      lastSelection = { index: insertIndex, length: 0 };
    };

    tablePicker?.addEventListener('pointerover', handleTablePickerPointerOver);
    tablePicker?.addEventListener('click', handleTablePickerClick);
    editor.addEventListener('pointerdown', handleEditorPointerDown);
    editor.addEventListener('pointermove', handleEditorPointerMove);
    editor.addEventListener('pointerleave', handleEditorPointerLeave);
    editor.addEventListener('contextmenu', handleCellContextMenu);
    tableRowHandle?.addEventListener('click', handleTableRowButtonClick);
    tableCellMenu?.addEventListener('click', handleTableCellMenuClick);
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    document.addEventListener('keydown', handleDocumentKeyDown);
    window.addEventListener('scroll', closeTableCellMenu, true);

    const handleTextChange = (_delta: unknown, _oldDelta: unknown, source: string) => {
      if (source === 'user') {
        clearToolbarSelectionHighlight();
        console.log(_delta);
        console.log(quill.getText());
      }
    };

    const handleSelectionChange = (
      range: { index: number; length: number } | null,
      _oldRange: unknown,
      source: string,
    ) => {
      if (range && source === 'user') {
        clearToolbarSelectionHighlight();
      }

      if (range) {
        lastSelection = range;
      }

      if (!range || source !== 'user' || range.length === 0 || !copiedFormats) return;

      const inlineFormats: QuillFormats = {};
      const blockFormats: QuillFormats = {};

      Object.entries(copiedFormats).forEach(([name, value]) => {
        if (BLOCK_FORMATS.has(name)) {
          blockFormats[name] = value;
        } else {
          inlineFormats[name] = value;
        }
      });

      setFormatPainterActive(false);
      quill.removeFormat(range.index, range.length, 'user');

      if (Object.keys(inlineFormats).length > 0) {
        quill.formatText(range.index, range.length, inlineFormats, 'user');
      }

      if (Object.keys(blockFormats).length > 0) {
        quill.formatLine(range.index, range.length, blockFormats, 'user');
      }

      copiedFormats = null;
      quill.setSelection(range.index, range.length, 'silent');
    };

    quill.on('text-change', handleTextChange);
    quill.on('selection-change', handleSelectionChange);
    toolbar?.addEventListener('mousedown', cancelFormatPainterForToolbarAction);

    return () => {
      quill.off('text-change', handleTextChange);
      quill.off('selection-change', handleSelectionChange);
      toolbar?.removeEventListener('mousedown', cancelFormatPainterForToolbarAction);
      tablePicker?.removeEventListener('pointerover', handleTablePickerPointerOver);
      tablePicker?.removeEventListener('click', handleTablePickerClick);
      editor.removeEventListener('pointerdown', handleEditorPointerDown);
      editor.removeEventListener('pointermove', handleEditorPointerMove);
      editor.removeEventListener('pointerleave', handleEditorPointerLeave);
      editor.removeEventListener('contextmenu', handleCellContextMenu);
      tableRowHandle?.removeEventListener('click', handleTableRowButtonClick);
      tableCellMenu?.removeEventListener('click', handleTableCellMenuClick);
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
      document.removeEventListener('keydown', handleDocumentKeyDown);
      window.removeEventListener('scroll', closeTableCellMenu, true);
      quill.disable();
      clearToolbarSelectionHighlight();
      editor.replaceChildren();
      editor.className = '';
      if (toolbar) {
        toolbar.innerHTML = pristineToolbarHtml;
        toolbar.className = 'antd-mobile-toolbar';
      }
    };
  }, []);

  return (
    <main className="antd-mobile-editor-page">
      <SafeArea position="top" />

      <div className="antd-mobile-page-actions">
        <button type="button" className="antd-mobile-preview-button" onClick={openPreview}>
          预览
        </button>
      </div>

      <div id="antd-mobile-toolbar" className="antd-mobile-toolbar" aria-label="文本编辑工具栏">
        <span className="ql-formats toolbar-card" aria-label="文字样式">
          <button type="button" className="ql-bold" aria-label="粗体" />
          <button type="button" className="ql-italic" aria-label="斜体" />
          <button type="button" className="ql-underline" aria-label="下划线" />
          <button type="button" className="ql-strike" aria-label="删除线" />
          <button
            type="button"
            className="ql-format-painter"
            aria-label="格式刷"
            aria-pressed="false"
            title="格式刷"
          >
            格式刷
          </button>
        </span>

        <span className="ql-formats toolbar-card heading-card" aria-label="标题级别">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <button
              key={level}
              type="button"
              className="ql-header"
              value={level}
              data-label={`H${level}`}
              aria-label={`${level} 级标题`}
            />
          ))}
        </span>

        <span className="ql-formats toolbar-card" aria-label="段落对齐">
          <button type="button" className="ql-align" value="" aria-label="左对齐" />
          <button type="button" className="ql-align" value="center" aria-label="居中对齐" />
          <button type="button" className="ql-align" value="right" aria-label="右对齐" />
          <button type="button" className="ql-indent" value="-1" aria-label="减少缩进" />
          <button type="button" className="ql-indent" value="+1" aria-label="增加缩进" />
          <select
            className="ql-first-line-indent"
            defaultValue=""
            aria-label="首行缩进"
            title="首行缩进"
          >
            <option value="">首行缩进</option>
            <option value="1em">缩进 1 字符</option>
            <option value="2em">缩进 2 字符</option>
            <option value="3em">缩进 3 字符</option>
            <option value="4em">缩进 4 字符</option>
          </select>
        </span>

        <span className="ql-formats toolbar-card">
          <select className="ql-color" defaultValue="" aria-label="文字颜色">
            <option value="" aria-label="默认颜色" />
            <option value="#e5484d" aria-label="红色" />
            <option value="#e5a000" aria-label="黄色" />
            <option value="#30a46c" aria-label="绿色" />
            <option value="#3e63dd" aria-label="蓝色" />
          </select>
        </span>

        <span className="ql-formats toolbar-card">
          <button type="button" className="ql-list" value="ordered" aria-label="有序列表" />
          <button type="button" className="ql-list" value="bullet" aria-label="无序列表" />
          <button type="button" className="ql-link" aria-label="插入链接" />
          <button type="button" className="ql-clean" aria-label="清除格式" />
        </span>

        <span className="ql-formats toolbar-card table-toolbar-card">
          <button
            type="button"
            className="ql-insert-table"
            aria-label="插入表格"
            aria-haspopup="true"
            title="插入表格"
          >
            表格
          </button>
          <span className="table-picker" hidden>
            <span className="table-picker-label">选择表格尺寸</span>
            <span className="table-picker-grid">
              {Array.from({ length: 64 }, (_, index) => {
                const row = Math.floor(index / 8) + 1;
                const column = (index % 8) + 1;

                return (
                  <button
                    key={`${row}-${column}`}
                    type="button"
                    className="table-grid-cell"
                    data-row={row}
                    data-column={column}
                    aria-label={`${row} 行 ${column} 列`}
                  />
                );
              })}
            </span>
          </span>
        </span>
      </div>

      <button
        type="button"
        className="table-row-handle"
        aria-label="设置整行格式"
        title="设置整行格式"
        hidden
      >
        ⋮
      </button>

      <div className="table-cell-menu" role="menu" aria-label="表格格式" hidden>
        <div className="table-cell-menu-heading">单元格格式</div>
        <div className="table-cell-menu-title">单元格背景</div>
        <div className="table-cell-color-grid">
          {[
            ['', '默认背景'],
            ['#fee2e2', '浅红色'],
            ['#fef3c7', '浅黄色'],
            ['#dcfce7', '浅绿色'],
            ['#dbeafe', '浅蓝色'],
            ['#e5e7eb', '浅灰色'],
          ].map(([color, label]) => (
            <button
              key={label}
              type="button"
              className="table-cell-color"
              data-cell-background={color}
              aria-label={label}
              title={label}
              style={color ? { backgroundColor: color } : undefined}
            />
          ))}
        </div>

        <div className="table-cell-menu-title">加重边框</div>
        <div className="table-cell-border-width-grid" aria-label="边框粗细">
          {['1px', '2px', '3px', '4px'].map((width) => (
            <button
              key={width}
              type="button"
              className={width === '3px' ? 'is-active' : undefined}
              data-border-width={width}
            >
              {width}
            </button>
          ))}
        </div>

        <div className="table-cell-menu-title">边框颜色</div>
        <div className="table-cell-border-color-grid">
          {[
            ['', '默认边框色'],
            ['#111827', '黑色'],
            ['#6b7280', '灰色'],
            ['#dc2626', '红色'],
            ['#16a34a', '绿色'],
            ['#2563eb', '蓝色'],
          ].map(([color, label]) => (
            <button
              key={label}
              type="button"
              className="table-cell-border-color"
              data-border-color={color}
              aria-label={label}
              title={label}
              style={color ? { backgroundColor: color } : undefined}
            />
          ))}
        </div>

        <div className="table-cell-menu-title">应用边框</div>
        <div className="table-cell-border-grid">
          <button type="button" data-cell-border="top">
            上边
          </button>
          <button type="button" data-cell-border="right">
            右边
          </button>
          <button type="button" data-cell-border="bottom">
            下边
          </button>
          <button type="button" data-cell-border="left">
            左边
          </button>
          <button type="button" data-cell-border-all>
            全部
          </button>
        </div>
        <button type="button" className="table-cell-border-reset" data-cell-border-reset>
          恢复全部边框
        </button>
      </div>

      <div ref={editorRef} />
      {previewHtml !== null && (
        <div
          className="antd-mobile-preview-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewHtml(null);
          }}
        >
          <dialog
            open
            className="antd-mobile-preview-dialog"
            aria-modal="true"
            aria-label="手机预览"
          >
            <button
              type="button"
              className="antd-mobile-preview-close"
              aria-label="关闭预览"
              title="关闭预览"
              onClick={() => setPreviewHtml(null)}
            >
              ×
            </button>
            <IPhoneXSimulator>
              <div className="antd-mobile-preview-screen">
                <div className="antd-mobile-preview-backdrop" />
                <div className="antd-mobile-preview-drawer">
                  <div className="antd-mobile-preview-article">
                    <div
                      className="ql-editor"
                      contentEditable={false}
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                  <button
                    type="button"
                    className="antd-mobile-preview-confirm"
                    onClick={() => setPreviewHtml(null)}
                  >
                    确认并同意
                  </button>
                </div>
              </div>
            </IPhoneXSimulator>
          </dialog>
        </div>
      )}
    </main>
  );
};

export default Index;

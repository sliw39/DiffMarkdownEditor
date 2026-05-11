export interface TextFontOptions {
  color: string
  fontFamily: string
  /** CSS font-size, e.g. `16px` */
  baseSize: string
}

/** Margins inside the page (content inset), CSS lengths e.g. `2cm`, `12mm`. */
export interface DocumentMargins {
  top: string
  right: string
  bottom: string
  left: string
}

/** ISO presets or explicit **width** × **height** (CSS lengths). */
export type DocumentPageSize =
  | 'A4'
  | 'A5'
  | {
      /** CSS length, e.g. `210mm` */
      width: string
      /** CSS length, e.g. `297mm` */
      height: string
    }

export interface DocumentFormatOptions {
  pageSize: DocumentPageSize
  margins: DocumentMargins
}

export type PartialDocumentFormatOptions = {
  pageSize?: DocumentPageSize
  margins?: Partial<DocumentMargins>
}

export interface DiffMarkdownRenderOptions {
  /** Outer frame background (page chrome, toolbars) */
  frameBgColor: string
  frameTextFont: TextFontOptions
  /** Inner document / editor surface */
  documentBgColor: string
  documentTextFont: TextFontOptions
  /** Accent colors consumed by editor bundle CSS. */
  colorPrimary: string
  colorSecondary: string
  /** Printable area: page dimensions and inner margins */
  documentFormat: DocumentFormatOptions
}

export function defaultDocumentMargins(): DocumentMargins {
  return { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
}

export function defaultDocumentFormat(): DocumentFormatOptions {
  return { pageSize: 'A4', margins: defaultDocumentMargins() }
}

export function defaultRenderOptions(): DiffMarkdownRenderOptions {
  return {
    frameBgColor: '#f0f0f0',
    frameTextFont: {
      color: '#333333',
      fontFamily: 'sans-serif',
      baseSize: '16px',
    },
    documentBgColor: '#ffffff',
    documentTextFont: {
      color: '#333333',
      fontFamily: 'sans-serif',
      baseSize: '16px',
    },
    colorPrimary: '#333333',
    colorSecondary: '#666666',
    documentFormat: defaultDocumentFormat(),
  }
}

export function mergePartialDocumentFormat(
  base: DocumentFormatOptions,
  partial?: PartialDocumentFormatOptions,
): DocumentFormatOptions {
  if (!partial) return base
  return {
    pageSize: partial.pageSize ?? base.pageSize,
    margins: { ...base.margins, ...partial.margins },
  }
}

function resolvePageDimensions(pageSize: DocumentPageSize): { width: string; height: string } {
  if (pageSize === 'A4') return { width: '210mm', height: '297mm' }
  if (pageSize === 'A5') return { width: '148mm', height: '210mm' }
  return pageSize
}

/** CSS custom properties for `.dm-editor-document` (page box). */
export function documentFormatToCssVars(fmt: DocumentFormatOptions): Record<string, string> {
  const { width, height } = resolvePageDimensions(fmt.pageSize)
  const m = fmt.margins
  return {
    '--dm-doc-width': width,
    '--dm-doc-min-height': height,
    '--dm-doc-margin-top': m.top,
    '--dm-doc-margin-right': m.right,
    '--dm-doc-margin-bottom': m.bottom,
    '--dm-doc-margin-left': m.left,
  }
}

export type PartialRenderOptions = Omit<
  Partial<DiffMarkdownRenderOptions>,
  'frameTextFont' | 'documentTextFont' | 'documentFormat'
> & {
  frameTextFont?: Partial<TextFontOptions>
  documentTextFont?: Partial<TextFontOptions>
  documentFormat?: PartialDocumentFormatOptions
}

export function mergeRenderOptions(partial?: PartialRenderOptions): DiffMarkdownRenderOptions {
  const d = defaultRenderOptions()
  if (!partial) return d
  return {
    frameBgColor: partial.frameBgColor ?? d.frameBgColor,
    documentBgColor: partial.documentBgColor ?? d.documentBgColor,
    frameTextFont: { ...d.frameTextFont, ...partial.frameTextFont },
    documentTextFont: { ...d.documentTextFont, ...partial.documentTextFont },
    colorPrimary: partial.colorPrimary ?? d.colorPrimary,
    colorSecondary: partial.colorSecondary ?? d.colorSecondary,
    documentFormat: mergePartialDocumentFormat(d.documentFormat, partial.documentFormat),
  }
}

export function renderOptionsToCssVars(opts: DiffMarkdownRenderOptions): Record<string, string> {
  return {
    '--dm-frame-bg': opts.frameBgColor,
    '--dm-frame-color': opts.frameTextFont.color,
    '--dm-frame-font-family': opts.frameTextFont.fontFamily,
    '--dm-frame-font-size': opts.frameTextFont.baseSize,
    '--dm-doc-bg': opts.documentBgColor,
    '--dm-doc-color': opts.documentTextFont.color,
    '--dm-doc-font-family': opts.documentTextFont.fontFamily,
    '--dm-doc-font-size': opts.documentTextFont.baseSize,
    '--dm-color-primary': opts.colorPrimary,
    '--dm-color-secondary': opts.colorSecondary,
    ...documentFormatToCssVars(opts.documentFormat),
  }
}

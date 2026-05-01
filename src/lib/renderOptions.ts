export interface TextFontOptions {
  color: string
  fontFamily: string
  /** CSS font-size, e.g. `16px` */
  baseSize: string
}

export interface DiffMarkdownRenderOptions {
  /** Outer frame background (page chrome, toolbars) */
  frameBgColor: string
  frameTextFont: TextFontOptions
  /** Inner document / editor surface */
  documentBgColor: string
  documentTextFont: TextFontOptions
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
  }
}

export type PartialRenderOptions = Omit<
  Partial<DiffMarkdownRenderOptions>,
  'frameTextFont' | 'documentTextFont'
> & {
  frameTextFont?: Partial<TextFontOptions>
  documentTextFont?: Partial<TextFontOptions>
}

export function mergeRenderOptions(partial?: PartialRenderOptions): DiffMarkdownRenderOptions {
  const d = defaultRenderOptions()
  if (!partial) return d
  return {
    frameBgColor: partial.frameBgColor ?? d.frameBgColor,
    documentBgColor: partial.documentBgColor ?? d.documentBgColor,
    frameTextFont: { ...d.frameTextFont, ...partial.frameTextFont },
    documentTextFont: { ...d.documentTextFont, ...partial.documentTextFont },
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
  }
}

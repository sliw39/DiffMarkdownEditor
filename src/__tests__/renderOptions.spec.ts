import { describe, it, expect } from 'vitest'
import {
  defaultRenderOptions,
  mergeRenderOptions,
  renderOptionsToCssVars,
  documentFormatToCssVars,
  defaultDocumentFormat,
} from '../lib/renderOptions'

describe('renderOptions', () => {
  it('defaultRenderOptions matches baseline theme', () => {
    const d = defaultRenderOptions()
    expect(d.frameBgColor).toBe('#f0f0f0')
    expect(d.documentBgColor).toBe('#ffffff')
    expect(d.frameTextFont.color).toBe('#333333')
    expect(d.documentTextFont.baseSize).toBe('16px')
    expect(d.documentFormat.pageSize).toBe('A4')
    expect(d.documentFormat.margins.top).toBe('2cm')
  })

  it('mergeRenderOptions fills partial top-level fields', () => {
    const m = mergeRenderOptions({ frameBgColor: '#111111' })
    expect(m.frameBgColor).toBe('#111111')
    expect(m.documentBgColor).toBe('#ffffff')
  })

  it('mergeRenderOptions deep-merges font options', () => {
    const m = mergeRenderOptions({
      documentTextFont: { baseSize: '18px' },
      frameTextFont: { color: '#ff0000' },
    })
    expect(m.documentTextFont.baseSize).toBe('18px')
    expect(m.documentTextFont.color).toBe('#333333')
    expect(m.frameTextFont.color).toBe('#ff0000')
    expect(m.frameTextFont.fontFamily).toBe('sans-serif')
  })

  it('renderOptionsToCssVars maps to custom properties', () => {
    const vars = renderOptionsToCssVars(defaultRenderOptions())
    expect(vars['--dm-frame-bg']).toBe('#f0f0f0')
    expect(vars['--dm-doc-bg']).toBe('#ffffff')
    expect(vars['--dm-doc-font-size']).toBe('16px')
    expect(vars['--dm-doc-width']).toBe('210mm')
    expect(vars['--dm-doc-min-height']).toBe('297mm')
    expect(vars['--dm-doc-margin-top']).toBe('2cm')
  })

  it('mergeRenderOptions merges documentFormat presets and margins', () => {
    const m = mergeRenderOptions({
      documentFormat: {
        pageSize: 'A5',
        margins: { top: '15mm' },
      },
    })
    expect(m.documentFormat.pageSize).toBe('A5')
    expect(m.documentFormat.margins.top).toBe('15mm')
    expect(m.documentFormat.margins.right).toBe('2cm')
    const vars = documentFormatToCssVars(m.documentFormat)
    expect(vars['--dm-doc-width']).toBe('148mm')
    expect(vars['--dm-doc-min-height']).toBe('210mm')
  })

  it('documentFormatToCssVars accepts custom width and height', () => {
    const fmt = {
      ...defaultDocumentFormat(),
      pageSize: { width: '180mm', height: '250mm' } as const,
    }
    const vars = documentFormatToCssVars(fmt)
    expect(vars['--dm-doc-width']).toBe('180mm')
    expect(vars['--dm-doc-min-height']).toBe('250mm')
  })
})

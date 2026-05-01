import { describe, it, expect } from 'vitest'
import { defaultRenderOptions, mergeRenderOptions, renderOptionsToCssVars } from '../lib/renderOptions'

describe('renderOptions', () => {
  it('defaultRenderOptions matches baseline theme', () => {
    const d = defaultRenderOptions()
    expect(d.frameBgColor).toBe('#f0f0f0')
    expect(d.documentBgColor).toBe('#ffffff')
    expect(d.frameTextFont.color).toBe('#333333')
    expect(d.documentTextFont.baseSize).toBe('16px')
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
  })
})

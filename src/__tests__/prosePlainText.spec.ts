import { describe, it, expect } from 'vitest'
import { Schema } from 'prosemirror-model'
import {
  buildPlainTextIndex,
  nthSubstringRangeInPlain,
  nthOccurrenceInSingleTextNode,
} from '../lib/prosePlainText'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    text: { group: 'inline' },
  },
})

function docFromPlain(paragraphs: string[]) {
  return schema.node(
    'doc',
    null,
    paragraphs.map((t) => schema.node('paragraph', null, t ? schema.text(t) : [])),
  )
}

describe('prosePlainText', () => {
  it('maps plain indices to ProseMirror positions', () => {
    const doc = docFromPlain(['Hello world'])
    const { plain, startPos } = buildPlainTextIndex(doc)
    expect(plain).toBe('Hello world')
    expect(startPos[0]).toBe(1)
    expect(startPos[6]).toBe(7)
    const r = nthSubstringRangeInPlain(plain, startPos, 'world', 0)
    expect(r).toEqual({ from: 7, to: 12 })
  })

  it('returns nth occurrence for duplicate needles', () => {
    const doc = docFromPlain(['a x b x c'])
    const { plain, startPos } = buildPlainTextIndex(doc)
    expect(nthSubstringRangeInPlain(plain, startPos, 'x', 0)).toEqual({ from: 3, to: 4 })
    expect(nthSubstringRangeInPlain(plain, startPos, 'x', 1)).toEqual({ from: 7, to: 8 })
  })

  it('nthOccurrenceInSingleTextNode does not match across paragraph boundaries', () => {
    const doc = docFromPlain(['aa', 'bb'])
    expect(nthOccurrenceInSingleTextNode(doc, 'ab', 0)).toBeNull()
    expect(nthOccurrenceInSingleTextNode(doc, 'aa', 0)).toEqual({ from: 1, to: 3 })
  })
})

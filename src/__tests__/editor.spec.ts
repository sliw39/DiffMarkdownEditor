import { describe, it, expect } from 'vitest'
import {
  createEditorState,
  fuzzyMatch,
  fullDiff,
  acceptDiff,
  discardDiff,
  externalUpdateFragment,
  externalUpdateAll,
  type Diff
} from '../lib/editor'

describe('EditorState logic', () => {
  describe('fuzzyMatch', () => {
    it('finds a fragment when there is a perfect match', () => {
      const text = 'This is a test document with some words.'
      const fragment = { originalText: 'test document', newText: 'tested document' }

      const diff = fuzzyMatch(text, fragment)

      expect(diff).not.toBeNull()
      expect(diff?.originalText).toBe('test document')
      expect(diff?.newText).toBe('tested document')
      expect(diff?.id).toBeTypeOf('string')
    })

    it('finds a fragment with a fuzzy match (typo)', () => {
      const text = 'This is a test ducument with some words.' // typo in text
      const fragment = { originalText: 'test document', newText: 'tested document' }

      const diff = fuzzyMatch(text, fragment, 0.5) // Lower threshold to allow match

      expect(diff).not.toBeNull()
      expect(diff?.originalText).toBe('test document')
    })

    it('returns null if there is no match within threshold', () => {
      const text = 'This is completely unrelated text.'
      const fragment = { originalText: 'test document', newText: 'tested document' }

      const diff = fuzzyMatch(text, fragment)

      expect(diff).toBeNull()
    })
  })

  describe('fullDiff', () => {
    it('computes diff correctly', () => {
      const diffs = fullDiff('Hello World', 'Hello Vitest')
      expect(diffs).toContainEqual([0, 'Hello '])
      expect(diffs).toContainEqual([-1, 'World'])
      expect(diffs).toContainEqual([1, 'Vitest'])
    })
  })

  describe('acceptDiff', () => {
    it('applies the diff to prevDraft and removes from activeDiffs', () => {
      const state = createEditorState('Original text')
      state.currentDraft = 'Updated text'
      const diff: Diff = {
        id: '1',
        originalText: 'Original',
        newText: 'Updated'
      }
      state.activeDiffs.push(diff)

      acceptDiff(state, diff)

      expect(state.prevDraft).toBe('Updated text')
      expect(state.activeDiffs).toHaveLength(0)
    })
  })

  describe('discardDiff', () => {
    it('applies inverse diff to currentDraft and removes from activeDiffs', () => {
      const state = createEditorState('Original text')
      state.currentDraft = 'Updated text'
      const diff: Diff = {
        id: '1',
        originalText: 'Original',
        newText: 'Updated'
      }
      state.activeDiffs.push(diff)

      discardDiff(state, diff)

      expect(state.currentDraft).toBe('Original text')
      expect(state.activeDiffs).toHaveLength(0)
    })
  })

  describe('externalUpdateFragment', () => {
    it('applies a fragment to currentDraft and adds a diff', () => {
      const state = createEditorState('This is a test document.')
      const fragment = { originalText: 'test document', newText: 'tested document' }

      externalUpdateFragment(state, fragment)

      expect(state.currentDraft).toBe('This is a tested document.')
      expect(state.activeDiffs).toHaveLength(1)
      // dmp.patch_make chunks the diff automatically based on context, so the extracted
      // text may contain surrounding context characters, e.g. "s a test documen" instead of "test document".
      expect(state.activeDiffs[0].originalText).toContain('test documen')
      expect(state.activeDiffs[0].newText).toContain('tested documen')
    })

    it('does nothing if fragment is not found', () => {
      const state = createEditorState('This is a test document.')
      const fragment = { originalText: 'foo bar', newText: 'baz' }

      externalUpdateFragment(state, fragment)

      expect(state.currentDraft).toBe('This is a test document.')
      expect(state.activeDiffs).toHaveLength(0)
    })
  })

  describe('externalUpdateAll', () => {
    it('replaces currentDraft and adds chunks to activeDiffs', () => {
      const state = createEditorState('This is the original text. It has some sentences.')
      const newText = 'This is the original text. It has many sentences.'

      externalUpdateAll(state, newText)

      expect(state.currentDraft).toBe(newText)
      expect(state.activeDiffs.length).toBeGreaterThan(0)
      // Since dmp chunking is fuzzy, we just assert some change was captured
      expect(state.activeDiffs.some(d => d.newText.includes('many'))).toBe(true)
    })
  })
})

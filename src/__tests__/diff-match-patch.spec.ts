import { describe, it, expect } from 'vitest'
import DiffMatchPatch from 'diff-match-patch'

describe('diff-match-patch', () => {
  it('computes character-level diffs between two strings', () => {
    const dmp = new DiffMatchPatch()
    const diffs = dmp.diff_main('Hello World', 'Hello Vitest')
    expect(diffs).toContainEqual([DiffMatchPatch.DIFF_EQUAL, 'Hello '])
    expect(diffs).toContainEqual([DiffMatchPatch.DIFF_DELETE, 'World'])
    expect(diffs).toContainEqual([DiffMatchPatch.DIFF_INSERT, 'Vitest'])
  })

  it('performs fuzzy matching to locate a pattern inside text', () => {
    const dmp = new DiffMatchPatch()
    const index = dmp.match_main('Lorem ipsum dolor sit amet', 'ipsum', 0)
    expect(index).toBe(6)
  })

  it('creates and applies patches to transform one string into another', () => {
    const dmp = new DiffMatchPatch()
    const patches = dmp.patch_make('The cat sat on the mat', 'The cat sat on the hat')
    const [result] = dmp.patch_apply(patches, 'The cat sat on the mat')
    expect(result).toBe('The cat sat on the hat')
  })
})

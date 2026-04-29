import DiffMatchPatch, { type Diff as DMPDiff } from 'diff-match-patch'

const dmp = new DiffMatchPatch()

export interface FuzzyDiff {
  originalText: string
  newText: string
}

export interface Diff extends FuzzyDiff {
  id: string
}

export interface EditorState {
  prevDraft: string
  currentDraft: string
  activeDiffs: Diff[]
}

export function createEditorState(initialDraft: string = ''): EditorState {
  return {
    prevDraft: initialDraft,
    currentDraft: initialDraft,
    activeDiffs: [],
  }
}

/**
 * fuzzyMatch
 *
 * Tries to find `fuzzyDiff.originalText` inside `text` with a confidence threshold.
 * Returns a `Diff` with an id if a match is found, null otherwise.
 */
export function fuzzyMatch(
  text: string,
  fuzzyDiff: FuzzyDiff,
  confidenceThreshold: number = 0.9,
): Diff | null {
  const originalMatchThreshold = dmp.Match_Threshold
  try {
    dmp.Match_Threshold = 1 - confidenceThreshold
    const loc = dmp.match_main(text, fuzzyDiff.originalText, 0)
    if (loc === -1) {
      return null
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      originalText: fuzzyDiff.originalText,
      newText: fuzzyDiff.newText,
    }
  } finally {
    // Restore default
    dmp.Match_Threshold = originalMatchThreshold
  }
}

/**
 * fullDiff
 *
 * Returns standard diff-match-patch output.
 */
export function fullDiff(textA: string, textB: string): DMPDiff[] {
  const diffs = dmp.diff_main(textA, textB)
  dmp.diff_cleanupSemantic(diffs)
  return diffs
}

/**
 * acceptDiff
 *
 * Applies the given diff to `prevDraft` (because the current draft already contains it).
 * Removes the diff from activeDiffs.
 */
export function acceptDiff(state: EditorState, diff: Diff) {
  const patches = dmp.patch_make(diff.originalText, diff.newText)
  const [newPrev] = dmp.patch_apply(patches, state.prevDraft)

  // Even if partially applied or failed, we consider it accepted as the user requested
  state.prevDraft = newPrev
  state.activeDiffs = state.activeDiffs.filter((d) => d.id !== diff.id)
}

/**
 * discardDiff
 *
 * Applies the *reverse* patch to `currentDraft` to undo the AI's change.
 * Removes the diff from activeDiffs.
 */
export function discardDiff(state: EditorState, diff: Diff) {
  const inversePatches = dmp.patch_make(diff.newText, diff.originalText)
  const [newCurrent] = dmp.patch_apply(inversePatches, state.currentDraft)

  // Even if partially applied, we update state to discard
  state.currentDraft = newCurrent
  state.activeDiffs = state.activeDiffs.filter((d) => d.id !== diff.id)
}

/**
 * externalUpdateFragment
 *
 * A patch from the AI is coming in as a `FuzzyDiff`.
 * We attempt to find the original text in the `currentDraft` and apply the new text.
 * If successful, we add it to `activeDiffs`.
 */
export function externalUpdateFragment(state: EditorState, fragment: FuzzyDiff) {
  const diff = fuzzyMatch(state.currentDraft, fragment)
  if (diff) {
    const patches = dmp.patch_make(diff.originalText, diff.newText)
    const [newCurrent, results] = dmp.patch_apply(patches, state.currentDraft)

    // Only if at least one patch succeeded
    if (results.some((r) => r === true)) {
      state.currentDraft = newCurrent
      state.activeDiffs.push(diff)
    }
  }
}

/**
 * externalUpdateAll
 *
 * AI returned the entire new text. We diff it against `currentDraft`,
 * apply it, and push individual chunks as diffs.
 */
export function externalUpdateAll(state: EditorState, text: string) {
  const patches = dmp.patch_make(state.currentDraft, text)
  for (const patch of patches) {
    const p = patch as unknown as { diffs: DMPDiff[] };
    const originalText = p.diffs
      .filter((d: DMPDiff) => d[0] !== 1)
      .map((d: DMPDiff) => d[1])
      .join('')
    const newText = p.diffs
      .filter((d: DMPDiff) => d[0] !== -1)
      .map((d: DMPDiff) => d[1])
      .join('')

    if (originalText !== newText) {
      state.activeDiffs.push({
        id: Math.random().toString(36).substring(2, 9),
        originalText,
        newText,
      })
    }
  }
  state.currentDraft = text
}

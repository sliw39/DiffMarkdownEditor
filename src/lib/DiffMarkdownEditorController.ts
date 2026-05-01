import { reactive } from 'vue'
import type { Diff, EditorState, FuzzyDiff } from './editor'
import {
  acceptDiff as acceptDiffState,
  createEditorState,
  discardDiff as discardDiffState,
  externalUpdateAll as externalUpdateAllState,
  externalUpdateFragment as externalUpdateFragmentState,
  fuzzyMatch as fuzzyMatchText,
} from './editor'

export class DiffMarkdownEditorController {
  readonly state: EditorState

  constructor(initialDraft = '') {
    this.state = reactive(createEditorState(initialDraft))
  }

  acceptDiff(diff: Diff) {
    acceptDiffState(this.state, diff)
  }

  discardDiff(diff: Diff) {
    discardDiffState(this.state, diff)
  }

  externalUpdateFragment(fragment: FuzzyDiff) {
    externalUpdateFragmentState(this.state, fragment)
  }

  externalUpdateAll(text: string) {
    externalUpdateAllState(this.state, text)
  }

  fuzzyMatch(text: string, fragment: FuzzyDiff, confidenceThreshold?: number) {
    return fuzzyMatchText(text, fragment, confidenceThreshold)
  }
}

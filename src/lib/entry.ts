import './editor-bundle.css'

export { createDiffMarkdownEditor } from './createDiffMarkdownEditor'
export type { CreateDiffMarkdownEditorOptions, CreateDiffMarkdownEditorResult } from './createDiffMarkdownEditor'
export { DiffMarkdownEditorController } from './DiffMarkdownEditorController'
export {
  defaultRenderOptions,
  mergeRenderOptions,
  renderOptionsToCssVars,
  type DiffMarkdownRenderOptions,
  type PartialRenderOptions,
  type TextFontOptions,
} from './renderOptions'
export {
  acceptDiff,
  createEditorState,
  discardDiff,
  externalUpdateAll,
  externalUpdateFragment,
  fuzzyMatch,
  fullDiff,
  type Diff,
  type EditorState,
  type FuzzyDiff,
} from './editor'

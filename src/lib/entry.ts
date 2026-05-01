import './editor-bundle.css'

export { createDiffMarkdownEditor } from './createDiffMarkdownEditor'
export type { CreateDiffMarkdownEditorOptions, CreateDiffMarkdownEditorResult } from './createDiffMarkdownEditor'
export { DiffMarkdownEditorController } from './DiffMarkdownEditorController'
export {
  defaultDocumentFormat,
  defaultDocumentMargins,
  defaultRenderOptions,
  documentFormatToCssVars,
  mergePartialDocumentFormat,
  mergeRenderOptions,
  renderOptionsToCssVars,
  type DiffMarkdownRenderOptions,
  type DocumentFormatOptions,
  type DocumentMargins,
  type DocumentPageSize,
  type PartialDocumentFormatOptions,
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

import type { InjectionKey } from 'vue'
import type { DiffMarkdownEditorController } from './DiffMarkdownEditorController'
import type { DiffMarkdownRenderOptions } from './renderOptions'

export const diffMarkdownControllerKey: InjectionKey<DiffMarkdownEditorController> =
  Symbol('diffMarkdownController')

export const diffMarkdownRenderOptionsKey: InjectionKey<DiffMarkdownRenderOptions> =
  Symbol('diffMarkdownRenderOptions')

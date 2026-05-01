import './editor-bundle.css'

import { computed, defineComponent, h, provide } from 'vue'
import { MilkdownProvider } from '@milkdown/vue'
import MilkdownEditor from '../components/MilkdownEditor.vue'
import { DiffMarkdownEditorController } from './DiffMarkdownEditorController'
import { diffMarkdownControllerKey, diffMarkdownRenderOptionsKey } from './injectionKeys'
import {
  mergeRenderOptions,
  renderOptionsToCssVars,
  type DiffMarkdownRenderOptions,
  type PartialRenderOptions,
} from './renderOptions'

export interface CreateDiffMarkdownEditorOptions {
  initialMarkdown?: string
  renderOptions?: PartialRenderOptions
}

export interface CreateDiffMarkdownEditorResult {
  controller: DiffMarkdownEditorController
  renderOptions: Readonly<DiffMarkdownRenderOptions>
  Editor: ReturnType<typeof defineComponent>
}

export function createDiffMarkdownEditor(
  options: CreateDiffMarkdownEditorOptions = {},
): CreateDiffMarkdownEditorResult {
  const merged = mergeRenderOptions(options.renderOptions)
  const controller = new DiffMarkdownEditorController(options.initialMarkdown ?? '')

  const Editor = defineComponent({
    name: 'DiffMarkdownEditorRoot',
    setup() {
      provide(diffMarkdownControllerKey, controller)
      provide(diffMarkdownRenderOptionsKey, merged)
      const frameStyle = computed(() => renderOptionsToCssVars(merged))
      return () =>
        h('div', { class: 'dm-editor-frame', style: frameStyle.value }, [
          h(MilkdownProvider, null, {
            default: () =>
              h('div', { class: 'dm-editor-document' }, [
                h(MilkdownEditor, {
                  onUpdate: (content: string) => {
                    controller.state.currentDraft = content
                  },
                }),
              ]),
          }),
        ])
    },
  })

  return {
    controller,
    renderOptions: merged,
    Editor,
  }
}

<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { Editor, rootCtx, editorViewCtx, defaultValueCtx } from '@milkdown/core'
import { replaceAll } from '@milkdown/utils'
import { commonmark } from '@milkdown/preset-commonmark'
import { nord } from '@milkdown/theme-nord'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey } from 'prosemirror-state'
import { $prose } from '@milkdown/utils'
import type { EditorState } from '../lib/editor'
import { watch, ref } from 'vue'

const props = defineProps<{
  editorState: EditorState
}>()

const emit = defineEmits<{
  (e: 'update', content: string): void
}>()

const diffPluginKey = new PluginKey('diff-plugin')

const diffPlugin = $prose(() => {
  return new Plugin({
    key: diffPluginKey,
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr, old) {
        const action = tr.getMeta(diffPluginKey)
        if (action && action.type === 'update') {
          return action.decorations
        }
        return old.map(tr.mapping, tr.doc)
      },
    },
    props: {
      decorations(state) {
        return diffPluginKey.getState(state)
      },
    },
  })
})

const lastEmitted = ref(props.editorState.currentDraft)

const { get } = useEditor((root) => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, props.editorState.currentDraft)
      ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
        lastEmitted.value = markdown
        emit('update', markdown)
      })
    })
    .config(nord)
    .use(commonmark)
    .use(history)
    .use(listener)
    .use(diffPlugin)
})

watch(() => props.editorState.currentDraft, (newDraft) => {
  if (newDraft === lastEmitted.value) return

  const editor = get()
  if (!editor) return

  editor.action((ctx) => {
    replaceAll(newDraft)(ctx)
    lastEmitted.value = newDraft
  })
}, { deep: false })

watch(() => props.editorState.activeDiffs, (newDiffs) => {
  const editor = get()
  if (!editor) return

  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx)
    const doc = view.state.doc
    const decorations: Decoration[] = []

    newDiffs.forEach((diff) => {
      doc.descendants((node, p) => {
        if (node.isText && node.text) {
          const idx = node.text.indexOf(diff.newText)
          if (idx !== -1) {
            decorations.push(
              Decoration.inline(p + Math.max(0, idx), p + idx + diff.newText.length, {
                class: 'diff-added',
                style: 'background-color: #e6ffed; border-bottom: 2px solid #28a745;',
                'data-diff-id': diff.id
              })
            )
          }
        }
      })
    })

    const decSet = DecorationSet.create(doc, decorations)
    const tr = view.state.tr.setMeta(diffPluginKey, { type: 'update', decorations: decSet })
    view.dispatch(tr)
  })
}, { deep: true })

</script>

<template>
  <div class="milkdown-container">
    <Milkdown />
  </div>
</template>

<style scoped>
.milkdown-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 1rem;
  background-color: #fff;
  min-height: 200px;
  text-align: left;
}
:deep(.diff-added) {
  background-color: #e6ffed;
  border-bottom: 2px solid #28a745;
}
</style>

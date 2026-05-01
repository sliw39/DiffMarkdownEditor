<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { Editor, rootCtx, editorViewCtx, defaultValueCtx } from '@milkdown/core'
import { replaceAll } from '@milkdown/utils'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { nord } from '@milkdown/theme-nord'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { Decoration, DecorationSet } from 'prosemirror-view'
import type { Node as PMNode } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import { $prose } from '@milkdown/utils'
import type { Diff, EditorState } from '../lib/editor'
import { createDiffDecorations } from '../lib/diffChangeWidget'
import { buildPlainTextIndex, nthSubstringRangeInPlain } from '../lib/prosePlainText'

function firstSignificantWordInTail(markdownTail: string): string | null {
  const m = markdownTail.match(/[A-Za-zÀ-ÿ]{4,}/)
  return m ? m[0] : null
}
import { diffMarkdownControllerKey } from '../lib/injectionKeys'
import { inject, nextTick, ref, watch } from 'vue'

const props = defineProps<{
  /** When not using createDiffMarkdownEditor, pass reactive editor state here. */
  editorState?: EditorState
}>()

const emit = defineEmits<{
  (e: 'update', content: string): void
}>()

const controller = inject(diffMarkdownControllerKey, null)
if (!controller && props.editorState === undefined) {
  throw new Error(
    'MilkdownEditor requires editorState prop or a parent from createDiffMarkdownEditor().',
  )
}
const editorState = controller ? controller.state : props.editorState!

const diffPluginKey = new PluginKey('diff-plugin')

function decorationRangeForDiff(doc: PMNode, diff: Diff, markdown: string): { from: number; to: number } | null {
  const { plain, startPos } = buildPlainTextIndex(doc)

  if (diff.newText.length === 0) {
    const off = diff.insertMarkdownOffset
    if (off === undefined) return null
    const word = firstSignificantWordInTail(markdown.slice(off))
    if (!word) return null
    const occ = diff.occurrenceIndex ?? 0
    const r = nthSubstringRangeInPlain(plain, startPos, word, occ)
    if (!r) return null
    return { from: r.from, to: r.from }
  }

  const occ = diff.occurrenceIndex ?? 0
  return nthSubstringRangeInPlain(plain, startPos, diff.newText, occ)
}

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

const lastEmitted = ref(editorState.currentDraft)

const { get } = useEditor((root) => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, editorState.currentDraft)
      ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
        lastEmitted.value = markdown
        emit('update', markdown)
      })
    })
    .config(nord)
    .use(commonmark)
    .use(gfm)
    .use(history)
    .use(listener)
    .use(diffPlugin)
})

watch(
  () => editorState.currentDraft,
  (newDraft) => {
    if (newDraft === lastEmitted.value) return

    const editor = get()
    if (!editor) return

    editor.action((ctx) => {
      replaceAll(newDraft)(ctx)
      lastEmitted.value = newDraft
    })
  },
  { deep: false },
)

watch(
  () => editorState.activeDiffs,
  (newDiffs) => {
    void nextTick(() => {
      const editor = get()
      if (!editor) return

      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const doc = view.state.doc
        const decorations: Decoration[] = []

        newDiffs.forEach((diff) => {
          const range = decorationRangeForDiff(doc, diff, editorState.currentDraft)
          if (range) {
            decorations.push(...createDiffDecorations(range.from, range.to, diff, controller))
          }
        })

        const decSet = DecorationSet.create(doc, decorations)
        const tr = view.state.tr.setMeta(diffPluginKey, { type: 'update', decorations: decSet })
        view.dispatch(tr)
      })
    })
  },
  { deep: true },
)
</script>

<template>
  <div class="dm-milkdown-host">
    <Milkdown />
  </div>
</template>

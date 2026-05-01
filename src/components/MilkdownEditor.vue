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
import {
  buildPlainTextIndex,
  nthOccurrenceInSingleTextNode,
  nthSubstringRangeInPlain,
} from '../lib/prosePlainText'
import { diffMarkdownControllerKey, diffMarkdownRenderOptionsKey } from '../lib/injectionKeys'
import {
  defaultDocumentFormat,
  documentFormatToCssVars,
  mergePartialDocumentFormat,
  type PartialDocumentFormatOptions,
} from '../lib/renderOptions'
import { computed, inject, nextTick, ref, watch } from 'vue'

/** Words that are poor anchors for deletion widgets (common in code fences). */
const MARKDOWN_TAIL_SKIP_WORDS = new Set([
  'async',
  'await',
  'console',
  'const',
  'export',
  'function',
  'import',
  'return',
  'static',
  'typeof',
  'var',
  'let',
])

/**
 * First “significant” word in markdown tail after an insertion point, skipping
 * keywords that appear in almost every JS snippet so we do not always anchor on `console`.
 */
function firstAnchorWordInTail(markdownTail: string): string | null {
  const re = /[A-Za-zÀ-ÿ]{4,}/g
  const matches: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(markdownTail)) !== null) {
    matches.push(m[0])
  }
  for (const w of matches) {
    if (!MARKDOWN_TAIL_SKIP_WORDS.has(w.toLowerCase())) {
      return w
    }
  }
  return matches[0] ?? null
}

const props = defineProps<{
  /** When not using createDiffMarkdownEditor, pass reactive editor state here. */
  editorState?: EditorState
  /**
   * Page size (A4, A5, or `{ width, height }` CSS lengths) and content margins.
   * Merged over `renderOptions.documentFormat` from createDiffMarkdownEditor when present.
   */
  format?: PartialDocumentFormatOptions
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

const injectedRenderOptions = inject(diffMarkdownRenderOptionsKey, null)
const mergedDocumentFormat = computed(() =>
  mergePartialDocumentFormat(
    injectedRenderOptions?.documentFormat ?? defaultDocumentFormat(),
    props.format,
  ),
)
const documentPageStyle = computed(() => documentFormatToCssVars(mergedDocumentFormat.value))

const diffPluginKey = new PluginKey('diff-plugin')

function decorationRangeForDiff(doc: PMNode, diff: Diff, markdown: string): { from: number; to: number } | null {
  const occ = diff.occurrenceIndex ?? 0

  if (diff.newText.length === 0) {
    const off = diff.insertMarkdownOffset
    if (off === undefined) return null
    const word = firstAnchorWordInTail(markdown.slice(off))
    if (!word) return null
    const r = nthOccurrenceInSingleTextNode(doc, word, occ)
    if (!r) return null
    return { from: r.from, to: r.from }
  }

  const { plain, startPos } = buildPlainTextIndex(doc)
  const crossNode = nthSubstringRangeInPlain(plain, startPos, diff.newText, occ)
  if (crossNode) {
    return crossNode
  }

  return nthOccurrenceInSingleTextNode(doc, diff.newText, occ)
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
  <div class="dm-editor-document" :style="documentPageStyle">
    <div class="dm-milkdown-host">
      <Milkdown />
    </div>
  </div>
</template>

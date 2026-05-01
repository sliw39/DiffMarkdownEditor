import { Decoration } from 'prosemirror-view'
import type { Diff } from './editor'
import type { DiffMarkdownEditorController } from './DiffMarkdownEditorController'

function buildDiffChangeDom(
  diff: Diff,
  controller: DiffMarkdownEditorController | null,
): HTMLElement {
  const wrap = document.createElement('span')
  wrap.className = 'diff-change-wrap'
  wrap.setAttribute('data-diff-id', diff.id)

  const inline = document.createElement('span')
  inline.className = 'diff-change-inline'

  const removed = document.createElement('span')
  removed.className = 'diff-removed'
  removed.appendChild(document.createTextNode(diff.originalText))

  const added = document.createElement('span')
  added.className = 'diff-added'
  added.appendChild(document.createTextNode(diff.newText))

  inline.appendChild(removed)
  inline.appendChild(added)
  wrap.appendChild(inline)

  const tooltip = document.createElement('span')
  tooltip.className = 'diff-tooltip'
  tooltip.setAttribute('role', 'tooltip')

  const beforeRow = document.createElement('div')
  beforeRow.className = 'diff-tooltip-row'
  const beforeLabel = document.createElement('span')
  beforeLabel.className = 'diff-tooltip-label'
  beforeLabel.textContent = 'Before: '
  const beforeVal = document.createElement('span')
  beforeVal.className = 'diff-tooltip-value'
  beforeVal.textContent = diff.originalText
  beforeRow.appendChild(beforeLabel)
  beforeRow.appendChild(beforeVal)

  const afterRow = document.createElement('div')
  afterRow.className = 'diff-tooltip-row'
  const afterLabel = document.createElement('span')
  afterLabel.className = 'diff-tooltip-label'
  afterLabel.textContent = 'After: '
  const afterVal = document.createElement('span')
  afterVal.className = 'diff-tooltip-value'
  afterVal.textContent = diff.newText
  afterRow.appendChild(afterLabel)
  afterRow.appendChild(afterVal)

  tooltip.appendChild(beforeRow)
  tooltip.appendChild(afterRow)

  if (controller) {
    const actions = document.createElement('div')
    actions.className = 'diff-tooltip-actions'

    const accept = document.createElement('button')
    accept.type = 'button'
    accept.className = 'diff-tooltip-accept'
    accept.textContent = 'Accept'
    accept.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      controller.acceptDiff(diff)
    })
    accept.addEventListener('mousedown', (e) => e.stopPropagation())

    const discard = document.createElement('button')
    discard.type = 'button'
    discard.className = 'diff-tooltip-discard'
    discard.textContent = 'Discard'
    discard.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      controller.discardDiff(diff)
    })
    discard.addEventListener('mousedown', (e) => e.stopPropagation())

    actions.appendChild(accept)
    actions.appendChild(discard)
    tooltip.appendChild(actions)
  }

  wrap.appendChild(tooltip)
  return wrap
}

/**
 * Renders bicolor before/after via a widget placed before the range, and hides the
 * document's newText span so it is not shown twice (Decoration.replace is not in
 * prosemirror-view 1.41.x).
 */
export function createDiffDecorations(
  from: number,
  to: number,
  diff: Diff,
  controller: DiffMarkdownEditorController | null,
): Decoration[] {
  const widget = Decoration.widget(
    from,
    () => buildDiffChangeDom(diff, controller),
    { side: -1, key: `diff-widget-${diff.id}` },
  )
  if (to > from) {
    return [
      widget,
      Decoration.inline(
        from,
        to,
        { class: 'diff-suppressed-range' },
        { inclusiveStart: true, inclusiveEnd: true },
      ),
    ]
  }
  return [widget]
}

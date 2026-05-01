import type { Node as PMNode } from 'prosemirror-model'

/**
 * Concatenates visible text in document order and records the ProseMirror position
 * of each character's start (same indices as string index into `plain`).
 */
export function buildPlainTextIndex(doc: PMNode): { plain: string; startPos: number[] } {
  let plain = ''
  const startPos: number[] = []
  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      for (let i = 0; i < node.text.length; i++) {
        startPos.push(pos + i)
        plain += node.text[i]
      }
    }
  })
  return { plain, startPos }
}

/**
 * Nth occurrence of `needle` in `plain` (non-overlapping: next search starts at idx + 1).
 */
export function nthSubstringRangeInPlain(
  plain: string,
  startPos: number[],
  needle: string,
  occurrenceIndex: number,
): { from: number; to: number } | null {
  if (needle.length === 0 || startPos.length !== plain.length) {
    return null
  }

  let fromStr = 0
  let occ = 0
  while (fromStr <= plain.length - needle.length) {
    const idx = plain.indexOf(needle, fromStr)
    if (idx === -1) {
      return null
    }
    if (occ === occurrenceIndex) {
      const last = idx + needle.length - 1
      return {
        from: startPos[idx],
        to: startPos[last] + 1,
      }
    }
    occ++
    fromStr = idx + 1
  }
  return null
}

/**
 * Nth occurrence of `needle` entirely inside a single ProseMirror text node.
 * Avoids false matches where a flat concatenation of text nodes spells `needle`
 * but the document has a split in the middle (e.g. table cell vs code block).
 */
export function nthOccurrenceInSingleTextNode(
  doc: PMNode,
  needle: string,
  occurrenceIndex: number,
): { from: number; to: number } | null {
  if (needle.length === 0) {
    return null
  }

  let occ = 0
  let found: { from: number; to: number } | null = null
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    let searchFrom = 0
    while (searchFrom <= node.text.length - needle.length) {
      const idx = node.text.indexOf(needle, searchFrom)
      if (idx === -1) break
      if (occ === occurrenceIndex) {
        found = { from: pos + idx, to: pos + idx + needle.length }
        return false
      }
      occ++
      searchFrom = idx + 1
    }
  })
  return found
}

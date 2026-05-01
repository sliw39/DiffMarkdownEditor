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

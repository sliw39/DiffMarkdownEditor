# Hover tooltips for draft management + bicolor diffs

**Synced with `origin/main`:** 2026-05-01 — `git fetch` / `git pull --rebase` reported already up to date at `b395a9c` (merge PR #10, dual vite lib render options). Diff UI code paths are unchanged on main.

## Current behavior (as of main)

- [`src/components/MilkdownEditor.vue`](src/components/MilkdownEditor.vue): ProseMirror plugin applies **inline** decorations only on `diff.newText` with green styling (class `diff-added` + inline `style`).
- [`src/App.vue`](src/App.vue): Accept/Discard and preview live in the demo sidebar (`.diff-actions` / `.diff-preview`), not in the editor.
- [`src/lib/editor-bundle.css`](src/lib/editor-bundle.css): `.diff-added` only; no “removed” styling.
- [`vite.lib.config.ts`](vite.lib.config.ts): Library build entry is `src/lib/entry.ts`; CSS bundles as `diff-markdown-editor.css` (same stylesheet must carry new diff/tooltip rules).

## Target behavior

1. **Bicolored diff in the document** — For each active `Diff`, show **before** in red and **after** in green at the change site. `currentDraft` only contains the new text, so use a **replace-range** decoration: `Decoration.replace` over the span of `newText`, with a **widget** `toDOM` that outputs inline structure, e.g. `<span class="diff-removed">…</span><span class="diff-added">…</span>`, using `document.createTextNode` for `originalText` / `newText` (avoid HTML injection).

2. **Draft management in hover UI** — Wrap the bicolor content in a container (e.g. `.diff-change-wrap`) with a **popover above** on hover (CSS: positioned panel with Accept / Discard). Wire buttons to injected [`DiffMarkdownEditorController`](src/lib/DiffMarkdownEditorController.ts) (`acceptDiff` / `discardDiff`). Use `stopPropagation` on button clicks as needed so interaction stays predictable.

3. **Styling** — Add `.diff-removed`, tooltip/popover rules, and keep `.diff-added` in [`src/lib/editor-bundle.css`](src/lib/editor-bundle.css); prefer CSS over inline styles in the plugin.

4. **Demo app** — Remove the “Active Diffs” list from [`src/App.vue`](src/App.vue); keep the fake assistant form to simulate edits.

5. **E2E** — Update [`e2e/diff.spec.ts`](e2e/diff.spec.ts): interact with Accept/Discard in the editor hover UI; remove reliance on sidebar `.diff-preview`.

## Risks / verification

- Markdown serialization: replace widgets must not corrupt `currentDraft` / listener output.
- **Edge cases:** First `indexOf(diff.newText)` per text node (same as today); multi-node matches optional follow-up.

## Implementation todos

- [ ] `MilkdownEditor.vue`: replace decoration + widget + hover popover + Accept/Discard
- [ ] `editor-bundle.css`: `.diff-removed`, popover, hover affordance
- [ ] `App.vue`: remove sidebar diff list
- [ ] `e2e/diff.spec.ts`: selectors for in-editor tooltip
- [ ] `npm test`, `npm run build`, Playwright if Chromium available

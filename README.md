# DiffMarkdownEditor

[![CI](https://github.com/sliw39/DiffMarkdownEditor/actions/workflows/ci.yml/badge.svg)](https://github.com/sliw39/DiffMarkdownEditor/actions/workflows/ci.yml)

A WYSIWYG Markdown editor built with Vue 3 and [Milkdown](https://milkdown.dev/), featuring an AI-assisted diff workflow. External agents (e.g. an LLM) can propose text changes that are highlighted inline; the user then accepts or discards each suggestion individually.

---

## Features

- **Rich Markdown editing** — powered by Milkdown (CommonMark + GFM), with the Nord theme.
- **Fuzzy diff matching** — incoming changes are located in the document even when the text has drifted, using [diff-match-patch](https://github.com/google/diff-match-patch).
- **Inline diff highlighting** — accepted/pending changes are decorated directly in the editor using ProseMirror decorations.
- **Accept / Discard workflow** — each proposed change can be individually accepted (applied to both drafts) or discarded (reverted from the current draft).
- **Full-document diff** — the `externalUpdateAll` API diffs an entire new version of the document and breaks it into individual reviewable chunks.
- **Embeddable library** — ship a single JS bundle plus CSS from `npm run build:lib`, with typed Vue integration via `createDiffMarkdownEditor`.

---

## Tech stack

| Layer | Technology |
|---|---|
| UI framework | [Vue 3](https://vuejs.org/) + TypeScript |
| Editor | [Milkdown](https://milkdown.dev/) (ProseMirror-based) |
| Diff engine | [diff-match-patch](https://github.com/google/diff-match-patch) |
| Build tool | [Vite](https://vitejs.dev/) |
| Unit tests | [Vitest](https://vitest.dev/) |
| E2E tests | [Playwright](https://playwright.dev/) |

---

## Getting started

### Prerequisites

- Node.js ≥ 18 (CI uses Node 20)
- npm ≥ 9

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm run dev
```

The app is served at <http://localhost:5173>.

### Build for production (demo app)

```bash
npm run build
```

Output is placed in `dist/`.

### Build the library bundle

For consumers that install this package (or link it locally), build the ESM entry and stylesheet:

```bash
npm run build:lib
```

This produces `dist/diff-markdown-editor.js` and `dist/diff-markdown-editor.css` (see `package.json` `"exports"`).

### Preview the production build

```bash
npm run preview
```

---

## Using as a library

### Peer dependencies

The library expects your app to provide compatible versions of Vue and Milkdown packages (see `package.json` `peerDependencies`). Install the same Milkdown stack you use elsewhere so there is a single ProseMirror document model.

### Import the bundle and CSS

In a Vite or similar ESM setup:

```ts
import 'diff-markdown-editor/diff-markdown-editor.css'
import {
  createDiffMarkdownEditor,
  type DiffMarkdownEditorController,
} from 'diff-markdown-editor'
```

If you consume the repo from source during development, point your bundler at `src/lib/entry.ts` or run `npm run build:lib` and import from `dist/`.

### Minimal Vue integration

`createDiffMarkdownEditor` returns a **controller** (reactive diff state + methods), resolved **render options**, and a **root Vue component** that wires Milkdown to the controller.

```vue
<script setup lang="ts">
import { createDiffMarkdownEditor } from 'diff-markdown-editor'
import 'diff-markdown-editor/diff-markdown-editor.css'

const { controller, Editor: DiffEditor } = createDiffMarkdownEditor({
  initialMarkdown: '# Hello\n\nEdit me.',
})

function proposeChange() {
  controller.externalUpdateFragment({
    originalText: 'Edit me.',
    newText: 'Review this suggestion.',
  })
}
</script>

<template>
  <div>
    <DiffEditor />
    <button type="button" @click="proposeChange">Simulate external edit</button>
  </div>
</template>
```

The editor keeps `controller.state.currentDraft` in sync with the Markdown string as the user types (`onUpdate` inside the factory).

### Controller API

`DiffMarkdownEditorController` wraps the pure functions in `src/lib/editor.ts` and exposes a reactive `state`:

| Member | Description |
|---|---|
| `state.prevDraft` | Last “accepted” Markdown baseline. |
| `state.currentDraft` | Live document Markdown (includes pending suggestions). |
| `state.activeDiffs` | Pending `Diff` objects driving inline decorations and accept/discard UI. |
| `externalUpdateFragment(fragment)` | Apply a single `{ originalText, newText }` patch; uses exact substring replace when possible, otherwise fuzzy patch application. |
| `externalUpdateAll(text)` | Replace the document with a full new Markdown string and split changes into multiple `Diff` entries. |
| `acceptDiff(diff)` | Treat a suggestion as confirmed: updates `prevDraft` and removes the diff. |
| `discardDiff(diff)` | Revert that chunk in `currentDraft` and remove the diff. |
| `fuzzyMatch(text, fragment, threshold?)` | Optional helper to preview whether `originalText` can be found in `text` (default confidence 0.9). |

### Styling and page layout

Override chrome colors, fonts, and printable page size (A4/A5 or custom CSS lengths) by passing `renderOptions` into `createDiffMarkdownEditor`:

```ts
const { controller, Editor, renderOptions } = createDiffMarkdownEditor({
  initialMarkdown: '# Note',
  renderOptions: {
    frameBgColor: '#1e1e1e',
    documentBgColor: '#ffffff',
    documentFormat: {
      pageSize: 'A5',
      margins: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    },
    documentTextFont: {
      fontFamily: 'Georgia, serif',
      baseSize: '15px',
      color: '#111111',
    },
  },
})
```

You can also import helpers from the package entry for custom shells: `mergeRenderOptions`, `defaultRenderOptions`, `renderOptionsToCssVars`, `documentFormatToCssVars`, and related types.

### Low-level state API (no Vue)

For unit tests or a non-Vue UI, import the pure functions and types from the same entry:

```ts
import {
  createEditorState,
  externalUpdateFragment,
  acceptDiff,
  type EditorState,
  type Diff,
} from 'diff-markdown-editor'

const state: EditorState = createEditorState('# Title\n\nBody.')
externalUpdateFragment(state, { originalText: 'Body.', newText: 'Updated.' })
// mutate state.activeDiffs / prevDraft / currentDraft with acceptDiff, discardDiff, etc.
```

---

## Running tests

### Unit tests (Vitest)

```bash
npm test
```

Run in watch mode during development:

```bash
npm run test:watch
```

Generate a coverage report:

```bash
npm run coverage
```

### End-to-end tests (Playwright)

```bash
npx playwright install --with-deps chromium
npx playwright test
```

---

## Project structure

```
src/
├── components/
│   └── MilkdownEditor.vue       # Milkdown instance + diff decorations + accept/discard UI
├── lib/
│   ├── entry.ts                 # Public package exports
│   ├── createDiffMarkdownEditor.ts
│   ├── DiffMarkdownEditorController.ts
│   ├── editor.ts                # Core diff/state logic (framework-agnostic)
│   ├── renderOptions.ts         # Theme + document page CSS variables
│   ├── prosePlainText.ts        # Plain-text helpers for matching
│   └── editor-bundle.css        # Layout + Milkdown/diff styles for the library
├── App.vue                      # Demo app with fake “assistant” panel
└── main.ts

e2e/
└── diff.spec.ts                 # Playwright end-to-end tests
```

### Core logic (`src/lib/editor.ts`)

| Function | Description |
|---|---|
| `createEditorState(initial)` | Creates a fresh editor state |
| `fuzzyMatch(text, diff, threshold?)` | Locates `originalText` inside `text` using fuzzy matching |
| `externalUpdateFragment(state, diff)` | Applies a single fragment change proposed by an external agent |
| `externalUpdateAll(state, newText)` | Diffs an entirely new document and adds all changed chunks |
| `acceptDiff(state, diff)` | Confirms a diff — updates `prevDraft` to match the accepted content |
| `discardDiff(state, diff)` | Reverts a diff — rolls `currentDraft` back for that chunk |
| `fullDiff(textA, textB)` | Raw diff-match-patch semantic diff (for debugging or tooling) |

---

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes and add tests.
3. Run `npm test` and `npm run build` to verify everything passes.
4. Open a pull request — the CI pipeline will run automatically.

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

- Node.js ≥ 18
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

### Build for production

```bash
npm run build
```

Output is placed in `dist/`.

### Preview the production build

```bash
npm run preview
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
│   └── MilkdownEditor.vue   # Editor component with diff decoration
├── lib/
│   └── editor.ts            # Core diff/state logic (framework-agnostic)
├── App.vue                  # Root component with demo assistant panel
└── main.ts

e2e/
└── diff.spec.ts             # Playwright end-to-end tests
```

### Core API (`src/lib/editor.ts`)

| Function | Description |
|---|---|
| `createEditorState(initial)` | Creates a fresh editor state |
| `fuzzyMatch(text, diff, threshold?)` | Locates `originalText` inside `text` using fuzzy matching |
| `externalUpdateFragment(state, diff)` | Applies a single fragment change proposed by an external agent |
| `externalUpdateAll(state, newText)` | Diffs an entirely new document and adds all changed chunks |
| `acceptDiff(state, diff)` | Confirms a diff — updates `prevDraft` to match `currentDraft` |
| `discardDiff(state, diff)` | Reverts a diff — rolls `currentDraft` back to `prevDraft` for that chunk |

---

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes and add tests.
3. Run `npm test` and `npm run build` to verify everything passes.
4. Open a pull request — the CI pipeline will run automatically.


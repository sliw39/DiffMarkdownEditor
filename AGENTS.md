# AGENTS.md

## Cursor Cloud specific instructions

This is a Vue 3 + TypeScript frontend SPA (no backend). All commands are in `package.json` scripts. See `README.md` for full details.

### Quick reference

| Task | Command |
|---|---|
| Dev server | `npm run dev` (serves at `http://localhost:5173`) |
| Unit tests | `npm test` (Vitest, 12 tests across 2 files) |
| Build | `npm run build` (vue-tsc type-check + Vite build) |
| E2E tests | `npx playwright test` (requires Chromium; Playwright auto-starts dev server) |

### Non-obvious notes

- **Node.js version**: CI uses Node 20. nvm is installed; run `nvm use 20` if not already active.
- **Playwright browsers**: Must be installed separately with `npx playwright install --with-deps chromium` before running E2E tests. The Playwright config auto-starts `npm run dev` for E2E, so you don't need a separate dev server for E2E tests.
- **No external services**: No databases, caches, APIs, or environment variables are required. The app is entirely self-contained.
- **Package manager**: Use `npm` (lockfile is `package-lock.json`). Do not use pnpm or yarn.
- **Test environment**: Unit tests run in jsdom. E2E tests target Chromium only.

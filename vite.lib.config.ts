import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

const external = [
  'vue',
  /^@vue\/.*/,
  /^@milkdown\/.*/,
  /^prosemirror-.*/,
  /^@codemirror\/.*/,
  /^@lezer\/.*/,
  /^@marijn\/.*/,
  'nanoid',
  'tslib',
  '@emotion/css',
  /^@emotion\/.*/,
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/entry.ts'),
      name: 'DiffMarkdownEditor',
      formats: ['es'],
      fileName: () => 'diff-markdown-editor.js',
    },
    cssCodeSplit: false,
    rollupOptions: {
      external,
      output: {
        assetFileNames: 'diff-markdown-editor.css',
      },
    },
  },
})

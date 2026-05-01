<script setup lang="ts">
import { ref } from 'vue'
import { createDiffMarkdownEditor } from './lib/createDiffMarkdownEditor'

const initialDraft = `# Welcome to the A4 Markdown Editor!

This is a test document with **rich** formatting. Let's try some _italics_ and ~~strikethrough~~.

## Lists

### Unordered List
* Item 1
* Item 2
  * Nested item A
  * Nested item B
* Item 3

### Ordered List
1. First step
2. Second step
3. Third step

## Blockquote

> This is a blockquote. It's useful for calling out specific text.
> Multiple lines are supported.

## Code

Inline code looks like \`this\`.

Here is a block of code:

\`\`\`javascript
function greet(name) {
  console.log("Hello, " + name + "!");
}
greet("World");
\`\`\`

## Tables

| Header 1 | Header 2 | Header 3 |
| :--- | :---: | ---: |
| Left aligned | Center aligned | Right aligned |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |
`

const { controller, Editor: DiffEditor } = createDiffMarkdownEditor({
  initialMarkdown: initialDraft,
})

const originalText = ref('test the editor')
const newText = ref('demonstrate the diff functionality')

function simulateExternalEdit() {
  controller.externalUpdateFragment({
    originalText: originalText.value,
    newText: newText.value,
  })
}

</script>

<template>
  <div class="app-container">
    <div class="editor-section">
      <DiffEditor />
    </div>

    <div class="assistant-section">
      <h2>Fake Assistant (External Edits)</h2>
      <div class="form-group">
        <label>Original Text</label>
        <input v-model="originalText" type="text" />
      </div>
      <div class="form-group">
        <label>New Text</label>
        <input v-model="newText" type="text" />
      </div>
      <button @click="simulateExternalEdit">Simulate AI Replace</button>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  font-family: sans-serif;
  color: #333;
}
.editor-section {
  display: block;
}
.assistant-section {
  flex: 1;
  max-width: 350px;
  position: sticky;
  top: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}
.form-group input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}
button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>

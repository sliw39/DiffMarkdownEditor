<script setup lang="ts">
import { ref, reactive } from 'vue'
import { MilkdownProvider } from '@milkdown/vue'
import MilkdownEditor from './components/MilkdownEditor.vue'
import { createEditorState, externalUpdateFragment, acceptDiff, discardDiff } from './lib/editor'

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
const editorState = reactive(createEditorState(initialDraft))

const originalText = ref('test the editor')
const newText = ref('demonstrate the diff functionality')

function onEditorUpdate(content: string) {
  editorState.currentDraft = content
}

function simulateExternalEdit() {
  externalUpdateFragment(editorState, {
    originalText: originalText.value,
    newText: newText.value
  })
}

function handleAcceptDiff(diff: any) {
  acceptDiff(editorState, diff)
}

function handleDiscardDiff(diff: any) {
  discardDiff(editorState, diff)
}

</script>

<template>
  <div class="app-container">
    <h1>Markdown Diff Editor Test</h1>

    <div class="editor-section">
      <MilkdownProvider>
        <MilkdownEditor :editorState="editorState" @update="onEditorUpdate" />
      </MilkdownProvider>
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

      <div v-if="editorState.activeDiffs.length > 0" class="diff-actions">
        <h3>Active Diffs</h3>
        <ul>
          <li v-for="diff in editorState.activeDiffs" :key="diff.id">
            <span class="diff-preview">"{{ diff.originalText }}" &rarr; "{{ diff.newText }}"</span>
            <button @click="handleAcceptDiff(diff)">Accept</button>
            <button @click="handleDiscardDiff(diff)">Discard</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: sans-serif;
  color: #333;
  padding: 2rem;
}
.editor-section {
  margin-bottom: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
}
.assistant-section {
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
.diff-actions {
  margin-top: 1rem;
  border-top: 1px solid #ccc;
  padding-top: 1rem;
}
.diff-actions li {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.diff-preview {
  flex: 1;
}
</style>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { MilkdownProvider } from '@milkdown/vue'
import MilkdownEditor from './components/MilkdownEditor.vue'
import { createEditorState, externalUpdateFragment, acceptDiff, discardDiff } from './lib/editor'

const initialDraft = 'This is a sample Markdown text.\n\nIt is used to test the editor.\n'
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
        <label for="original-text">Original Text</label>
        <input id="original-text" v-model="originalText" type="text" />
      </div>
      <div class="form-group">
        <label for="new-text">New Text</label>
        <input id="new-text" v-model="newText" type="text" />
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
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
  color: #333;
}
.editor-section {
  margin-bottom: 2rem;
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

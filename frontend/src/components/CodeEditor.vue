<template>
  <div ref="editorContainer" class="h-full w-full"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { syntaxHighlighting, indentOnInput, bracketMatching, defaultHighlightStyle } from '@codemirror/language'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'

const props = defineProps({
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
let view = null
let ignoreNextChange = false

onMounted(() => {
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged && !ignoreNextChange) {
      emit('update:modelValue', update.state.doc.toString())
    }
  })

  const extensions = [
    lineNumbers(),
    history(),
    highlightActiveLine(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    highlightSelectionMatches(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    python(),
    oneDark,
    EditorState.tabSize.of(4),
    EditorView.lineWrapping,
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...completionKeymap,
      indentWithTab
    ]),
    updateListener,
    EditorView.theme({
      '&': { height: '100%' },
      '.cm-scroller': { overflow: 'auto', fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace", fontSize: '13px' },
      '.cm-gutters': { minHeight: '100%' }
    })
  ]

  const state = EditorState.create({
    doc: props.modelValue,
    extensions
  })

  view = new EditorView({
    state,
    parent: editorContainer.value
  })
})

watch(() => props.modelValue, (newVal) => {
  if (!view) return
  const currentVal = view.state.doc.toString()
  if (currentVal !== newVal) {
    ignoreNextChange = true
    view.dispatch({
      changes: { from: 0, to: currentVal.length, insert: newVal }
    })
    ignoreNextChange = false
  }
})

onBeforeUnmount(() => {
  if (view) {
    view.destroy()
    view = null
  }
})

function insertCode(code) {
  if (!view) return
  const doc = view.state.doc.toString()
  const pos = view.state.selection.main.head
  if (doc.trim() === '') {
    view.dispatch({
      changes: { from: 0, to: doc.length, insert: code }
    })
  } else {
    view.dispatch({
      changes: { from: pos, insert: '\n' + code }
    })
  }
  view.focus()
}

defineExpose({ insertCode })
</script>

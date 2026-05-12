<template>
  <div ref="editorContainer" class="h-full w-full"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import CodeMirror from 'codemirror'
import 'codemirror/mode/python/python'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'

const props = defineProps({
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
let editor = null
let ignoreNextChange = false

onMounted(() => {
  editor = CodeMirror(editorContainer.value, {
    value: props.modelValue,
    mode: 'python',
    theme: 'monokai',
    lineNumbers: true,
    matchBrackets: true,
    indentUnit: 4,
    tabSize: 4,
    lineWrapping: true,
    styleActiveLine: true
  })

  editor.on('change', () => {
    if (!ignoreNextChange) {
      emit('update:modelValue', editor.getValue())
    }
  })
})

watch(() => props.modelValue, (newVal) => {
  if (editor && editor.getValue() !== newVal) {
    ignoreNextChange = true
    editor.setValue(newVal)
    ignoreNextChange = false
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor.toTextArea()
    editor = null
  }
})

function insertCode(code) {
  if (!editor) return
  const cursor = editor.getCursor()
  if (cursor.ch === 0 && cursor.line === 0 && editor.getValue().trim() === '') {
    editor.setValue(code)
  } else {
    editor.replaceRange('\n' + code, cursor)
  }
  editor.focus()
}

defineExpose({ insertCode })
</script>

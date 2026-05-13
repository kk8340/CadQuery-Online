<template>
  <div class="h-full flex flex-col bg-[#0c1222]">
    <div class="h-7 flex items-center justify-between px-3 bg-slate-800/60 border-b border-slate-700/50 shrink-0">
      <div class="flex items-center gap-2">
        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-[11px] font-medium text-slate-400">终端</span>
      </div>
      <button class="text-slate-500 hover:text-slate-300 transition-colors" @click="clear" title="清空">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
    <div ref="scrollContainer" class="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed min-h-0">
      <div v-if="lines.length === 0" class="text-slate-600 italic">等待代码执行...</div>
      <div v-for="(line, i) in lines" :key="i" class="whitespace-pre-wrap break-all">
        <span v-if="line.type === 'input'" class="text-cyan-400">{{ line.text }}</span>
        <span v-else-if="line.type === 'output'" class="text-slate-300">{{ line.text }}</span>
        <span v-else-if="line.type === 'error'" class="text-red-400">{{ line.text }}</span>
        <span v-else-if="line.type === 'info'" class="text-emerald-400">{{ line.text }}</span>
        <span v-else class="text-slate-400">{{ line.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const lines = ref([])
const scrollContainer = ref(null)

function addLine(text, type = 'output') {
  lines.value.push({ text, type })
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

function addOutput(text) {
  if (text) addLine(text, 'output')
}

function addError(text) {
  if (text) addLine(text, 'error')
}

function addInfo(text) {
  if (text) addLine(text, 'info')
}

function addInput(text) {
  if (text) addLine(text, 'input')
}

function clear() {
  lines.value = []
}

defineExpose({ addLine, addOutput, addError, addInfo, addInput, clear })
</script>

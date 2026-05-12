<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
      <div class="p-6 border-b border-slate-700 flex items-center justify-between">
        <h2 class="text-xl font-bold">导出模型</h2>
        <button class="text-slate-400 hover:text-white" @click="$emit('close')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">格式</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              :class="['card p-4 rounded-xl text-center transition-colors', selectedFormat === 'stl' ? 'border-cyan-500' : '']"
              @click="selectedFormat = 'stl'"
            >
              <div class="text-2xl mb-1">📄</div>
              <div class="font-medium">STL</div>
              <div class="text-xs text-slate-400">3D 打印</div>
            </button>
            <button
              :class="['card p-4 rounded-xl text-center transition-colors', selectedFormat === 'step' ? 'border-cyan-500' : '']"
              @click="selectedFormat = 'step'"
            >
              <div class="text-2xl mb-1">📐</div>
              <div class="font-medium">STEP</div>
              <div class="text-xs text-slate-400">CAD 交换</div>
            </button>
          </div>
        </div>
        <button class="w-full btn-primary py-3 rounded-xl font-medium" @click="confirm">
          导出
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirm'])

const selectedFormat = ref('stl')

watch(() => props.show, (val) => {
  if (val) selectedFormat.value = 'stl'
})

function confirm() {
  if (selectedFormat.value) {
    emit('confirm', selectedFormat.value)
  }
}
</script>

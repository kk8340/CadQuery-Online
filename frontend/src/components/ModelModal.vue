<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
      <div class="p-6 border-b border-slate-700 flex items-center justify-between">
        <h2 class="text-xl font-bold">新建模型</h2>
        <button class="text-slate-400 hover:text-white" @click="$emit('close')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">模型名称</label>
          <input
            v-model="modelName"
            type="text"
            placeholder="输入模型名称..."
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            @keyup.enter="confirm"
          />
        </div>
        <button class="w-full btn-primary py-3 rounded-xl font-medium" @click="confirm">
          创建
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

const modelName = ref('')

watch(() => props.show, (val) => {
  if (val) modelName.value = ''
})

function confirm() {
  const name = modelName.value.trim()
  if (name) {
    emit('confirm', name)
    modelName.value = ''
  }
}
</script>

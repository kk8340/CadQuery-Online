<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
      <div class="p-6 border-b border-slate-700 flex items-center justify-between">
        <h2 class="text-xl font-bold">代码模板</h2>
        <button class="text-slate-400 hover:text-white" @click="$emit('close')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh]">
        <div
          v-for="template in templates"
          :key="template.id"
          class="card p-4 rounded-xl cursor-pointer hover:border-cyan-500 transition-all"
          @click="$emit('select', template)"
        >
          <div class="text-3xl mb-3">{{ template.icon }}</div>
          <h3 class="font-semibold text-sm mb-1">{{ template.name }}</h3>
          <p class="text-xs text-slate-400 mb-3">{{ template.description }}</p>
          <pre class="bg-slate-900 p-2 rounded text-xs text-cyan-300 overflow-x-auto monospace">{{ template.code }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  templates: { type: Array, default: () => [] }
})

defineEmits(['close', 'select'])
</script>

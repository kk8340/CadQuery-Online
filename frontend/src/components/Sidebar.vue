<template>
  <aside :class="['h-full bg-slate-900/50 border-r border-slate-700 flex flex-col transition-all duration-300', visible ? 'w-72' : 'w-0 overflow-hidden']">
    <div class="p-4 border-b border-slate-700">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">我的模型</h2>
        <button class="text-slate-400 hover:text-white transition-colors" @click="$emit('toggle-sidebar')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
        </button>
      </div>
      <button class="w-full btn-primary py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2" @click="$emit('new-model')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        新建模型
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <div
        v-for="model in models"
        :key="model.id"
        :class="['sidebar-item p-3 rounded-lg cursor-pointer border-l-2 border-transparent transition-all', currentModelId === model.id ? 'active' : '']"
        @click="$emit('select-model', model.id)"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium truncate">{{ model.name }}</span>
          <button
            class="text-slate-500 hover:text-red-400 transition-colors p-1"
            @click.stop="confirmDelete(model)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
        <div class="text-xs text-slate-500 mt-1">{{ formatDate(model.updated_at || model.created_at) }}</div>
      </div>
      <div v-if="models.length === 0" class="text-center text-slate-500 text-sm py-8">
        暂无模型
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  models: { type: Array, default: () => [] },
  currentModelId: { type: String, default: null },
  modelName: { type: String, default: '' },
  visible: { type: Boolean, default: true }
})

const emit = defineEmits(['select-model', 'delete-model', 'new-model', 'toggle-sidebar'])

function confirmDelete(model) {
  if (confirm(`确定要删除模型"${model.name}"吗？`)) {
    emit('delete-model', model.id)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN')
}
</script>

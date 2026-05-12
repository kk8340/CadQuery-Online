<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
      <div class="p-6 border-b border-slate-700 flex items-center justify-between">
        <h2 class="text-xl font-bold">CadQuery 示例库</h2>
        <button class="text-slate-400 hover:text-white" @click="$emit('close')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="flex h-[calc(90vh-120px)]">
        <div class="w-48 bg-slate-900/50 p-4 border-r border-slate-700">
          <div class="space-y-2">
            <div
              v-for="cat in categories"
              :key="cat"
              :class="['category-item p-2 rounded-lg cursor-pointer text-sm', activeCategory === cat ? 'active' : '']"
              @click="activeCategory = cat"
            >
              {{ cat }}
            </div>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="example in filteredExamples"
              :key="example.name"
              :class="['example-card p-4 rounded-xl cursor-pointer border transition-all', selectedExample?.name === example.name ? 'border-cyan-500' : '']"
              @click="selectedExample = example"
            >
              <h3 class="font-semibold text-sm mb-1">{{ example.name }}</h3>
              <p class="text-xs text-slate-400 mb-2">{{ example.description }}</p>
              <span class="text-xs px-2 py-1 bg-slate-700 rounded-full">{{ example.category }}</span>
            </div>
          </div>
        </div>
        <div v-if="selectedExample" class="w-96 bg-slate-900/50 p-4 border-l border-slate-700">
          <div class="mb-4">
            <h3 class="font-semibold text-lg mb-2">{{ selectedExample.name }}</h3>
            <span class="text-xs px-2 py-1 bg-slate-700 rounded-full">{{ selectedExample.category }}</span>
          </div>
          <div class="mb-4">
            <div class="text-xs font-medium text-slate-400 mb-2">代码预览</div>
            <pre class="bg-slate-800 p-4 rounded-lg text-xs overflow-auto max-h-[400px] text-slate-300 monospace">{{ selectedExample.code }}</pre>
          </div>
          <button class="w-full btn-primary py-3 rounded-xl font-medium" @click="$emit('select', selectedExample)">
            使用此示例
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApi } from '../composables/useApi'
import { useCache } from '../composables/useCache'

const props = defineProps({
  show: { type: Boolean, default: false }
})

defineEmits(['close', 'select'])

const { getExamples } = useApi()
const { getCachedData, setCachedData, CACHE_KEYS } = useCache()

const examples = ref([])
const activeCategory = ref('')
const selectedExample = ref(null)

const categories = computed(() => {
  const cats = [...new Set(examples.value.map(e => e.category))]
  if (cats.length > 0 && !activeCategory.value) activeCategory.value = cats[0]
  return cats
})

const filteredExamples = computed(() => {
  if (!activeCategory.value) return examples.value
  return examples.value.filter(e => e.category === activeCategory.value)
})

watch(() => props.show, async (val) => {
  if (val) {
    selectedExample.value = null
    const cached = getCachedData(CACHE_KEYS.EXAMPLES)
    if (cached) {
      examples.value = cached
      return
    }
    try {
      const data = await getExamples()
      examples.value = data
      setCachedData(CACHE_KEYS.EXAMPLES, data)
    } catch (e) {
      console.error('加载示例失败:', e)
    }
  }
})
</script>

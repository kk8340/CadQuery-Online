<template>
  <div class="h-screen overflow-hidden flex flex-col bg-[#0f172a] text-slate-200">
    <header class="h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold">CadQuery Online</h1>
          <p class="text-xs text-slate-400">在线参数化建模平台</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" @click="openDocs">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          API文档
        </button>
        <button class="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" @click="showTemplates = true">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          模板
        </button>
        <button class="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" @click="showExamples = true">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          示例
        </button>
        <button class="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" @click="saveModel">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
          保存
        </button>
        <button class="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" @click="showExport = true">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          导出
        </button>
      </div>
    </header>

    <div class="flex flex-1 min-h-0">
      <Sidebar
        :models="models"
        :current-model-id="currentModelId"
        :model-name="modelName"
        :visible="sidebarVisible"
        @select-model="openModel"
        @delete-model="deleteModel"
        @new-model="showNewModel = true"
        @toggle-sidebar="sidebarVisible = !sidebarVisible"
      />

      <main class="flex-1 flex flex-col min-w-0">
        <div class="h-10 bg-slate-800/50 border-b border-slate-700 flex items-center px-4 gap-3">
          <button v-if="!sidebarVisible" class="text-slate-400 hover:text-white transition-colors" @click="sidebarVisible = true">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
            </svg>
          </button>
          <span class="text-sm font-medium text-slate-300">{{ modelName }}</span>
          <div class="flex-1"></div>
          <div :class="['text-xs flex items-center gap-2', statusType === 'error' ? 'status-error' : statusType === 'success' ? 'status-success' : 'text-slate-400']">
            <span :class="['w-2 h-2 rounded-full', statusType === 'error' ? 'bg-red-500' : statusType === 'success' ? 'bg-emerald-500' : statusType === 'running' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-500']"></span>
            {{ statusText }}
          </div>
          <button class="btn-primary px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2" @click="runCode">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            运行 (Ctrl+Enter)
          </button>
        </div>

        <div class="flex-1 flex min-h-0">
          <div class="flex-1 flex flex-col border-r border-slate-700 min-w-0">
            <div class="h-8 bg-slate-800/30 flex items-center px-4 border-b border-slate-700 justify-between">
              <span class="text-xs font-medium text-slate-400">代码编辑器</span>
              <button class="text-xs text-slate-400 hover:text-white transition-colors" @click="toolsVisible = !toolsVisible">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
              </button>
            </div>
            <div class="flex-1 flex min-h-0">
              <Toolbar
                :visible="toolsVisible"
                @insert-code="insertCode"
              />
              <div class="flex-1 min-w-0">
                <CodeEditor ref="editorRef" v-model="editorCode" />
              </div>
            </div>
          </div>

          <div class="flex-1 flex flex-col min-w-0">
            <div class="h-8 bg-slate-800/30 flex items-center px-4 border-b border-slate-700 justify-between">
              <span class="text-xs font-medium text-slate-400">3D 预览</span>
              <div class="flex items-center gap-2">
                <button class="text-xs text-slate-400 hover:text-white transition-colors" @click="resetView">
                  重置视角
                </button>
              </div>
            </div>
            <div class="flex-1 min-h-0">
              <Viewer3D ref="viewerRef" :mesh-data="meshData" />
            </div>
          </div>
        </div>
      </main>
    </div>

    <ModelModal :show="showNewModel" @close="showNewModel = false" @confirm="createNewModel" />
    <ExportModal :show="showExport" @close="showExport = false" @confirm="exportModel" />
    <TemplatesModal :show="showTemplates" :templates="templates" @close="showTemplates = false" @select="onTemplateSelect" />
    <ExamplesModal :show="showExamples" @close="showExamples = false" @select="onExampleSelect" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useApi } from './composables/useApi'
import { DEFAULT_CODE, TEMPLATES } from './config'
import CodeEditor from './components/CodeEditor.vue'
import Viewer3D from './components/Viewer3D.vue'
import Sidebar from './components/Sidebar.vue'
import Toolbar from './components/Toolbar.vue'
import ModelModal from './components/ModelModal.vue'
import ExportModal from './components/ExportModal.vue'
import TemplatesModal from './components/TemplatesModal.vue'
import ExamplesModal from './components/ExamplesModal.vue'

const { executeCode, exportModel: apiExportModel, getModels, createModel, updateModel, deleteModel: apiDeleteModel, getModelCode } = useApi()

const editorRef = ref(null)
const viewerRef = ref(null)

const currentModelId = ref(null)
const editorCode = ref(DEFAULT_CODE)
const meshData = ref('')
const modelName = ref('未命名模型')
const statusText = ref('就绪')
const statusType = ref('idle')
const sidebarVisible = ref(true)
const toolsVisible = ref(true)

const showNewModel = ref(false)
const showExport = ref(false)
const showTemplates = ref(false)
const showExamples = ref(false)

const models = ref([])
const templates = ref(TEMPLATES)

onMounted(() => {
  loadModels()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    runCode()
  }
}

async function runCode() {
  statusText.value = '执行中...'
  statusType.value = 'running'
  try {
    const result = await executeCode(editorCode.value)
    if (result.stl) {
      meshData.value = result.stl
      statusText.value = '执行成功'
      statusType.value = 'success'
    } else if (result.error) {
      statusText.value = result.error
      statusType.value = 'error'
    } else {
      statusText.value = '执行成功'
      statusType.value = 'success'
    }
  } catch (e) {
    statusText.value = e.message || '执行失败'
    statusType.value = 'error'
  }
}

async function loadModels() {
  try {
    models.value = await getModels()
  } catch (e) {
    console.error('加载模型列表失败:', e)
  }
}

async function openModel(id) {
  try {
    const data = await getModelCode(id)
    currentModelId.value = id
    editorCode.value = data.code || ''
    const model = models.value.find(m => m.id === id)
    modelName.value = model ? model.name : '未命名模型'
  } catch (e) {
    console.error('加载模型失败:', e)
  }
}

async function saveModel() {
  try {
    if (currentModelId.value) {
      await updateModel(currentModelId.value, { name: modelName.value, code: editorCode.value })
      statusText.value = '保存成功'
      statusType.value = 'success'
    } else {
      const result = await createModel(modelName.value, editorCode.value)
      currentModelId.value = result.id
      statusText.value = '保存成功'
      statusType.value = 'success'
    }
    await loadModels()
  } catch (e) {
    statusText.value = e.message || '保存失败'
    statusType.value = 'error'
  }
}

async function createNewModel(name) {
  try {
    const result = await createModel(name, DEFAULT_CODE)
    currentModelId.value = result.id
    modelName.value = name
    editorCode.value = DEFAULT_CODE
    meshData.value = ''
    showNewModel.value = false
    await loadModels()
  } catch (e) {
    console.error('创建模型失败:', e)
  }
}

async function deleteModel(id) {
  try {
    await apiDeleteModel(id)
    if (currentModelId.value === id) {
      currentModelId.value = null
      modelName.value = '未命名模型'
      editorCode.value = DEFAULT_CODE
      meshData.value = ''
    }
    await loadModels()
  } catch (e) {
    console.error('删除模型失败:', e)
  }
}

async function exportModel(format) {
  try {
    const result = await apiExportModel(editorCode.value, format)
    if (result.url) {
      const a = document.createElement('a')
      a.href = result.url
      a.download = `${modelName.value}.${format}`
      a.click()
    } else if (result.data) {
      const binaryStr = atob(result.data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
      const blob = new Blob([bytes], { type: format === 'stl' ? 'application/sla' : 'application/step' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${modelName.value}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    }
    showExport.value = false
    statusText.value = '导出成功'
    statusType.value = 'success'
  } catch (e) {
    statusText.value = e.message || '导出失败'
    statusType.value = 'error'
  }
}

function insertCode(code) {
  if (editorRef.value) {
    editorRef.value.insertCode(code)
  }
}

function resetView() {
  if (viewerRef.value) {
    viewerRef.value.resetView()
  }
}

function onTemplateSelect(template) {
  editorCode.value = template.code
  showTemplates.value = false
}

function onExampleSelect(example) {
  editorCode.value = example.code
  showExamples.value = false
}

function openDocs() {
  window.open('/docs.html', '_blank')
}
</script>

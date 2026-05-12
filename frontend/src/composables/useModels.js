import { ref } from 'vue'
import { useApi } from './useApi'
import { DEFAULT_CODE } from '../config'

const { getModels, createModel, updateModel, deleteModel: apiDeleteModel, getModelCode } = useApi()

const models = ref([])
const currentModelId = ref(null)
const modelName = ref('未命名模型')

async function loadModels() {
  try {
    models.value = await getModels()
  } catch (e) {
    console.error('加载模型列表失败:', e)
  }
}

async function openModel(id, editorCode, meshData) {
  try {
    const data = await getModelCode(id)
    currentModelId.value = id
    editorCode.value = data.code || ''
    const model = models.value.find(m => m.id === id)
    modelName.value = model ? model.name : '未命名模型'
    meshData.value = ''
  } catch (e) {
    console.error('加载模型失败:', e)
  }
}

async function saveModel(editorCode, setStatus) {
  try {
    if (currentModelId.value) {
      await updateModel(currentModelId.value, { name: modelName.value, code: editorCode.value })
    } else {
      const result = await createModel(modelName.value, editorCode.value)
      currentModelId.value = result.id
    }
    await loadModels()
    setStatus('保存成功', 'success')
  } catch (e) {
    setStatus(e.message || '保存失败', 'error')
  }
}

async function createNewModel(name, editorCode, meshData, setStatus) {
  try {
    const result = await createModel(name, DEFAULT_CODE)
    currentModelId.value = result.id
    modelName.value = name
    editorCode.value = DEFAULT_CODE
    meshData.value = ''
    await loadModels()
    return true
  } catch (e) {
    console.error('创建模型失败:', e)
    setStatus(e.message || '创建失败', 'error')
    return false
  }
}

async function deleteModelById(id, editorCode, meshData) {
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

export function useModels() {
  return {
    models, currentModelId, modelName,
    loadModels, openModel, saveModel, createNewModel, deleteModelById
  }
}

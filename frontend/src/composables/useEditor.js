import { ref } from 'vue'
import { useApi } from './useApi'

const { executeCode, exportModel: apiExportModel } = useApi()

const editorCode = ref('')
const meshData = ref('')
const statusText = ref('就绪')
const statusType = ref('idle')
const lastOutput = ref('')
const lastError = ref('')

function setStatus(text, type) {
  statusText.value = text
  statusType.value = type
}

async function runCode() {
  statusText.value = '执行中...'
  statusType.value = 'running'
  lastOutput.value = ''
  lastError.value = ''
  try {
    const result = await executeCode(editorCode.value)
    if (result.output) {
      lastOutput.value = result.output
    }
    if (result.meshData) {
      meshData.value = result.meshData
      setStatus('执行成功', 'success')
    } else if (result.error) {
      lastError.value = result.error
      setStatus(result.error, 'error')
    } else {
      setStatus('执行成功', 'success')
    }
  } catch (e) {
    lastError.value = e.message || '执行失败'
    setStatus(e.message || '执行失败', 'error')
  }
}

async function exportModel(format, modelName) {
  try {
    const result = await apiExportModel(editorCode.value, format)
    if (result.url) {
      const a = document.createElement('a')
      a.href = result.url
      a.download = `${modelName}.${format}`
      a.click()
    } else if (result.fileData) {
      const binaryStr = atob(result.fileData)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
      const blob = new Blob([bytes], { type: format === 'stl' ? 'application/sla' : 'application/step' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${modelName}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    }
    setStatus('导出成功', 'success')
    return true
  } catch (e) {
    setStatus(e.message || '导出失败', 'error')
    return false
  }
}

export function useEditor() {
  return {
    editorCode, meshData, statusText, statusType, lastOutput, lastError,
    setStatus, runCode, exportModel
  }
}

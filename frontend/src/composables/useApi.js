import { API_BASE } from '../config'

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || error.detail || `请求失败: ${response.status}`)
  }
  return response.json()
}

export function useApi() {
  const executeCode = (code) => request('/execute', { method: 'POST', body: JSON.stringify({ code }) })

  const exportModel = (code, format) => request('/export', { method: 'POST', body: JSON.stringify({ code, format }) })

  const getModels = () => request('/models')

  const createModel = (name, code) => request('/models', { method: 'POST', body: JSON.stringify({ name, code }) })

  const updateModel = (id, data) => request(`/models/${id}`, { method: 'PUT', body: JSON.stringify(data) })

  const deleteModel = (id) => request(`/models/${id}`, { method: 'DELETE' })

  const getModelCode = (id) => request(`/models/${id}/code`)

  const getExamples = () => request('/examples')

  return { executeCode, exportModel, getModels, createModel, updateModel, deleteModel, getModelCode, getExamples }
}

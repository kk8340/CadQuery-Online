<template>
  <div class="h-full flex flex-col bg-[#0c1222]">
    <div class="h-7 flex items-center justify-between px-3 bg-slate-800/60 border-b border-slate-700/50 shrink-0">
      <div class="flex items-center gap-2">
        <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
        <span class="text-[11px] font-medium text-slate-400">AI 助手</span>
        <span v-if="loading" class="text-[10px] text-cyan-400 animate-pulse">思考中...</span>
      </div>
      <button class="text-slate-500 hover:text-slate-300 transition-colors" @click="clearChat" title="清空对话">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>

    <div ref="chatContainer" class="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
        <svg class="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
        <span class="text-xs">向 AI 助手提问</span>
      </div>

      <div v-for="(msg, idx) in messages" :key="idx" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
        <div :class="[
          'max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed',
          msg.role === 'user'
            ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30'
            : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'
        ]">
          <div class="whitespace-pre-wrap break-words" v-html="renderMessage(msg.content)"></div>
          <div v-if="msg.codeEdit" class="mt-2 p-2 bg-slate-900/80 rounded border border-cyan-500/30">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] text-cyan-400 font-medium">代码修改建议</span>
              <div class="flex gap-1">
                <button class="px-2 py-0.5 text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors" @click="applyCode(msg.codeEdit)">应用</button>
                <button class="px-2 py-0.5 text-[10px] bg-slate-600 hover:bg-slate-500 text-slate-200 rounded transition-colors" @click="msg.codeEdit = null">取消</button>
              </div>
            </div>
            <pre class="text-[10px] text-cyan-300 font-mono overflow-x-auto max-h-32 overflow-y-auto">{{ msg.codeEdit }}</pre>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-start">
        <div class="bg-slate-800/80 rounded-lg px-3 py-2 border border-slate-700/50">
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-2 border-t border-slate-700/50 shrink-0">
      <div class="flex gap-2">
        <input
          ref="inputRef"
          v-model="inputText"
          class="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          placeholder="输入问题，Ctrl+Enter 发送..."
          @keydown.enter.ctrl="sendMessage"
          @keydown.enter.meta="sendMessage"
        />
        <button
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            loading
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          ]"
          :disabled="loading"
          @click="sendMessage"
        >
          <svg v-if="loading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="pendingCode !== null" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div class="bg-slate-800 border border-slate-600 rounded-xl p-5 max-w-lg w-full mx-4 shadow-2xl">
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-sm font-semibold text-slate-200">AI 建议修改代码</h3>
        </div>
        <p class="text-xs text-slate-400 mb-3">AI 建议将编辑器内容替换为以下代码：</p>
        <pre class="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[11px] text-cyan-300 font-mono overflow-auto max-h-60 mb-4">{{ pendingCode }}</pre>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 text-xs bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg transition-colors" @click="cancelCode">取消</button>
          <button class="px-4 py-2 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors" @click="confirmCode">应用代码</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { API_BASE } from '../config'

const emit = defineEmits(['apply-code', 'set-view'])

const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const chatContainer = ref(null)
const inputRef = ref(null)
const pendingCode = ref(null)

function renderMessage(content) {
  let html = escapeHtml(content)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="my-1 p-1.5 bg-slate-900/80 rounded text-[10px] font-mono overflow-x-auto text-cyan-300">${code.trim()}</pre>`
  })
  html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-900/60 rounded text-cyan-300 text-[10px] font-mono">$1</code>')
  html = html.replace(/\[VIEW:(\w+)\]/g, '<span class="px-1 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[10px]">视角:$1</span>')
  return html
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function parseAIResponse(content) {
  const codeEditMatch = content.match(/```python:edit\n([\s\S]*?)```/)
  const codeEdit = codeEditMatch ? codeEditMatch[1].trim() : null

  const viewMatches = content.match(/\[VIEW:(\w+)\]/g)
  const viewCommands = viewMatches ? viewMatches.map(m => m.match(/\[VIEW:(\w+)\]/)[1].toLowerCase()) : []

  return { codeEdit, viewCommands }
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  loading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.value.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        code: props.currentCode,
        output: props.currentOutput,
        error: props.currentError,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: '请求失败' }))
      throw new Error(err.detail || err.message || 'AI 服务错误')
    }

    const aiMsg = { role: 'assistant', content: '', codeEdit: null }
    messages.value.push(aiMsg)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') break

        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            aiMsg.content += `\n\n⚠️ ${parsed.error}`
            break
          }
          if (parsed.content) {
            aiMsg.content += parsed.content
          }
        } catch {}
      }
    }

    const { codeEdit, viewCommands } = parseAIResponse(aiMsg.content)
    if (codeEdit) {
      aiMsg.codeEdit = codeEdit
    }
    for (const view of viewCommands) {
      emit('set-view', view)
    }
  } catch (e) {
    messages.value.push({ role: 'assistant', content: `⚠️ ${e.message}` })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
    if (inputRef.value) inputRef.value.focus()
  }
}

function applyCode(code) {
  pendingCode.value = code
}

function confirmCode() {
  if (pendingCode.value !== null) {
    emit('apply-code', pendingCode.value)
    pendingCode.value = null
    const lastAi = [...messages.value].reverse().find(m => m.role === 'assistant')
    if (lastAi) lastAi.codeEdit = null
  }
}

function cancelCode() {
  pendingCode.value = null
}

function clearChat() {
  messages.value = []
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const props = defineProps({
  currentCode: { type: String, default: '' },
  currentOutput: { type: String, default: '' },
  currentError: { type: String, default: '' },
})

defineExpose({ clearChat })
</script>

import { API_BASE, DEFAULT_CODE, CACHE_KEYS } from './config.js';
import { state } from './state.js';
import { getCachedData, setCachedData } from './cache.js';
import { showModal, hideModal, setStatus } from './ui.js';

export async function loadModels() {
    try {
        const response = await fetch(`${API_BASE}/models`);
        const models = await response.json();

        setCachedData(CACHE_KEYS.MODELS, models);

        renderModelList(models);
    } catch (err) {
        const cached = getCachedData(CACHE_KEYS.MODELS);
        if (cached) {
            renderModelList(cached);
        } else {
            renderModelList([]);
        }
    }
}

export function renderModelList(models) {
    const list = document.getElementById('model-list');
    list.innerHTML = '';

    if (models.length === 0) {
        list.innerHTML = `
            <div class="text-center text-slate-500 py-8 text-sm">
                <p>还没有模型</p>
                <p class="text-xs mt-1">点击"新建模型"开始</p>
            </div>
        `;
        return;
    }

    models.forEach(model => {
        const item = document.createElement('div');
        item.className = `sidebar-item p-3 rounded-lg border-l-2 border-transparent cursor-pointer transition-all ${state.currentModelId === model.id ? 'active' : ''}`;
        item.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0">
                    <svg class="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                    </svg>
                    <span class="text-sm font-medium truncate">${model.name}</span>
                </div>
                <button class="delete-btn text-slate-500 hover:text-red-400 transition-colors p-1" data-id="${model.id}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
            <div class="text-xs text-slate-500 mt-1">
                ${new Date(model.updatedAt).toLocaleDateString('zh-CN')}
            </div>
        `;
        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteModel(model.id);
        });
        item.addEventListener('click', () => openModel(model));
        list.appendChild(item);
    });
}

async function openModel(model) {
    state.currentModelId = model.id;
    document.getElementById('model-name').textContent = model.name;

    try {
        const response = await fetch(`${API_BASE}/models/${model.id}/code`);
        const data = await response.json();
        if (state.editor) {
            state.editor.setValue(data.code || DEFAULT_CODE);
        }
    } catch (err) {
        if (state.editor) {
            state.editor.setValue(DEFAULT_CODE);
        }
    }

    loadModels();
}

export async function createNewModel() {
    const nameInput = document.getElementById('new-model-name');
    const name = nameInput.value.trim() || '未命名模型';

    try {
        const response = await fetch(`${API_BASE}/models`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, code: DEFAULT_CODE })
        });

        const model = await response.json();
        state.currentModelId = model.id;
        document.getElementById('model-name').textContent = name;

        if (state.editor) {
            state.editor.setValue(DEFAULT_CODE);
        }

        hideModal('new-model-modal');
        nameInput.value = '';
        loadModels();
    } catch (err) {
        alert('创建模型失败');
    }
}

export async function saveModel() {
    if (!state.currentModelId) {
        showModal('new-model-modal');
        return;
    }

    if (!state.editor) return;

    try {
        await fetch(`${API_BASE}/models/${state.currentModelId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: state.editor.getValue() })
        });
        setStatus('已保存', 'success');
        loadModels();
    } catch (err) {
        setStatus('保存失败', 'error');
    }
}

async function deleteModel(id) {
    if (!confirm('确定要删除这个模型吗？')) return;

    try {
        await fetch(`${API_BASE}/models/${id}`, { method: 'DELETE' });
        if (state.currentModelId === id) {
            state.currentModelId = null;
            document.getElementById('model-name').textContent = '未命名模型';
        }
        loadModels();
    } catch (err) {
        alert('删除失败');
    }
}


import { API_BASE, CACHE_KEYS } from './config.js';
import { state } from './state.js';
import { getCachedData, setCachedData } from './cache.js';
import { showModal, hideModal, escapeHtml } from './ui.js';
import { runCode } from './execute.js';

export async function openExamples() {
    showModal('examples-modal');
    await loadExamples();
}

async function loadExamples() {
    try {
        const cached = getCachedData(CACHE_KEYS.EXAMPLES);
        if (cached) {
            state.examplesData = cached;
            renderCategories();
            renderExamples();
            return;
        }

        const response = await fetch(`${API_BASE}/examples`);
        state.examplesData = await response.json();

        setCachedData(CACHE_KEYS.EXAMPLES, state.examplesData);

        renderCategories();
        renderExamples();
    } catch (err) {
        console.error('加载示例失败:', err);
    }
}

function renderCategories() {
    const categoriesList = document.getElementById('example-categories');
    categoriesList.innerHTML = '';

    const allItem = document.createElement('div');
    allItem.className = `category-item px-3 py-2 rounded-lg cursor-pointer transition-all ${state.currentCategory === 'all' ? 'active' : ''}`;
    allItem.textContent = '全部';
    allItem.addEventListener('click', () => {
        state.currentCategory = 'all';
        renderCategories();
        renderExamples();
    });
    categoriesList.appendChild(allItem);

    state.examplesData.categories.forEach(category => {
        const item = document.createElement('div');
        item.className = `category-item px-3 py-2 rounded-lg cursor-pointer transition-all ${state.currentCategory === category ? 'active' : ''}`;
        item.textContent = category;
        item.addEventListener('click', () => {
            state.currentCategory = category;
            renderCategories();
            renderExamples();
        });
        categoriesList.appendChild(item);
    });
}

function renderExamples() {
    const examplesGrid = document.getElementById('examples-grid');
    examplesGrid.innerHTML = '';

    let filteredExamples = state.examplesData.examples;
    if (state.currentCategory !== 'all') {
        filteredExamples = state.examplesData.examples.filter(ex => ex.category === state.currentCategory);
    }

    if (filteredExamples.length === 0) {
        examplesGrid.innerHTML = `
            <div class="col-span-full text-center text-slate-500 py-8">
                <p>该分类暂无示例</p>
            </div>
        `;
        return;
    }

    filteredExamples.forEach(example => {
        const card = document.createElement('div');
        card.className = `example-card p-4 rounded-xl cursor-pointer hover:border-cyan-500 transition-all ${state.selectedExample?.id === example.id ? 'border-cyan-500 bg-cyan-500/10' : ''}`;
        card.innerHTML = `
            <div class="text-2xl mb-2">${example.icon}</div>
            <h3 class="font-semibold mb-1 text-sm">${example.name}</h3>
            <p class="text-xs text-slate-400">${example.category}</p>
        `;
        card.addEventListener('click', () => selectExample(example));
        examplesGrid.appendChild(card);
    });

    if (!state.selectedExample) {
        document.getElementById('example-preview').classList.add('hidden');
    }
}

function selectExample(example) {
    state.selectedExample = example;
    renderExamples();
    renderExamplePreview();
}

function renderExamplePreview() {
    const previewContainer = document.getElementById('example-preview');
    previewContainer.classList.remove('hidden');

    if (!state.selectedExample) {
        previewContainer.innerHTML = `
            <div class="h-full flex items-center justify-center text-slate-500">
                <p>选择一个示例查看</p>
            </div>
        `;
        return;
    }

    previewContainer.innerHTML = `
        <div class="h-full flex flex-col">
            <div class="mb-4">
                <h3 class="text-lg font-bold text-white mb-1">${state.selectedExample.icon} ${state.selectedExample.name}</h3>
                <span class="text-sm text-cyan-400">${state.selectedExample.category}</span>
            </div>
            <div class="flex-1 bg-slate-800 rounded-lg overflow-hidden">
                <pre class="text-xs p-4 overflow-auto h-full" style="font-family: 'JetBrains Mono', monospace; line-height: 1.6;"><code class="text-slate-300">${escapeHtml(state.selectedExample.code)}</code></pre>
            </div>
            <div class="mt-4">
                <button id="use-example-btn" class="w-full btn-primary py-3 rounded-xl font-medium">
                    使用此示例
                </button>
            </div>
        </div>
    `;

    document.getElementById('use-example-btn').addEventListener('click', () => useExample(state.selectedExample));
}

function useExample(example) {
    if (state.editor) {
        state.editor.setValue(example.code);
    }
    hideModal('examples-modal');
    setTimeout(() => {
        runCode();
    }, 100);
}

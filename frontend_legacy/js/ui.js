import { TEMPLATES } from './config.js';
import { state } from './state.js';
import { insertCode } from './editor.js';

export function showModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function hideModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export function setStatus(text, type = 'info') {
    const statusBar = document.getElementById('status-bar');
    const colors = {
        info: 'bg-slate-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
        loading: 'bg-yellow-500'
    };
    statusBar.innerHTML = `
        <span class="w-2 h-2 rounded-full ${colors[type]} ${type === 'loading' ? 'animate-pulse' : ''}"></span>
        ${text}
    `;
}

export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const expandBtn = document.getElementById('btn-expand-sidebar');

    sidebar.classList.add('hidden');
    expandBtn.classList.remove('hidden');
}

export function expandSidebar() {
    const sidebar = document.getElementById('sidebar');
    const expandBtn = document.getElementById('btn-expand-sidebar');

    sidebar.classList.remove('hidden');
    expandBtn.classList.add('hidden');
}

export function toggleTools() {
    const tools = document.getElementById('editor-tools');
    tools.classList.toggle('hidden');
}

export function openDocs() {
    const docsPath = '../docs.html';
    window.open(docsPath, '_blank', 'width=1400,height=900,scrollbars=yes');
}

export function setupTemplates() {
    const grid = document.getElementById('templates-grid');
    TEMPLATES.forEach(template => {
        const card = document.createElement('div');
        card.className = 'card p-4 rounded-xl cursor-pointer hover:border-cyan-500 transition-all';
        card.innerHTML = `
            <div class="text-3xl mb-2">${template.icon}</div>
            <h3 class="font-semibold mb-1">${template.name}</h3>
            <p class="text-xs text-slate-400">${template.description}</p>
        `;
        card.addEventListener('click', () => {
            useTemplate(template.code);
            hideModal('templates-modal');
        });
        grid.appendChild(card);
    });
}

function useTemplate(code) {
    if (state.editor) {
        state.editor.setValue(code);
    }
}

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

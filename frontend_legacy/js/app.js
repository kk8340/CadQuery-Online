import { state } from './state.js';
import { initEditor, insertCode } from './editor.js';
import { initViewer } from './viewer.js';
import { loadModels, createNewModel, saveModel } from './models.js';
import { openExamples } from './examples.js';
import { exportModel } from './export.js';
import { runCode } from './execute.js';
import {
    showModal, hideModal, setStatus,
    toggleSidebar, expandSidebar, toggleTools,
    openDocs, setupTemplates
} from './ui.js';
import { restoreToolSectionStates, initToolButtons } from './toolbar.js';

document.addEventListener('DOMContentLoaded', () => {
    initViewer();
    loadModels();
    setupEventListeners();
    setupTemplates();
    restoreToolSectionStates();
    initToolButtons();

    setTimeout(() => {
        initEditor();
    }, 50);
});

function setupEventListeners() {
    document.getElementById('btn-run').addEventListener('click', runCode);
    document.getElementById('btn-save').addEventListener('click', saveModel);
    document.getElementById('btn-export').addEventListener('click', () => showModal('export-modal'));
    document.getElementById('btn-templates').addEventListener('click', () => showModal('templates-modal'));
    document.getElementById('btn-examples').addEventListener('click', openExamples);
    document.getElementById('btn-docs').addEventListener('click', openDocs);
    document.getElementById('btn-new-model').addEventListener('click', () => showModal('new-model-modal'));
    document.getElementById('btn-reset-view').addEventListener('click', () => {
        import('./viewer.js').then(m => m.resetView());
    });

    document.getElementById('btn-toggle-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('btn-expand-sidebar').addEventListener('click', expandSidebar);
    document.getElementById('btn-toggle-tools').addEventListener('click', toggleTools);

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-code');
            insertCode(code);
        });
    });

    document.getElementById('close-templates').addEventListener('click', () => hideModal('templates-modal'));
    document.getElementById('close-examples').addEventListener('click', () => hideModal('examples-modal'));
    document.getElementById('close-export').addEventListener('click', () => hideModal('export-modal'));
    document.getElementById('close-new-model').addEventListener('click', () => hideModal('new-model-modal'));

    document.getElementById('confirm-export').addEventListener('click', exportModel);
    document.getElementById('confirm-new-model').addEventListener('click', createNewModel);

    document.querySelectorAll('.export-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.export-option').forEach(b => b.classList.remove('border-cyan-500', 'bg-cyan-500/10'));
            btn.classList.add('border-cyan-500', 'bg-cyan-500/10');
            state.selectedExportFormat = btn.dataset.format;
        });
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
    });

    ['templates-modal', 'export-modal', 'new-model-modal', 'examples-modal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === id) hideModal(id);
            });
        }
    });
}

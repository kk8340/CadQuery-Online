import { DEFAULT_CODE } from './config.js';
import { state } from './state.js';

export function initEditor() {
    if (state.editorLoading) return;
    state.editorLoading = true;

    const container = document.getElementById('editor-container');
    if (!container) {
        console.error('编辑器容器不存在');
        return;
    }

    container.innerHTML = '';

    const textarea = document.createElement('textarea');
    textarea.id = 'codemirror-editor';
    textarea.name = 'code';
    textarea.className = 'CodeMirror';
    container.appendChild(textarea);

    try {
        window.editor = CodeMirror.fromTextArea(textarea, {
            mode: 'python',
            theme: 'monokai',
            lineNumbers: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            lineWrapping: true,
            styleActiveLine: true,
            extraKeys: {
                'Ctrl-Enter': 'autocomplete',
                'Tab': 'autocomplete'
            }
        });

        window.editor.setValue(DEFAULT_CODE);

        window.editor.getWrapperElement().style.height = '100%';
        window.editor.getWrapperElement().style.fontSize = '14px';
        window.editor.getWrapperElement().style.fontFamily = "'JetBrains Mono', monospace";

        state.editor = window.editor;

        console.log('✅ CodeMirror 编辑器初始化成功');
    } catch (error) {
        console.error('CodeMirror 初始化失败:', error);
        initSimpleEditor();
    }
}

function initSimpleEditor() {
    const container = document.getElementById('editor-container');
    if (!container) {
        console.error('编辑器容器不存在');
        return;
    }

    container.innerHTML = `
        <div class="h-full bg-slate-900 p-4">
            <textarea id="simple-editor"
                      class="w-full h-full bg-slate-800 text-slate-100 p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      style="font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 1.6;"
                      placeholder="在此输入 CadQuery 代码..."
            >${DEFAULT_CODE}</textarea>
        </div>
    `;

    window.editor = {
        getValue: () => document.getElementById('simple-editor').value,
        setValue: (code) => { document.getElementById('simple-editor').value = code; },
        focus: () => { document.getElementById('simple-editor').focus(); },
        getSelection: () => ({ getEndPosition: () => ({ lineNumber: 1, column: 1 }) }),
        executeEdits: (id, edits) => {
            const textarea = document.getElementById('simple-editor');
            const pos = textarea.selectionStart;
            const before = textarea.value.substring(0, pos);
            const after = textarea.value.substring(pos);
            textarea.value = before + edits[0].text + after;
        }
    };

    state.editor = window.editor;
    console.log('简化编辑器初始化成功');
}

export function insertCode(code) {
    if (!state.editor) {
        alert('编辑器未初始化');
        return;
    }

    try {
        if (typeof CodeMirror !== 'undefined') {
            state.editor.replaceSelection(code);
        } else {
            const currentCode = state.editor.getValue();
            state.editor.setValue(currentCode + '\n' + code);
        }

        state.editor.focus();
        console.log('✅ 代码已插入:', code);
    } catch (error) {
        console.error('插入代码失败:', error);
        try {
            const currentCode = state.editor.getValue ? state.editor.getValue() : '';
            if (state.editor.setValue) {
                state.editor.setValue(currentCode + '\n' + code);
            }
        } catch (e) {
            console.error('备选方案也失败:', e);
        }
    }
}

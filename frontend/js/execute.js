import { API_BASE } from './config.js';
import { state } from './state.js';
import { setStatus } from './ui.js';
import { loadMesh } from './viewer.js';

export async function runCode() {
    if (!state.editor) return;

    const code = state.editor.getValue();
    setStatus('正在运行...', 'loading');

    try {
        const response = await fetch(`${API_BASE}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (data.success) {
            loadMesh(data.meshData);
            setStatus('成功', 'success');
        } else {
            setStatus(`错误: ${data.error}`, 'error');
        }
    } catch (err) {
        setStatus(`连接错误: 请确保后端服务已启动`, 'error');
    }
}

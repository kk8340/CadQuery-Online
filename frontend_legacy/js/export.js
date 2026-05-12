import { API_BASE } from './config.js';
import { state } from './state.js';
import { setStatus } from './ui.js';
import { hideModal } from './ui.js';

export async function exportModel() {
    if (!state.editor) return;

    setStatus('正在导出...', 'loading');

    try {
        const response = await fetch(`${API_BASE}/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: state.editor.getValue(),
                format: state.selectedExportFormat
            })
        });

        const data = await response.json();

        if (data.success) {
            const fileData = atob(data.fileData);
            const uint8Array = new Uint8Array(fileData.length);
            for (let i = 0; i < fileData.length; i++) {
                uint8Array[i] = fileData.charCodeAt(i);
            }

            const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `model.${state.selectedExportFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus('导出成功', 'success');
            hideModal('export-modal');
        } else {
            setStatus(`导出失败: ${data.error}`, 'error');
        }
    } catch (err) {
        setStatus('导出失败', 'error');
    }
}

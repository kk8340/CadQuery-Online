const API_BASE = '/api';

let examplesData = { examples: [], categories: [] };
let currentCategory = 'all';
let selectedExample = null;

const TEMPLATES = [
    {
        id: 'box',
        name: '长方体',
        description: '创建一个简单的长方体',
        icon: '📦',
        code: `result = cq.Workplane("XY").box(20, 20, 10)`
    },
    {
        id: 'cylinder',
        name: '圆柱体',
        description: '创建一个圆柱体',
        icon: '🔵',
        code: `result = cq.Workplane("XY").circle(10).extrude(20)`
    },
    {
        id: 'cone',
        name: '圆锥体',
        description: '创建一个圆锥体',
        icon: '🔺',
        code: `result = cq.Workplane("XY").polygon(3, 20).extrude(30)`
    },
    {
        id: 'hole',
        name: '带孔的方块',
        description: '在方块中心创建一个孔',
        icon: '🕳️',
        code: `result = (
    cq.Workplane("XY")
    .box(30, 30, 15)
    .faces(">Z")
    .workplane()
    .hole(10)
)`
    },
    {
        id: 'fillet',
        name: '圆角方块',
        description: '创建带圆角的方图',
        icon: '⬜',
        code: `result = (
    cq.Workplane("XY")
    .box(30, 30, 15)
    .edges()
    .fillet(3)
)`
    },
    {
        id: 'extrude',
        name: '复杂拉伸',
        description: '从草图创建复杂形状',
        icon: '🎨',
        code: `result = (
    cq.Workplane("XY")
    .hLine(20)
    .vLine(10)
    .hLine(-10)
    .vLine(10)
    .hLine(-10)
    .close()
    .extrude(15)
)`
    }
];

const DEFAULT_CODE = `result = cq.Workplane("XY").box(20, 20, 10)`;

let currentModelId = null;
let editor = null;
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let currentMesh = null;
let selectedExportFormat = 'stl';

// 编辑器加载状态
let editorLoading = false;

document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有组件
    initViewer();
    loadModels();
    setupEventListeners();
    setupTemplates();
    
    // 立即初始化编辑器
    setTimeout(() => {
        initEditor();
    }, 50);
});

function initEditor() {
    if (editorLoading) return;
    editorLoading = true;
    
    const container = document.getElementById('editor-container');
    if (!container) {
        console.error('编辑器容器不存在');
        return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建 textarea
    const textarea = document.createElement('textarea');
    textarea.id = 'codemirror-editor';
    textarea.name = 'code';
    textarea.className = 'CodeMirror';
    container.appendChild(textarea);
    
    try {
        // 初始化 CodeMirror
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
        
        // 设置初始代码
        window.editor.setValue(DEFAULT_CODE);
        
        // 设置编辑器样式
        window.editor.getWrapperElement().style.height = '100%';
        window.editor.getWrapperElement().style.fontSize = '14px';
        window.editor.getWrapperElement().style.fontFamily = "'JetBrains Mono', monospace";
        
        editor = window.editor;
        
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
    
    // 简单的编辑器包装器
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
    
    editor = window.editor;
    console.log('简化编辑器初始化成功');
}

function initViewer() {
    const container = document.getElementById('viewer-container');
    const canvas = document.getElementById('viewer-canvas');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(40, 40, 40);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(50, 50, 50);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-50, -50, -50);
    scene.add(directionalLight2);
    
    const gridHelper = new THREE.GridHelper(100, 20, 0x334155, 0x1e293b);
    scene.add(gridHelper);
    
    const axesHelper = new THREE.AxesHelper(25);
    scene.add(axesHelper);
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function setupEventListeners() {
    document.getElementById('btn-run').addEventListener('click', runCode);
    document.getElementById('btn-save').addEventListener('click', saveModel);
    document.getElementById('btn-export').addEventListener('click', () => showModal('export-modal'));
    document.getElementById('btn-templates').addEventListener('click', () => showModal('templates-modal'));
    document.getElementById('btn-examples').addEventListener('click', openExamples);
    document.getElementById('btn-docs').addEventListener('click', openDocs);
    document.getElementById('btn-new-model').addEventListener('click', () => showModal('new-model-modal'));
    document.getElementById('btn-reset-view').addEventListener('click', resetView);
    
    // 折叠侧边栏
    document.getElementById('btn-toggle-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('btn-expand-sidebar').addEventListener('click', expandSidebar);
    
    // 折叠工具栏
    document.getElementById('btn-toggle-tools').addEventListener('click', toggleTools);
    
    // 工具栏按钮点击
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
            selectedExportFormat = btn.dataset.format;
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

function openDocs() {
    const docsPath = '../docs.html';
    window.open(docsPath, '_blank', 'width=1400,height=900,scrollbars=yes');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const expandBtn = document.getElementById('btn-expand-sidebar');
    
    sidebar.classList.add('hidden');
    expandBtn.classList.remove('hidden');
}

function expandSidebar() {
    const sidebar = document.getElementById('sidebar');
    const expandBtn = document.getElementById('btn-expand-sidebar');
    
    sidebar.classList.remove('hidden');
    expandBtn.classList.add('hidden');
}

function toggleTools() {
    const tools = document.getElementById('editor-tools');
    tools.classList.toggle('hidden');
}

function insertCode(code) {
    if (!editor) {
        alert('编辑器未初始化');
        return;
    }
    
    try {
        // CodeMirror API
        if (typeof CodeMirror !== 'undefined') {
            // 在光标位置插入代码
            editor.replaceSelection(code);
        } else {
            // 备选方案：在编辑器末尾添加
            const currentCode = editor.getValue();
            editor.setValue(currentCode + '\n' + code);
        }
        
        editor.focus();
        console.log('✅ 代码已插入:', code);
    } catch (error) {
        console.error('插入代码失败:', error);
        // 备选方案：追加到末尾
        try {
            const currentCode = editor.getValue ? editor.getValue() : '';
            if (editor.setValue) {
                editor.setValue(currentCode + '\n' + code);
            }
        } catch (e) {
            console.error('备选方案也失败:', e);
        }
    }
}

function setupTemplates() {
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
    if (editor) {
        editor.setValue(code);
    }
}

function showModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function setStatus(text, type = 'info') {
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

async function runCode() {
    if (!editor) return;
    
    const code = editor.getValue();
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

function loadMesh(meshData) {
    if (currentMesh) {
        scene.remove(currentMesh);
    }
    
    const stlData = atob(meshData);
    const arrayBuffer = new ArrayBuffer(stlData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < stlData.length; i++) {
        uint8Array[i] = stlData.charCodeAt(i);
    }
    
    const loader = new THREE.STLLoader();
    const geometry = loader.parse(arrayBuffer);
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        metalness: 0.3,
        roughness: 0.7
    });
    
    currentMesh = new THREE.Mesh(geometry, material);
    
    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(new THREE.Vector3());
    currentMesh.position.sub(center);
    
    scene.add(currentMesh);
    
    document.getElementById('viewer-overlay').classList.add('hidden');
    
    resetView();
}

function resetView() {
    camera.position.set(40, 40, 40);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
}

async function loadModels() {
    try {
        const response = await fetch(`${API_BASE}/models`);
        const models = await response.json();
        renderModelList(models);
    } catch (err) {
        renderModelList([]);
    }
}

function renderModelList(models) {
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
        item.className = `sidebar-item p-3 rounded-lg border-l-2 border-transparent cursor-pointer transition-all ${currentModelId === model.id ? 'active' : ''}`;
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
    currentModelId = model.id;
    document.getElementById('model-name').textContent = model.name;
    
    try {
        const response = await fetch(`${API_BASE}/models/${model.id}/code`);
        const data = await response.json();
        if (editor) {
            editor.setValue(data.code || DEFAULT_CODE);
        }
    } catch (err) {
        if (editor) {
            editor.setValue(DEFAULT_CODE);
        }
    }
    
    loadModels();
}

async function createNewModel() {
    const nameInput = document.getElementById('new-model-name');
    const name = nameInput.value.trim() || '未命名模型';
    
    try {
        const response = await fetch(`${API_BASE}/models`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, code: DEFAULT_CODE })
        });
        
        const model = await response.json();
        currentModelId = model.id;
        document.getElementById('model-name').textContent = name;
        
        if (editor) {
            editor.setValue(DEFAULT_CODE);
        }
        
        hideModal('new-model-modal');
        nameInput.value = '';
        loadModels();
    } catch (err) {
        alert('创建模型失败');
    }
}

async function saveModel() {
    if (!currentModelId) {
        showModal('new-model-modal');
        return;
    }
    
    if (!editor) return;
    
    try {
        await fetch(`${API_BASE}/models/${currentModelId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: editor.getValue() })
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
        if (currentModelId === id) {
            currentModelId = null;
            document.getElementById('model-name').textContent = '未命名模型';
        }
        loadModels();
    } catch (err) {
        alert('删除失败');
    }
}

async function exportModel() {
    if (!editor) return;
    
    setStatus('正在导出...', 'loading');
    
    try {
        const response = await fetch(`${API_BASE}/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code: editor.getValue(),
                format: selectedExportFormat
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
            a.download = `model.${selectedExportFormat}`;
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

// 示例浏览器功能
async function openExamples() {
    showModal('examples-modal');
    await loadExamples();
}

async function loadExamples() {
    try {
        const response = await fetch(`${API_BASE}/examples`);
        examplesData = await response.json();
        renderCategories();
        renderExamples();
    } catch (err) {
        console.error('加载示例失败:', err);
    }
}

function renderCategories() {
    const categoriesList = document.getElementById('example-categories');
    categoriesList.innerHTML = '';
    
    // 添加"全部"选项
    const allItem = document.createElement('div');
    allItem.className = `category-item px-3 py-2 rounded-lg cursor-pointer transition-all ${currentCategory === 'all' ? 'active' : ''}`;
    allItem.textContent = '全部';
    allItem.addEventListener('click', () => {
        currentCategory = 'all';
        renderCategories();
        renderExamples();
    });
    categoriesList.appendChild(allItem);
    
    // 添加各分类
    examplesData.categories.forEach(category => {
        const item = document.createElement('div');
        item.className = `category-item px-3 py-2 rounded-lg cursor-pointer transition-all ${currentCategory === category ? 'active' : ''}`;
        item.textContent = category;
        item.addEventListener('click', () => {
            currentCategory = category;
            renderCategories();
            renderExamples();
        });
        categoriesList.appendChild(item);
    });
}

function renderExamples() {
    const examplesGrid = document.getElementById('examples-grid');
    examplesGrid.innerHTML = '';
    
    let filteredExamples = examplesData.examples;
    if (currentCategory !== 'all') {
        filteredExamples = examplesData.examples.filter(ex => ex.category === currentCategory);
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
        card.className = `example-card p-4 rounded-xl cursor-pointer hover:border-cyan-500 transition-all ${selectedExample?.id === example.id ? 'border-cyan-500 bg-cyan-500/10' : ''}`;
        card.innerHTML = `
            <div class="text-2xl mb-2">${example.icon}</div>
            <h3 class="font-semibold mb-1 text-sm">${example.name}</h3>
            <p class="text-xs text-slate-400">${example.category}</p>
        `;
        card.addEventListener('click', () => selectExample(example));
        examplesGrid.appendChild(card);
    });
    
    if (!selectedExample) {
        document.getElementById('example-preview').classList.add('hidden');
    }
}

function selectExample(example) {
    selectedExample = example;
    renderExamples();
    renderExamplePreview();
}

function renderExamplePreview() {
    const previewContainer = document.getElementById('example-preview');
    previewContainer.classList.remove('hidden');
    
    if (!selectedExample) {
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
                <h3 class="text-lg font-bold text-white mb-1">${selectedExample.icon} ${selectedExample.name}</h3>
                <span class="text-sm text-cyan-400">${selectedExample.category}</span>
            </div>
            <div class="flex-1 bg-slate-800 rounded-lg overflow-hidden">
                <pre class="text-xs p-4 overflow-auto h-full" style="font-family: 'JetBrains Mono', monospace; line-height: 1.6;"><code class="text-slate-300">${escapeHtml(selectedExample.code)}</code></pre>
            </div>
            <div class="mt-4">
                <button id="use-example-btn" class="w-full btn-primary py-3 rounded-xl font-medium">
                    使用此示例
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('use-example-btn').addEventListener('click', () => useExample(selectedExample));
}

function useExample(example) {
    if (editor) {
        editor.setValue(example.code);
    }
    hideModal('examples-modal');
    setTimeout(() => {
        runCode();
    }, 100);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

# CadQuery Online - 在线参数化建模平台

基于 Web 的 CadQuery 3D 参数化建模平台，集成 AI 助手，支持代码编辑、实时 3D 预览、模型管理、导出和智能辅助。

## 功能特性

- **代码编辑器** — CodeMirror 6，Python 语法高亮、自动补全、括号匹配
- **实时 3D 预览** — Three.js 渲染，支持旋转/缩放/平移，7 种预设视角
- **终端输出** — 显示代码运行输出和错误信息，彩色区分
- **AI 助手** — DeepSeek 驱动的智能对话，可分析代码、诊断错误、生成建模代码
- **AI 代码应用** — AI 返回的代码可一键应用到编辑器，支持确认/取消
- **AI 视角控制** — AI 可自动切换 3D 视角检查模型（正/背/顶/底/左/右/等轴测）
- **模型管理** — 创建、保存、删除、打开模型
- **导出功能** — 支持 STL 和 STEP 格式
- **代码模板** — 内置常用 CadQuery 代码模板
- **示例浏览** — 按分类浏览 CadQuery 官方示例
- **工具栏** — 快捷插入 CadQuery 操作代码，可折叠分组
- **安全沙箱** — 受限执行环境，白名单导入，禁止高风险操作
- **错误提示** — OpenCascade 几何错误提供中文解释和修复建议

## 技术栈

### 后端
| 技术 | 用途 |
|------|------|
| FastAPI | Web 框架 |
| CadQuery | 3D 参数化建模引擎 |
| Uvicorn | ASGI 服务器 |
| httpx | DeepSeek API 流式调用 |
| Pydantic | 数据验证 |

### 前端
| 技术 | 用途 |
|------|------|
| Vue 3 + Vite 8 | 前端框架 + 构建工具 |
| Tailwind CSS v4 | 样式框架 |
| CodeMirror 6 | 代码编辑器 |
| Three.js r184 | 3D 渲染（STLLoader + OrbitControls） |

## 安装步骤

1. 确保已安装 Python 3.10+ 和 Node.js 18+

2. 安装 Python 依赖：
```bash
pip install -r requirements.txt
```

3. 安装前端依赖：
```bash
cd frontend
npm install
```

4. 配置 AI 助手（可选）：
```bash
setx DEEPSEEK_API_KEY "your-api-key-here"
```

## 启动应用

### 方式一：分别启动

```bash
# 终端1 - 启动后端
python -m backend.main

# 终端2 - 启动前端开发服务器
cd frontend
npm run dev
```

后端运行在 `http://localhost:8000`，前端开发服务器默认 `http://localhost:5173`。

### 方式二：一键启动

双击 `启动平台.bat` 或 `start.bat`。

## 使用说明

1. **编辑代码** — 在左侧编辑器中编写 CadQuery 代码
2. **运行预览** — 点击"运行"或按 `Ctrl+Enter`，3D 预览自动更新
3. **查看终端** — 编辑器下方终端显示运行输出和错误
4. **AI 对话** — 在 3D 预览下方聊天窗口向 AI 提问
5. **应用代码** — AI 建议的代码可一键应用到编辑器
6. **保存模型** — 点击"保存"按钮保存当前模型
7. **导出模型** — 点击"导出"导出为 STL 或 STEP 格式

## 项目结构

```
.
├── backend/
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 路径与缓存配置
│   ├── models.py            # Pydantic 数据模型
│   ├── safety.py            # 代码安全验证（36 条规则）
│   ├── routes_execute.py    # 代码执行与导出（含受限沙箱）
│   ├── routes_models.py     # 模型 CRUD 路由
│   ├── routes_static.py     # 文档与示例路由
│   └── routes_ai.py         # AI 聊天路由（DeepSeek 流式）
├── frontend/
│   ├── index.html
│   ├── vite.config.js       # Vite + Vue + Tailwind + 代理配置
│   ├── package.json
│   └── src/
│       ├── main.js          # Vue 入口
│       ├── App.vue          # 主布局
│       ├── config.js        # 常量与模板
│       ├── style.css        # 全局样式
│       ├── components/
│       │   ├── CodeEditor.vue   # CodeMirror 6 编辑器
│       │   ├── Viewer3D.vue     # Three.js 3D 查看器
│       │   ├── Terminal.vue     # 终端输出面板
│       │   ├── AIChat.vue       # AI 聊天窗口
│       │   ├── Sidebar.vue      # 模型侧边栏
│       │   ├── Toolbar.vue      # 工具栏
│       │   ├── ModelModal.vue   # 新建模型对话框
│       │   ├── ExportModal.vue  # 导出对话框
│       │   ├── TemplatesModal.vue # 模板选择
│       │   └── ExamplesModal.vue  # 示例浏览
│       └── composables/
│           ├── useApi.js     # API 请求封装
│           ├── useCache.js   # 前端缓存
│           ├── useEditor.js  # 编辑器状态管理
│           └── useModels.js  # 模型 CRUD 逻辑
├── CadQueryExamples/         # CadQuery 官方示例源码
├── CadQuery文档/             # CadQuery 离线文档
├── data/                     # 模型数据存储（自动创建）
├── requirements.txt
└── README.md
```

## API 端点

### 代码执行
- `POST /api/execute` — 执行 CadQuery 代码，返回 STL 网格数据 + 输出
- `POST /api/export` — 导出 3D 模型（STL/STEP）

### AI 助手
- `POST /api/ai/chat` — AI 对话（SSE 流式响应）

### 模型管理
- `GET /api/models` — 获取所有模型列表
- `POST /api/models` — 创建新模型
- `PUT /api/models/{id}` — 更新模型
- `DELETE /api/models/{id}` — 删除模型
- `GET /api/models/{id}/code` — 获取模型代码

### 其他
- `GET /api/examples` — 获取示例列表
- `GET /docs.html` — CadQuery API 文档
- `GET /docs_data.json` — 文档数据

## 安全沙箱

代码在受限环境中执行：
- **白名单导入**：仅允许 `import cadquery` 和 `import math`
- **禁止操作**：os、sys、subprocess、open()、eval()、exec() 等 36 条规则
- **友好错误**：OpenCascade 几何错误自动附加中文解释和修复建议

## CadQuery 示例

```python
# 简单的长方体
result = cq.Workplane("XY").box(20, 20, 10)

# 带孔的方块
result = (
    cq.Workplane("XY")
    .box(30, 30, 15)
    .faces(">Z")
    .workplane()
    .hole(10)
)

# 带圆角的方块
result = (
    cq.Workplane("XY")
    .box(30, 30, 15)
    .edges()
    .fillet(3)
)
```

## Git 分支

| 分支 | 说明 |
|------|------|
| `master` | 初始版本 |
| `refactor/modular-split` | 模块化拆分 |
| `feature/vue3-vite` | Vue3 + Vite 迁移（当前开发分支） |

## 注意事项

- 确保后端服务已启动后再使用前端
- 模型数据保存在 `data/models` 目录中
- CadQuery 代码需要将结果赋值给 `result` 变量
- AI 助手需要配置 `DEEPSEEK_API_KEY` 环境变量
- 圆角/倒角半径不宜过大，否则会触发 `BRep_API: command not done` 错误

## License

MIT

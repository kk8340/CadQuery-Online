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

## AI 助手配置

AI 助手使用 DeepSeek API，需要配置 API Key。

### 获取 API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 在 API Keys 页面创建新的 API Key
4. 复制 Key 备用

### 配置方式

**Windows（永久配置，推荐）：**
```cmd
setx DEEPSEEK_API_KEY "your-deepseek-api-key-here"
```
配置后需要**重新打开命令行窗口**使环境变量生效。

**Windows（当前窗口生效）：**
```cmd
set DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

**Linux/Mac：**
```bash
export DEEPSEEK_API_KEY="your-deepseek-api-key-here"
```

### 验证配置

启动后端后，访问 http://localhost:8000/docs，找到 `/api/ai/chat` 接口测试。

### AI 功能说明

| 功能 | 说明 |
|------|------|
| 代码分析 | AI 可阅读当前编辑器代码，分析逻辑 |
| 错误诊断 | AI 读取运行错误，自动定位问题并给出修复建议 |
| 代码生成 | AI 根据需求生成 CadQuery 建模代码 |
| 代码应用 | AI 返回的代码可一键应用到编辑器，需用户确认 |
| 视角控制 | AI 可自动切换 3D 视角检查模型 |

### AI 代码格式

当 AI 返回可应用的代码时，使用以下格式：

````python
```python:edit
import cadquery as cq
result = cq.Workplane("XY").box(20, 20, 10)
```
````

AI 也可能返回视角控制命令，如 `[VIEW:iso]`、`[VIEW:top]` 等。

## 启动应用

### 环境要求

- Python 3.10+
- Node.js 18+
- DeepSeek API Key（AI 功能需要，可选）

### 依赖安装

```bash
# 安装后端依赖
pip install -r requirements.txt

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 启动方式

**方式一：一键启动（推荐）**

双击项目根目录下的 `启动平台.bat`，自动启动后端和前端。

**方式二：分别启动**

```bash
# 终端 1 - 启动后端服务（端口 8000）
python -m backend.main

# 终端 2 - 启动前端开发服务器（端口 5173）
cd frontend
npm run dev
```

**方式三：前端构建后部署**

```bash
# 构建生产版本
cd frontend
npm run build

# 使用任意静态服务器托管 dist 目录
# 后端仍需单独运行
python -m backend.main
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端应用 | http://localhost:5173 |
| 后端 API | http://localhost:8000 |
| API 文档 | http://localhost:8000/docs |
| CadQuery 文档 | http://localhost:8000/docs.html |

## 使用说明

### 界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo + 按钮（API文档/模板/示例/保存/导出）          │
├──────┬──────────────────────────────────────────────────────┤
│      │  Toolbar  │  代码编辑器 (CodeMirror 6)              │
│ 侧   ├──────────────────────────────────────────────────────┤
│ 边   │  终端输出（运行结果/错误信息/print输出）             │
│ 栏   ├──────────────────────────────────────────────────────┤
│      │  3D 预览区（Three.js STL 渲染）                    │
│      ├──────────────────────────────────────────────────────┤
│      │  AI 聊天窗口（DeepSeek 对话）                       │
└──────┴──────────────────────────────────────────────────────┘
```

### 基础操作

**1. 编写和运行代码**

- 在左侧编辑器中编写 CadQuery 代码
- 点击顶部"运行"按钮，或按 `Ctrl+Enter` 快捷键
- 3D 预览自动更新，终端显示运行结果

**2. 保存和加载模型**

- 点击"保存"保存当前代码到服务器
- 点击侧边栏中的模型名称切换模型
- 点击"+"新建模型，输入名称创建空白模型

**3. 导出模型**

- 点击"导出"按钮
- 选择格式（STL / STEP）
- 文件自动下载

**4. 使用模板和示例**

- 点击"模板"选择 CadQuery 代码模板
- 点击"示例"浏览官方示例代码
- 点击后将代码加载到编辑器

### AI 助手使用

**1. 提问和对话**

- 在 AI 聊天窗口底部输入框输入问题
- 按 `Ctrl+Enter` 或点击发送按钮
- AI 流式响应，支持多轮对话

**2. 代码分析和修复**

- 当代码运行出错时，将错误信息发给 AI
- AI 自动分析错误原因，给出修复建议
- AI 可能返回修复后的完整代码

**3. 应用 AI 代码**

- AI 返回代码时显示"代码修改建议"面板
- 点击"应用"弹出确认对话框
- 确认后代码自动替换编辑器内容

**4. 视角控制**

- AI 可能返回 `[VIEW:xxx]` 命令切换 3D 视角
- 支持：front / back / top / bottom / left / right / iso
- 自动从多个视角检查模型

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Enter` | 运行代码 |
| `Ctrl+S` | 保存模型 |

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

# CadQuery 在线建模平台

一个基于 Web 的 CadQuery 3D 建模平台，提供实时预览、模型管理和导出功能。

## 功能特性

- ✅ **代码编辑器**: 基于 CodeMirror 5，Python 语法高亮、括号匹配
- 🎨 **实时预览**: Three.js 渲染 3D 模型，支持旋转、缩放、平移
- 📦 **模型管理**: 创建、保存、删除、打开模型
- 📤 **导出功能**: 支持导出 STL 和 STEP 格式
- 🎯 **代码模板**: 内置常用 CadQuery 代码模板
- 📚 **示例浏览**: 按分类浏览 CadQuery 官方示例
- 🛠️ **工具栏**: 快捷插入 CadQuery 操作代码，可折叠分组
- 🔒 **代码安全**: 沙箱执行，禁止高风险操作
- ⚡ **前端缓存**: localStorage 缓存减少重复请求

## 技术栈

### 后端
- FastAPI: Web 框架
- CadQuery: 3D 建模引擎
- Uvicorn: ASGI 服务器
- Pydantic: 数据验证

### 前端
- HTML5 + ES Module JavaScript
- Tailwind CSS: 样式框架
- CodeMirror 5: 代码编辑器
- Three.js r128: 3D 渲染（STLLoader + OrbitControls）

## 安装步骤

1. 确保已安装 Python 3.10+

2. 安装 Python 依赖：
```bash
pip install -r requirements.txt
```

## 启动应用

在项目根目录下运行：

```bash
python -m backend.main
```

服务将在 `http://localhost:8000` 启动，浏览器访问即可使用。

## 使用说明

1. **创建模型**: 点击"新建模型"按钮
2. **编辑代码**: 在左侧编辑器中编写 CadQuery 代码
3. **运行预览**: 点击"运行"按钮或按 `Ctrl+Enter` 预览 3D 模型
4. **保存模型**: 点击"保存"按钮保存当前模型
5. **导出模型**: 点击"导出"按钮导出为 STL 或 STEP 格式
6. **使用模板**: 点击"模板"按钮使用预设代码模板
7. **浏览示例**: 点击"示例"按钮浏览和加载官方示例
8. **插入代码**: 点击工具栏按钮快速插入 CadQuery 操作

## 项目结构

```
.
├── backend/
│   ├── __init__.py
│   ├── main.py              # 应用入口，路由注册
│   ├── config.py            # 路径、安全模式、缓存配置
│   ├── models.py            # Pydantic 数据模型
│   ├── safety.py            # 代码安全验证
│   ├── routes_models.py     # 模型 CRUD 路由
│   ├── routes_execute.py    # 代码执行与导出路由
│   └── routes_static.py     # 静态文件与示例路由
├── frontend/
│   ├── index.html           # 前端页面
│   ├── app.js               # 旧版单文件（已弃用）
│   └── js/                  # 模块化前端代码
│       ├── app.js           # 主入口，初始化与事件绑定
│       ├── config.js        # 常量配置（API、缓存、模板）
│       ├── state.js         # 共享状态对象
│       ├── cache.js         # 前端缓存工具
│       ├── tooltip.js       # 全局工具提示
│       ├── toolbar.js       # 工具栏折叠/展开
│       ├── editor.js        # CodeMirror 编辑器
│       ├── viewer.js        # Three.js 3D 查看器
│       ├── execute.js       # 代码执行
│       ├── models.js        # 模型 CRUD 操作
│       ├── examples.js      # 示例浏览器
│       ├── export.js        # 导出功能
│       └── ui.js            # UI 工具（模态框、状态栏、侧边栏）
├── data/                    # 模型数据存储目录（自动创建）
├── CadQueryExamples/        # CadQuery 官方示例源码
├── requirements.txt         # Python 依赖
└── README.md
```

## API 端点

### 代码执行
- `POST /api/execute` - 执行 CadQuery 代码，返回 STL 网格数据
- `POST /api/export` - 导出 3D 模型（STL/STEP）

### 模型管理
- `GET /api/models` - 获取所有模型列表
- `POST /api/models` - 创建新模型
- `PUT /api/models/{id}` - 更新模型
- `DELETE /api/models/{id}` - 删除模型
- `GET /api/models/{id}/code` - 获取模型代码

### 其他
- `GET /api/examples` - 获取示例列表
- `GET /docs_data.json` - CadQuery 文档数据

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

## 注意事项

- 确保后端服务已启动后再使用前端
- 模型数据保存在 `data/models` 目录中
- CadQuery 代码需要将结果赋值给 `result` 变量
- 前端使用 ES Module，需通过 HTTP 服务器访问（不能直接打开 HTML 文件）

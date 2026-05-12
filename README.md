# CadQuery 在线建模平台

一个基于 Web 的 CadQuery 3D 建模平台，提供实时预览、模型管理和导出功能。

## 功能特性

- ✅ **代码编辑器**: 基于 Monaco Editor，提供语法高亮
- 🎨 **实时预览**: Three.js 渲染 3D 模型，支持旋转、缩放
- 📦 **模型管理**: 创建、保存、删除、打开模型
- 📤 **导出功能**: 支持导出 STL 和 STEP 格式
- 🎯 **代码模板**: 内置常用 CadQuery 代码模板

## 技术栈

### 后端
- FastAPI: Web 框架
- CadQuery: 3D 建模引擎
- Uvicorn: ASGI 服务器

### 前端
- HTML5 + Vanilla JavaScript
- Tailwind CSS: 样式框架
- Monaco Editor: 代码编辑器
- Three.js: 3D 渲染

## 安装步骤

1. 确保已安装 Python 3.8+

2. 安装 Python 依赖：
```bash
pip install -r requirements.txt
```

## 启动应用

### 启动后端服务

在项目根目录下运行：

```bash
cd backend
python main.py
```

后端服务将在 `http://localhost:8000` 启动

### 打开前端

在浏览器中打开 `frontend/index.html` 文件，或使用一个简单的 HTTP 服务器：

```bash
cd frontend
python -m http.server 3000
```

然后访问 `http://localhost:3000`

## 使用说明

1. **创建模型**: 点击"新建模型"按钮
2. **编辑代码**: 在左侧编辑器中编写 CadQuery 代码
3. **运行预览**: 点击"运行"按钮或按 `Ctrl+Enter` 预览 3D 模型
4. **保存模型**: 点击"保存"按钮保存当前模型
5. **导出模型**: 点击"导出"按钮导出为 STL 或 STEP 格式
6. **使用模板**: 点击"模板"按钮使用预设代码模板

## 项目结构

```
.
├── backend/
│   └── main.py              # FastAPI 后端服务
├── frontend/
│   ├── index.html           # 前端页面
│   └── app.js              # 前端逻辑
├── data/                   # 模型数据存储目录（自动创建）
├── requirements.txt        # Python 依赖
└── README.md             # 项目说明
```

## API 端点

- `POST /api/execute` - 执行 CadQuery 代码
- `POST /api/export` - 导出 3D 模型
- `GET /api/models` - 获取所有模型
- `POST /api/models` - 创建新模型
- `PUT /api/models/{id}` - 更新模型
- `DELETE /api/models/{id}` - 删除模型
- `GET /api/models/{id}/code` - 获取模型代码

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

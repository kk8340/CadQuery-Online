import os
import sys
import uuid
import json
import base64
import tempfile
import re
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator

try:
    import cadquery as cq
except ImportError:
    print("警告: CadQuery 未安装，部分功能将不可用", file=sys.stderr)
    cq = None

app = FastAPI(title="CadQuery Online", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path("data") / "models"
DATA_DIR.mkdir(parents=True, exist_ok=True)

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
DOCS_FILE = Path(__file__).parent.parent / "docs.html"
DOCS_DATA_FILE = Path(__file__).parent.parent / "docs_data.json"
MONACO_DIR = Path(__file__).parent.parent / "frontend" / "monaco-editor"
EXAMPLES_FILE = Path(__file__).parent.parent / "examples_templates.json"

# 安全白名单 - 禁止的模式（仅禁止用户代码显式调用）
# 注意：CadQuery内部可能使用__import__等，但这些在我们的沙箱命名空间中不会被拦截
DANGEROUS_PATTERNS = [
    r'__import__\s*\(',  # 显式调用 __import__(...)
    r'eval\s*\(',
    r'exec\s*\(',
    r'open\s*\(',
    r'os\.',
    r'sys\.',
    r'subprocess',
    r'importlib',
    r'__file__',
    r'__builtins__',
    r'globals\s*\(',
    r'locals\s*\(',
    r'getattr\s*\(',
    r'setattr\s*\(',
    r'delattr\s*\(',
    r'pickle',
    r'shutil',
]

# 缓存存储 - 以空间换时间
_models_cache: Dict[str, Dict] = {}
_models_list_cache: Optional[List[Dict]] = None
_cache_timestamp: float = 0
_CACHE_TTL = 2.0  # 2秒缓存，平衡性能和一致性

# 静态资源缓存
_examples_cache: Optional[Dict] = None
_docs_data_cache: Optional[Dict] = None


class ExecuteRequest(BaseModel):
    code: str


class ExecuteResponse(BaseModel):
    success: bool
    meshData: Optional[str] = None
    error: Optional[str] = None


class ExportRequest(BaseModel):
    code: str
    format: str


class ExportResponse(BaseModel):
    success: bool
    fileData: Optional[str] = None
    filename: Optional[str] = None
    error: Optional[str] = None


class ModelMetadata(BaseModel):
    id: str
    name: str
    createdAt: str
    updatedAt: str


class ModelCreate(BaseModel):
    name: str
    code: str


class ModelUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None


def validate_code_safety(code: str) -> tuple[bool, str]:
    """验证代码安全性 - 对于本地项目采用更宽松的策略
    
    由于这是本地运行的CadQuery建模平台，主要用于学习和个人使用，
    我们采用更宽松的安全策略，允许正常的Python操作，
    只明确禁止最危险的操作。
    """
    # 只明确禁止最危险的几个操作
    high_risk_patterns = [
        r'eval\s*\(',
        r'exec\s*\(',
        r'__import__\s*\(',
        r'os\.system',
        r'os\.popen',
        r'subprocess',
    ]
    
    for pattern in high_risk_patterns:
        if re.search(pattern, code):
            return False, f"代码包含高风险操作: {pattern}"
    
    # 对于本地使用，允许其他操作
    return True, ""

def invalidate_cache():
    """使缓存失效"""
    global _cache_timestamp, _models_list_cache
    _models_list_cache = None
    _cache_timestamp = 0

def load_models() -> List[ModelMetadata]:
    """加载模型列表（带缓存）"""
    global _cache_timestamp, _models_list_cache
    
    current_time = time.time()
    
    # 检查缓存是否有效
    if _models_list_cache is not None and (current_time - _cache_timestamp) < _CACHE_TTL:
        return [ModelMetadata(**m) for m in _models_list_cache]
    
    models = []
    if not DATA_DIR.exists():
        return models
    
    for model_dir in DATA_DIR.iterdir():
        if model_dir.is_dir():
            metadata_file = model_dir / "metadata.json"
            if metadata_file.exists():
                try:
                    with open(metadata_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        models.append(ModelMetadata(**data))
                except Exception:
                    pass
    
    sorted_models = sorted(models, key=lambda x: x.updatedAt, reverse=True)
    
    # 更新缓存
    _models_list_cache = [m.model_dump() for m in sorted_models]
    _cache_timestamp = current_time
    
    return sorted_models


@app.get("/api/models", response_model=List[ModelMetadata])
async def get_models():
    return load_models()


@app.post("/api/models", response_model=ModelMetadata)
async def create_model(data: ModelCreate):
    model_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    model_dir = DATA_DIR / model_id
    model_dir.mkdir(parents=True, exist_ok=True)
    
    metadata = ModelMetadata(
        id=model_id,
        name=data.name,
        createdAt=now,
        updatedAt=now
    )
    
    with open(model_dir / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata.model_dump(), f)
    
    with open(model_dir / "code.py", "w", encoding="utf-8") as f:
        f.write(data.code)
    
    invalidate_cache()
    return metadata


@app.put("/api/models/{model_id}", response_model=ModelMetadata)
async def update_model(model_id: str, data: ModelUpdate):
    # 路径安全检查
    if '..' in model_id or '/' in model_id or '\\' in model_id:
        raise HTTPException(status_code=400, detail="Invalid model ID")
    
    model_dir = DATA_DIR / model_id
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    
    metadata_file = model_dir / "metadata.json"
    with open(metadata_file, "r", encoding="utf-8") as f:
        metadata_data = json.load(f)
    
    if data.name:
        metadata_data["name"] = data.name
    metadata_data["updatedAt"] = datetime.utcnow().isoformat()
    
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata_data, f)
    
    if data.code:
        with open(model_dir / "code.py", "w", encoding="utf-8") as f:
            f.write(data.code)
    
    invalidate_cache()
    return ModelMetadata(**metadata_data)


@app.get("/api/models/{model_id}/code")
async def get_model_code(model_id: str):
    # 路径安全检查
    if '..' in model_id or '/' in model_id or '\\' in model_id:
        raise HTTPException(status_code=400, detail="Invalid model ID")
    
    model_dir = DATA_DIR / model_id
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    
    code_file = model_dir / "code.py"
    if not code_file.exists():
        return {"code": ""}
    
    with open(code_file, "r", encoding="utf-8") as f:
        return {"code": f.read()}


@app.delete("/api/models/{model_id}")
async def delete_model(model_id: str):
    import shutil
    
    # 路径安全检查
    if '..' in model_id or '/' in model_id or '\\' in model_id:
        raise HTTPException(status_code=400, detail="Invalid model ID")
    
    model_dir = DATA_DIR / model_id
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    
    shutil.rmtree(model_dir)
    invalidate_cache()
    return {"success": True}


def execute_and_extract_result(code: str):
    """执行代码并提取结果对象（共享逻辑）
    
    对于本地项目，使用更宽松的执行环境，
    让 CadQuery 可以正常工作。
    """
    if cq is None:
        return None, "CadQuery 引擎未安装，请检查后端依赖"
    
    # 安全检查
    is_safe, error_msg = validate_code_safety(code)
    if not is_safe:
        return None, error_msg
    
    try:
        # 使用更完整的命名空间，让 CadQuery 可以正常工作
        namespace = {
            'cq': cq,
            'cadquery': cq,
        }
        
        exec(code, namespace)
        
        result_obj = None
        if "result" in namespace:
            result_obj = namespace["result"]
        elif "show_object" in namespace:
            result_obj = namespace["show_object"]
        else:
            for key, value in namespace.items():
                if hasattr(value, 'val') or hasattr(value, 'faces'):
                    result_obj = value
                    break
        
        if result_obj is None:
            return None, "未找到可显示的模型，请确保代码定义了 'result' 变量"
        
        return result_obj, None
    
    except Exception as e:
        return None, str(e)


@app.post("/api/execute", response_model=ExecuteResponse)
async def execute_code(request: ExecuteRequest):
    result_obj, error_msg = execute_and_extract_result(request.code)
    
    if error_msg:
        return ExecuteResponse(success=False, error=error_msg)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as tmp:
            tmp_path = tmp.name
        
        try:
            cq.exporters.export(result_obj, tmp_path, exportType='STL')
            
            with open(tmp_path, 'rb') as f:
                stl_data = f.read()
            
            mesh_data = base64.b64encode(stl_data).decode('utf-8')
            
            return ExecuteResponse(success=True, meshData=mesh_data)
        finally:
            os.unlink(tmp_path)
    
    except Exception as e:
        return ExecuteResponse(success=False, error=str(e))


@app.post("/api/export", response_model=ExportResponse)
async def export_model(request: ExportRequest):
    result_obj, error_msg = execute_and_extract_result(request.code)
    
    if error_msg:
        return ExportResponse(success=False, error=error_msg)
    
    format_lower = request.format.lower()
    if format_lower not in ['stl', 'step']:
        return ExportResponse(success=False, error="不支持的格式，请使用 STL 或 STEP")
    
    try:
        export_type = 'STL' if format_lower == 'stl' else 'STEP'
        filename = f"model.{format_lower}"
        
        with tempfile.NamedTemporaryFile(suffix=f'.{format_lower}', delete=False) as tmp:
            tmp_path = tmp.name
        
        try:
            cq.exporters.export(result_obj, tmp_path, exportType=export_type)
            
            with open(tmp_path, 'rb') as f:
                file_data = f.read()
            
            file_data_b64 = base64.b64encode(file_data).decode('utf-8')
            
            return ExportResponse(
                success=True,
                fileData=file_data_b64,
                filename=filename
            )
        finally:
            os.unlink(tmp_path)
    
    except Exception as e:
        return ExportResponse(success=False, error=str(e))


@app.get("/")
async def root():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/app.js")
async def serve_js():
    return FileResponse(FRONTEND_DIR / "app.js")

@app.get("/docs.html")
async def serve_docs():
    return FileResponse(DOCS_FILE)

@app.get("/docs_data.json")
async def serve_docs_data():
    global _docs_data_cache
    
    # 使用缓存 - 以空间换时间
    if _docs_data_cache is None:
        if DOCS_DATA_FILE.exists():
            with open(DOCS_DATA_FILE, 'r', encoding='utf-8') as f:
                _docs_data_cache = json.load(f)
        else:
            _docs_data_cache = {}
    
    return _docs_data_cache

@app.get("/monaco-editor/{path:path}")
async def serve_monaco(path: str):
    file_path = MONACO_DIR / path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@app.get("/api/examples")
async def get_examples():
    global _examples_cache
    
    # 使用缓存 - 以空间换时间
    if _examples_cache is None:
        if not EXAMPLES_FILE.exists():
            _examples_cache = {"examples": [], "categories": []}
        else:
            with open(EXAMPLES_FILE, 'r', encoding='utf-8') as f:
                _examples_cache = json.load(f)
    
    return _examples_cache

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

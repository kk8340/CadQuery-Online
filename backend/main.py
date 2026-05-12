import os
import sys
import uuid
import json
import base64
import tempfile
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

try:
    import cadquery as cq
except ImportError:
    print("警告: CadQuery 未安装，部分功能将不可用", file=sys.stderr)
    cq = None

app = FastAPI(title="CadQuery Online", version="1.0.0")

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


def load_models() -> List[ModelMetadata]:
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
    return sorted(models, key=lambda x: x.updatedAt, reverse=True)


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
    
    return metadata


@app.put("/api/models/{model_id}", response_model=ModelMetadata)
async def update_model(model_id: str, data: ModelUpdate):
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
    
    return ModelMetadata(**metadata_data)


@app.get("/api/models/{model_id}/code")
async def get_model_code(model_id: str):
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
    model_dir = DATA_DIR / model_id
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    
    shutil.rmtree(model_dir)
    return {"success": True}


@app.post("/api/execute", response_model=ExecuteResponse)
async def execute_code(request: ExecuteRequest):
    if cq is None:
        return ExecuteResponse(
            success=False,
            error="CadQuery 引擎未安装，请检查后端依赖"
        )
    
    try:
        namespace = {"cq": cq}
        exec(request.code, namespace)
        
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
            return ExecuteResponse(
                success=False,
                error="未找到可显示的模型，请确保代码定义了 'result' 变量或使用 show_object()"
            )
        
        with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as tmp:
            tmp_path = tmp.name
        
        try:
            cq.exporters.export(result_obj, tmp_path, exportType='STL')
            
            with open(tmp_path, 'rb') as f:
                stl_data = f.read()
            
            mesh_data = base64.b64encode(stl_data).decode('utf-8')
            
            return ExecuteResponse(
                success=True,
                meshData=mesh_data
            )
        finally:
            os.unlink(tmp_path)
    
    except Exception as e:
        return ExecuteResponse(
            success=False,
            error=str(e)
        )


@app.post("/api/export", response_model=ExportResponse)
async def export_model(request: ExportRequest):
    if cq is None:
        return ExportResponse(
            success=False,
            error="CadQuery 引擎未安装，请检查后端依赖"
        )
    
    try:
        namespace = {"cq": cq}
        exec(request.code, namespace)
        
        result_obj = None
        if "result" in namespace:
            result_obj = namespace["result"]
        else:
            for key, value in namespace.items():
                if hasattr(value, 'val') or hasattr(value, 'faces'):
                    result_obj = value
                    break
        
        if result_obj is None:
            return ExportResponse(
                success=False,
                error="未找到可导出的模型"
            )
        
        format_lower = request.format.lower()
        if format_lower not in ['stl', 'step']:
            return ExportResponse(
                success=False,
                error="不支持的格式，请使用 STL 或 STEP"
            )
        
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
        return ExportResponse(
            success=False,
            error=str(e)
        )


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
    return FileResponse(DOCS_DATA_FILE)

@app.get("/monaco-editor/{path:path}")
async def serve_monaco(path: str):
    file_path = MONACO_DIR / path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@app.get("/api/examples")
async def get_examples():
    if not EXAMPLES_FILE.exists():
        return {"examples": [], "categories": []}
    with open(EXAMPLES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

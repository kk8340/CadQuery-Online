import json
import time
from datetime import datetime
from typing import List, Optional, Dict

from fastapi import APIRouter, HTTPException

from backend.config import DATA_DIR, CACHE_TTL
from backend.models import ModelMetadata, ModelCreate, ModelUpdate

router = APIRouter(prefix="/api/models", tags=["models"])

_models_cache: Dict[str, Dict] = {}
_models_list_cache: Optional[List[Dict]] = None
_cache_timestamp: float = 0


def invalidate_cache():
    global _cache_timestamp, _models_list_cache
    _models_list_cache = None
    _cache_timestamp = 0


def load_models() -> List[ModelMetadata]:
    global _cache_timestamp, _models_list_cache

    current_time = time.time()

    if _models_list_cache is not None and (current_time - _cache_timestamp) < CACHE_TTL:
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

    _models_list_cache = [m.model_dump() for m in sorted_models]
    _cache_timestamp = current_time

    return sorted_models


@router.get("", response_model=List[ModelMetadata])
async def get_models():
    return load_models()


@router.post("", response_model=ModelMetadata)
async def create_model(data: ModelCreate):
    import uuid

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


@router.put("/{model_id}", response_model=ModelMetadata)
async def update_model(model_id: str, data: ModelUpdate):
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


@router.get("/{model_id}/code")
async def get_model_code(model_id: str):
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


@router.delete("/{model_id}")
async def delete_model(model_id: str):
    import shutil

    if '..' in model_id or '/' in model_id or '\\' in model_id:
        raise HTTPException(status_code=400, detail="Invalid model ID")

    model_dir = DATA_DIR / model_id
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail="Model not found")

    shutil.rmtree(model_dir)
    invalidate_cache()
    return {"success": True}

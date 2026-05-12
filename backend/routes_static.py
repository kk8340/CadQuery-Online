import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.config import DOCS_FILE, DOCS_DATA_FILE, EXAMPLES_FILE

router = APIRouter(tags=["static"])

_examples_cache = None
_docs_data_cache = None


@router.get("/docs.html")
async def serve_docs():
    return FileResponse(DOCS_FILE)


@router.get("/docs_data.json")
async def serve_docs_data():
    global _docs_data_cache

    if _docs_data_cache is None:
        if DOCS_DATA_FILE.exists():
            with open(DOCS_DATA_FILE, 'r', encoding='utf-8') as f:
                _docs_data_cache = json.load(f)
        else:
            _docs_data_cache = {}

    return _docs_data_cache


@router.get("/api/examples")
async def get_examples():
    global _examples_cache

    if _examples_cache is None:
        if not EXAMPLES_FILE.exists():
            _examples_cache = {"examples": [], "categories": []}
        else:
            with open(EXAMPLES_FILE, 'r', encoding='utf-8') as f:
                _examples_cache = json.load(f)

    return _examples_cache

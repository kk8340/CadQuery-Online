from typing import List, Optional
from pydantic import BaseModel


class ExecuteRequest(BaseModel):
    code: str


class ExecuteResponse(BaseModel):
    success: bool
    meshData: Optional[str] = None
    error: Optional[str] = None
    output: Optional[str] = None


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


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    code: str = ""
    output: str = ""
    error: str = ""

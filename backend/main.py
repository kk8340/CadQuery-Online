from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes_models import router as models_router
from backend.routes_execute import router as execute_router
from backend.routes_static import router as static_router

app = FastAPI(title="CadQuery Online", version="1.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models_router)
app.include_router(execute_router)
app.include_router(static_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

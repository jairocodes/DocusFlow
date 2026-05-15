from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.storage import ensure_bucket_exists
from app.api import auth, users, documents, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_bucket_exists()
    yield


app = FastAPI(
    title="DocusFlow API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(documents.router, prefix=API_PREFIX)
app.include_router(stats.router, prefix=API_PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}

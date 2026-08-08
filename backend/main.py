from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from api.routes import router

app = FastAPI(
    title="RAG API",
    description="Agentic Self-RAG platform with real-time execution visualization",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Welcome to Agentic Self-RAG API",
        "docs_url": "/docs",
        "health_check": "/health",
        "status": "online",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}

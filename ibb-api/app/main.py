import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.services.registry import ModelRegistry

from app.api import health
from app.api import sentiment
from app.api import toxicity
from app.api import summary
from app.api import keywords
from app.api import sources
from app.api import misinformation
from app.api import semantic_search
from app.api import recommendations
from app.api import chat
from app.api import analyze

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting IBB AI service...")
    try:
        registry = ModelRegistry()
        registry.initialize()
        logger.info("AI service ready")
    except Exception as e:
        logger.error(f"Failed to initialize models: {e}")
    yield
    logger.info("Shutting down AI service")

app = FastAPI(
    title="IBB AI Service",
    description="Internet Black Box — AI analysis microservice",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": str(exc)})

# Register all routers
app.include_router(health.router,          tags=["health"])
app.include_router(sentiment.router,       tags=["analysis"])
app.include_router(toxicity.router,        tags=["analysis"])
app.include_router(summary.router,         tags=["analysis"])
app.include_router(keywords.router,        tags=["analysis"])
app.include_router(sources.router,         tags=["research"])
app.include_router(misinformation.router,  tags=["analysis"])
app.include_router(semantic_search.router, tags=["search"])
app.include_router(recommendations.router, tags=["research"])
app.include_router(chat.router,            tags=["ai"])
app.include_router(analyze.router,         tags=["ai"])

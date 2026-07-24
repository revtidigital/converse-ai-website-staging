from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.assistant import router as assistant_router
from app.api.dependencies import vector_store_dependency
from app.api.health import router as health_router
from app.api.knowledge_admin import router as knowledge_admin_router
from app.api.voice import router as voice_router
from app.config import get_settings
from app.core.logging import configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    store = vector_store_dependency()
    close = getattr(store, "close", None)
    if close is not None:
        await close()


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.assistant_log_level)
    app = FastAPI(title="Converse Assistant Service", version="0.1.0", docs_url=None if settings.assistant_environment == "production" else "/docs", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Authorization"],
    )
    app.include_router(health_router)
    app.include_router(assistant_router)
    app.include_router(voice_router)
    app.include_router(knowledge_admin_router)
    return app


app = create_app()

import asyncio

from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies import (
    embedding_client_dependency,
    knowledge_settings_dependency,
    llm_client_dependency,
    settings_dependency,
    vector_store_dependency,
)
from app.config import Settings
from app.models.llm import LLMMessage
from app.models.responses import HealthResponse, ReadinessResponse
from app.services.knowledge.config import KnowledgeSettings
from app.services.knowledge.embedding_base import EmbeddingClient
from app.services.knowledge.qdrant_store import VectorStore
from app.services.llm.base import LLMClient

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service="converse-assistant", version="0.1.0")


@router.get("/health/ready", response_model=ReadinessResponse)
async def ready(
    response: Response,
    llm_client: LLMClient = Depends(llm_client_dependency),
    settings: Settings = Depends(settings_dependency),
    knowledge_settings: KnowledgeSettings = Depends(knowledge_settings_dependency),
    embedding_client: EmbeddingClient = Depends(embedding_client_dependency),
    vector_store: VectorStore = Depends(vector_store_dependency),
) -> ReadinessResponse:
    dependencies: dict[str, str] = {}
    ready_status = True
    try:
        async with asyncio.timeout(min(3.0, settings.llm_request_timeout_seconds)):
            await llm_client.generate([LLMMessage(role="user", content="Reply with ok.")])
        dependencies["llm"] = "available"
    except Exception:
        dependencies["llm"] = "unavailable"
        ready_status = False

    if not knowledge_settings.knowledge_enabled:
        dependencies["qdrant"] = "disabled"
        dependencies["embedding"] = "disabled"
    else:
        try:
            await vector_store.ensure_collection()
            dependencies["qdrant"] = "available"
        except Exception:
            dependencies["qdrant"] = "unavailable"
            ready_status = False
        try:
            await embedding_client.embed_query("readiness")
            dependencies["embedding"] = "available"
        except Exception:
            dependencies["embedding"] = "unavailable"
            ready_status = False

    if not ready_status:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return ReadinessResponse(status="not_ready", dependencies=dependencies)
    return ReadinessResponse(status="ready", dependencies=dependencies)

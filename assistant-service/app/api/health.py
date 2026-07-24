import asyncio

from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies import llm_client_dependency, settings_dependency
from app.config import Settings
from app.models.llm import LLMMessage
from app.models.responses import HealthResponse, ReadinessResponse
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
) -> ReadinessResponse:
    try:
        async with asyncio.timeout(min(3.0, settings.llm_request_timeout_seconds)):
            await llm_client.generate([LLMMessage(role="user", content="Reply with ok.")])
        return ReadinessResponse(status="ready", dependencies={"llm": "available"})
    except Exception:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return ReadinessResponse(status="not_ready", dependencies={"llm": "unavailable"})

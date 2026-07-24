import asyncio
import json
import secrets
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import StreamingResponse
from pydantic import ValidationError

from app.api.dependencies import (
    concurrency_limiter_dependency,
    history_provider_dependency,
    llm_client_dependency,
    page_context_provider_dependency,
    rate_limiter_dependency,
    retrieval_provider_dependency,
    settings_dependency,
    tool_provider_dependency,
)
from app.config import Settings
from app.core.cancellation import watch_disconnect
from app.core.concurrency import ConcurrencyLimiter
from app.core.rate_limit import InMemoryRateLimiter
from app.core.request_context import client_identity
from app.models.requests import AssistantTurnRequest
from app.services.extensions.history import HistoryProvider
from app.services.extensions.page_context import PageContextProvider
from app.services.extensions.retrieval import RetrievalProvider
from app.services.extensions.tools import ToolProvider
from app.services.llm.base import LLMClient
from app.services.orchestrator.assistant_orchestrator import process_assistant_turn

router = APIRouter(prefix="/v1/assistant")


def _sse(data: dict[str, object]) -> str:
    return f"data: {json.dumps(data, separators=(',', ':'))}\n\n"


@router.post("/stream")
async def stream_assistant(
    request: Request,
    settings: Settings = Depends(settings_dependency),
    llm_client: LLMClient = Depends(llm_client_dependency),
    retrieval_provider: RetrievalProvider = Depends(retrieval_provider_dependency),
    history_provider: HistoryProvider = Depends(history_provider_dependency),
    tool_provider: ToolProvider = Depends(tool_provider_dependency),
    page_context_provider: PageContextProvider = Depends(page_context_provider_dependency),
    rate_limiter: InMemoryRateLimiter = Depends(rate_limiter_dependency),
    concurrency_limiter: ConcurrencyLimiter = Depends(concurrency_limiter_dependency),
) -> Response:
    try:
        body = await request.json()
        turn = AssistantTurnRequest.model_validate(
            body,
            context={
                "max_message_length": settings.max_message_length,
                "max_context_length": settings.max_context_length,
                "max_memory_length": settings.max_memory_length,
            },
        )
    except (ValidationError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid request",
        ) from exc
    allowed, retry_after = rate_limiter.allow(client_identity(request))
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many requests", headers={"Retry-After": str(retry_after)})
    permit = await concurrency_limiter.acquire()
    if permit is None:
        raise HTTPException(status_code=503, detail="Assistant capacity unavailable")
    request_id = secrets.token_urlsafe(24)
    cancellation_event = asyncio.Event()

    async def events() -> AsyncIterator[str]:
        disconnect_task = asyncio.create_task(watch_disconnect(request, cancellation_event))
        try:
            async with asyncio.timeout(settings.llm_request_timeout_seconds):
                async for event in process_assistant_turn(
                    turn,
                    llm_client=llm_client,
                    retrieval_provider=retrieval_provider,
                    history_provider=history_provider,
                    tool_provider=tool_provider,
                    page_context_provider=page_context_provider,
                    cancellation_event=cancellation_event,
                    request_id=request_id,
                ):
                    if cancellation_event.is_set():
                        return
                    yield _sse(event.model_dump())
        except TimeoutError:
            cancellation_event.set()
            yield _sse(
                {
                    "type": "response.error",
                    "requestId": request_id,
                    "conversationId": turn.conversationId,
                    "error": {
                        "code": "LLM_TIMEOUT",
                        "message": "The assistant request timed out.",
                        "retryable": True,
                    },
                }
            )
        finally:
            cancellation_event.set()
            disconnect_task.cancel()
            permit.release()

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )

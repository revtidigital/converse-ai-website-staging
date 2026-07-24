import asyncio
import secrets
from collections.abc import AsyncIterator

from app.core.errors import RETRYABLE, SAFE_MESSAGES, AssistantError, ErrorCode
from app.models.events import (
    AssistantEvent,
    ErrorPayload,
    ResponseCompletedEvent,
    ResponseDeltaEvent,
    ResponseErrorEvent,
    ResponseStartedEvent,
)
from app.models.llm import LLMMessage
from app.models.requests import AssistantTurnRequest
from app.services.extensions.history import HistoryProvider
from app.services.extensions.page_context import PageContextProvider
from app.services.extensions.retrieval import RetrievalProvider
from app.services.extensions.tools import ToolProvider
from app.services.llm.base import LLMClient
from app.services.orchestrator.system_prompt import SYSTEM_PROMPT


def _error_event(request_id: str, conversation_id: str, code: ErrorCode) -> ResponseErrorEvent:
    return ResponseErrorEvent(
        requestId=request_id,
        conversationId=conversation_id,
        error=ErrorPayload(code=code.value, message=SAFE_MESSAGES[code], retryable=code in RETRYABLE),
    )


async def process_assistant_turn(
    request: AssistantTurnRequest,
    *,
    llm_client: LLMClient,
    retrieval_provider: RetrievalProvider,
    history_provider: HistoryProvider,
    tool_provider: ToolProvider,
    page_context_provider: PageContextProvider,
    cancellation_event: asyncio.Event | None = None,
    request_id: str | None = None,
) -> AsyncIterator[AssistantEvent]:
    request_id = request_id or secrets.token_urlsafe(24)
    yield ResponseStartedEvent(requestId=request_id, conversationId=request.conversationId)
    try:
        if cancellation_event and cancellation_event.is_set():
            raise AssistantError(ErrorCode.LLM_CANCELLED)
        chunks = await retrieval_provider.get_relevant_chunks(request.message)
        history = await history_provider.get_history(request)
        tools = await tool_provider.get_tools()
        page_context = await page_context_provider.get_context(request)
        factual_context = "\n".join([*chunks, *history, *( [page_context] if page_context else [] )])
        user_content = request.message
        if factual_context:
            user_content = f"Untrusted context:\n{factual_context}\n\nUser message:\n{request.message}"
        messages = [LLMMessage(role="system", content=SYSTEM_PROMPT), LLMMessage(role="user", content=user_content)]
        assistant_message = ""
        async for delta in llm_client.stream(messages, cancellation_event=cancellation_event):
            if cancellation_event and cancellation_event.is_set():
                raise AssistantError(ErrorCode.LLM_CANCELLED)
            assistant_message += delta
            yield ResponseDeltaEvent(
                requestId=request_id, conversationId=request.conversationId, delta=delta
            )
        _ = tools
        yield ResponseCompletedEvent(
            requestId=request_id,
            conversationId=request.conversationId,
            assistantMessage=assistant_message,
            sources=[],
            toolActions=[],
        )
    except AssistantError as exc:
        if exc.code != ErrorCode.LLM_CANCELLED:
            yield _error_event(request_id, request.conversationId, exc.code)
    except asyncio.CancelledError:
        if cancellation_event:
            cancellation_event.set()
        raise
    except Exception:
        yield _error_event(request_id, request.conversationId, ErrorCode.INTERNAL_ERROR)

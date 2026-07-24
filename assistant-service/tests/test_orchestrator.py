import asyncio

from app.models.requests import AssistantTurnRequest
from app.services.extensions.history import NoopHistoryProvider
from app.services.extensions.page_context import NoopPageContextProvider
from app.services.extensions.retrieval import NoopRetrievalProvider
from app.services.extensions.tools import NoopToolProvider
from app.services.orchestrator.assistant_orchestrator import process_assistant_turn
from tests.conftest import FakeLLM


async def collect(mode="text", fake=None, cancel=None):
    req = AssistantTurnRequest(conversationId="c", message="hello", inputMode=mode)
    return [e async for e in process_assistant_turn(req, llm_client=fake or FakeLLM(["a","b"]), retrieval_provider=NoopRetrievalProvider(), history_provider=NoopHistoryProvider(), tool_provider=NoopToolProvider(), page_context_provider=NoopPageContextProvider(), cancellation_event=cancel, request_id="r")]


async def test_text_and_voice_same_function_and_ordered_success() -> None:
    text = await collect("text")
    voice = await collect("voice")
    assert [e.type for e in text] == ["response.started","response.delta","response.delta","response.completed"]
    assert [e.type for e in voice] == [e.type for e in text]
    assert text[-1].sources == [] and text[-1].toolActions == []
    assert text[-1].assistantMessage == "ab"


async def test_error_once_and_no_completed_after_error() -> None:
    from app.core.errors import AssistantError, ErrorCode
    events = await collect(fake=FakeLLM(fail=AssistantError(ErrorCode.LLM_UNAVAILABLE)))
    assert [e.type for e in events] == ["response.started", "response.error"]


async def test_cancellation_stops_generation() -> None:
    event = asyncio.Event()
    event.set()
    events = await collect(cancel=event)
    assert [e.type for e in events] == ["response.started"]

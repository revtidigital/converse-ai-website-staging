from datetime import UTC, datetime

from app.models.requests import AssistantTurnRequest
from app.services.extensions.history import NoopHistoryProvider
from app.services.extensions.page_context import NoopPageContextProvider
from app.services.extensions.tools import NoopToolProvider
from app.services.knowledge.models import (
    ContentType,
    KnowledgeChunk,
    RetrievalResult,
    SourceMetadata,
)
from app.services.orchestrator.assistant_orchestrator import process_assistant_turn
from tests.conftest import FakeLLM


class FakeRetrieval:
    async def get_relevant_chunks(self, query: str) -> list[str]:
        return ["verified"]
    async def retrieve(self, query: str, *, current_route: str = "/") -> RetrievalResult:
        chunk = KnowledgeChunk(chunk_id="c", source_id="s", route="/services", canonical_url="https://x.test/services", page_title="Services", heading="H", content="Verified Converse service fact.", content_type=ContentType.SERVICE, chunk_index=0, updated_at=datetime.now(UTC), checksum="c", index_version="1")
        source = SourceMetadata(title="Services", route="/services", canonicalUrl="https://x.test/services", heading="H", snippet="Verified Converse service fact.", contentType="service")
        return RetrievalResult(context_chunks=[chunk], sources=[source])


async def test_text_and_voice_use_same_retrieval_sources() -> None:
    async def collect(mode: str):
        return [e async for e in process_assistant_turn(AssistantTurnRequest(conversationId="c", message="website fact?", inputMode=mode), llm_client=FakeLLM(["ok"]), retrieval_provider=FakeRetrieval(), history_provider=NoopHistoryProvider(), tool_provider=NoopToolProvider(), page_context_provider=NoopPageContextProvider(), request_id="r")]
    text = await collect("text")
    voice = await collect("voice")
    assert text[-1].sources == voice[-1].sources
    assert text[-1].sources[0]["route"] == "/services"

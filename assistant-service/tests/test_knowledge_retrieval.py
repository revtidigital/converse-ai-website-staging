from datetime import UTC, datetime

from app.services.knowledge.config import KnowledgeSettings
from app.services.knowledge.embedding_local import DeterministicLocalEmbeddingClient
from app.services.knowledge.models import ContentType, KnowledgeChunk
from app.services.knowledge.qdrant_store import InMemoryQdrantStore
from app.services.knowledge.retrieval_provider import QdrantRetrievalProvider


def chunk(id, route, content):
    return KnowledgeChunk(chunk_id=id, source_id=id, route=route, canonical_url=f"https://x.test{route}", page_title="T", heading="H", content=content, content_type=ContentType.SERVICE, chunk_index=0, updated_at=datetime.now(UTC), checksum=id, index_version="1")


async def test_retrieval_selects_sources_and_hinglish() -> None:
    e = DeterministicLocalEmbeddingClient(dimension=16)
    store = InMemoryQdrantStore(dimension=16)
    chunks = [chunk("a", "/services/ai-voice-agents", "AI voice agents support Hinglish conversations."), chunk("b", "/services", "General service content.")]
    await store.upsert_chunks(chunks, await e.embed_documents([c.content for c in chunks]))
    provider = QdrantRetrievalProvider(settings=KnowledgeSettings(RETRIEVAL_SCORE_THRESHOLD=0.0, EMBEDDING_VECTOR_DIMENSION=16, QDRANT_VECTOR_DIMENSION=16), embedding_client=e, vector_store=store)
    result = await provider.retrieve("Hinglish voice agent", current_route="/services/ai-voice-agents")
    assert result.context_chunks
    assert result.sources[0].route.startswith("/")

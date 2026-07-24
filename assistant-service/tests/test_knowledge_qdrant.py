from datetime import UTC, datetime

from app.services.knowledge.models import ContentType, KnowledgeChunk
from app.services.knowledge.qdrant_store import InMemoryQdrantStore


def chunk(id="c"):
    return KnowledgeChunk(chunk_id=id, source_id="s", route="/", canonical_url="https://x.test/", page_title="T", content="hello", content_type=ContentType.HOME, chunk_index=0, updated_at=datetime.now(UTC), checksum=id, index_version="1")


async def test_qdrant_upsert_search_delete() -> None:
    s = InMemoryQdrantStore(dimension=2)
    await s.upsert_chunks([chunk()], [[1, 0]])
    assert (await s.search([1, 0], limit=1))[0].chunk.chunk_id == "c"
    await s.delete_by_source_id("s")
    assert await s.search([1, 0], limit=1) == []

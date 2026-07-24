from datetime import UTC, datetime

from app.services.knowledge.deduplicator import deduplicate_chunks
from app.services.knowledge.models import ContentType, KnowledgeChunk


def test_duplicate_chunks_removed() -> None:
    c = KnowledgeChunk(chunk_id="1", source_id="s", route="/", canonical_url="https://x.test/", page_title="T", content="same", content_type=ContentType.HOME, chunk_index=0, updated_at=datetime.now(UTC), checksum="a", index_version="1")
    d = c.model_copy(update={"chunk_id":"2"})
    assert len(deduplicate_chunks([c, d])) == 1

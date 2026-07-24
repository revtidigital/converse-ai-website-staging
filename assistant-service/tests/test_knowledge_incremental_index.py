from pathlib import Path

from app.services.knowledge.chunker import HeadingAwareChunker
from app.services.knowledge.embedding_local import DeterministicLocalEmbeddingClient
from app.services.knowledge.index_coordinator import KnowledgeIndexCoordinator
from app.services.knowledge.index_manifest import JsonIndexManifestStore
from app.services.knowledge.models import ContentType, KnowledgeSource, SourceSection
from app.services.knowledge.qdrant_store import InMemoryQdrantStore


def source(text="This is a long enough source paragraph. It has facts about Converse services."):
    return KnowledgeSource(source_id="s", route="/services", canonical_url="https://x.test/services", page_title="Services", content_type=ContentType.SERVICE, checksum=text, sections=[SourceSection(heading="H", heading_level=2, heading_path=["H"], content=text)])


async def test_incremental_skips_unchanged(tmp_path: Path) -> None:
    c = KnowledgeIndexCoordinator(chunker=HeadingAwareChunker(max_characters=200, overlap_characters=10, max_chunks=10, index_version="1"), embedding_client=DeterministicLocalEmbeddingClient(dimension=8), vector_store=InMemoryQdrantStore(dimension=8), manifest=JsonIndexManifestStore(tmp_path / "m.json"), embedding_model="fake", embedding_dimension=8)
    first = await c.run([source()], mode="incremental")
    second = await c.run([source()], mode="incremental")
    assert first.indexed == 1 and second.unchanged == 1

from app.services.knowledge.chunker import HeadingAwareChunker
from app.services.knowledge.models import ContentType, KnowledgeSource, SourceSection


def test_chunking_is_stable_heading_aware() -> None:
    src = KnowledgeSource(source_id="s", route="/services", canonical_url="https://x.test/services", page_title="Services", content_type=ContentType.SERVICE, sections=[SourceSection(heading="H", heading_level=2, heading_path=["Services", "H"], content="Sentence one. Sentence two. Sentence three.")])
    chunks = HeadingAwareChunker(max_characters=180, overlap_characters=20, max_chunks=10, index_version="1").chunk(src)
    assert chunks[0].heading_path == ["Services", "H"]
    assert chunks[0].chunk_id == HeadingAwareChunker(max_characters=180, overlap_characters=20, max_chunks=10, index_version="1").chunk(src)[0].chunk_id

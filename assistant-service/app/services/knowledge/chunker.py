import re

from app.services.knowledge.checksums import normalized_checksum
from app.services.knowledge.models import KnowledgeChunk, KnowledgeSource

_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+")


class HeadingAwareChunker:
    def __init__(self, *, max_characters: int, overlap_characters: int, max_chunks: int, index_version: str) -> None:
        self.max_characters = max_characters
        self.overlap_characters = min(overlap_characters, max_characters // 3)
        self.max_chunks = max_chunks
        self.index_version = index_version

    def chunk(self, source: KnowledgeSource) -> list[KnowledgeChunk]:
        chunks: list[KnowledgeChunk] = []
        for section in source.sections:
            prefix = " > ".join(section.heading_path) if section.heading_path else section.heading
            units = [part.strip() for part in _SENTENCE_RE.split(section.content) if part.strip()]
            current = prefix + "\n" if prefix else ""
            for unit in units:
                candidate = f"{current} {unit}".strip()
                if len(candidate) <= self.max_characters:
                    current = candidate
                    continue
                if len(current) >= 120:
                    chunks.append(self._make_chunk(source, section.heading, section.heading_path, current, len(chunks)))
                current = (current[-self.overlap_characters :] + " " + unit).strip() if self.overlap_characters else unit
                if len(chunks) >= self.max_chunks:
                    return chunks
            if len(current) >= 120 or not chunks:
                chunks.append(self._make_chunk(source, section.heading, section.heading_path, current, len(chunks)))
            if len(chunks) >= self.max_chunks:
                break
        return chunks

    def _make_chunk(self, source: KnowledgeSource, heading: str, heading_path: list[str], content: str, index: int) -> KnowledgeChunk:
        checksum = normalized_checksum(content)
        return KnowledgeChunk(
            chunk_id=normalized_checksum(f"{source.source_id}:{index}:{checksum}")[:40],
            source_id=source.source_id,
            route=source.route,
            canonical_url=str(source.canonical_url),
            page_title=source.page_title,
            heading=heading,
            heading_path=heading_path,
            content=content[: self.max_characters],
            content_type=source.content_type,
            chunk_index=index,
            updated_at=source.updated_at,
            checksum=checksum,
            index_version=self.index_version,
        )

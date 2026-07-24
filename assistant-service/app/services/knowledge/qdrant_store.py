import asyncio
from typing import Protocol

from app.services.knowledge.models import KnowledgeChunk, RetrievalMatch


class VectorStore(Protocol):
    async def ensure_collection(self) -> None: ...
    async def upsert_chunks(self, chunks: list[KnowledgeChunk], vectors: list[list[float]]) -> None: ...
    async def search(self, vector: list[float], *, limit: int, content_type: str | None = None) -> list[RetrievalMatch]: ...
    async def delete_by_source_id(self, source_id: str) -> None: ...
    async def delete_stale(self, active_chunk_ids: set[str]) -> int: ...


class InMemoryQdrantStore(VectorStore):
    def __init__(self, *, dimension: int) -> None:
        self.dimension = dimension
        self._points: dict[str, tuple[KnowledgeChunk, list[float]]] = {}

    async def ensure_collection(self) -> None:
        return None

    async def upsert_chunks(self, chunks: list[KnowledgeChunk], vectors: list[list[float]]) -> None:
        if len(chunks) != len(vectors):
            raise ValueError("vector count mismatch")
        for chunk, vector in zip(chunks, vectors, strict=True):
            self._validate_vector(vector)
            self._points[chunk.chunk_id] = (chunk, vector)

    async def search(self, vector: list[float], *, limit: int, content_type: str | None = None) -> list[RetrievalMatch]:
        self._validate_vector(vector)
        matches: list[RetrievalMatch] = []
        for chunk, stored in self._points.values():
            if content_type and chunk.content_type != content_type:
                continue
            score = sum(a * b for a, b in zip(vector, stored, strict=True))
            matches.append(RetrievalMatch(chunk=chunk, score=max(0.0, score)))
        matches.sort(key=lambda item: item.score, reverse=True)
        return matches[:limit]

    async def delete_by_source_id(self, source_id: str) -> None:
        for chunk_id, (chunk, _) in list(self._points.items()):
            if chunk.source_id == source_id:
                del self._points[chunk_id]

    async def delete_stale(self, active_chunk_ids: set[str]) -> int:
        removed = 0
        for chunk_id in list(self._points.keys()):
            if chunk_id not in active_chunk_ids:
                del self._points[chunk_id]
                removed += 1
        return removed

    def _validate_vector(self, vector: list[float]) -> None:
        if len(vector) != self.dimension:
            raise ValueError("invalid vector dimension")


class QdrantVectorStore(VectorStore):
    """Wrapper placeholder for the maintained qdrant-client; tests use InMemoryQdrantStore."""

    def __init__(self, *, dimension: int) -> None:
        self._memory = InMemoryQdrantStore(dimension=dimension)

    async def ensure_collection(self) -> None:
        await self._memory.ensure_collection()

    async def upsert_chunks(self, chunks: list[KnowledgeChunk], vectors: list[list[float]]) -> None:
        await self._memory.upsert_chunks(chunks, vectors)

    async def search(self, vector: list[float], *, limit: int, content_type: str | None = None) -> list[RetrievalMatch]:
        await asyncio.sleep(0)
        return await self._memory.search(vector, limit=limit, content_type=content_type)

    async def delete_by_source_id(self, source_id: str) -> None:
        await self._memory.delete_by_source_id(source_id)

    async def delete_stale(self, active_chunk_ids: set[str]) -> int:
        return await self._memory.delete_stale(active_chunk_ids)

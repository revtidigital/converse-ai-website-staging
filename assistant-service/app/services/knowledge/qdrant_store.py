import asyncio
from typing import Any, Protocol

from app.core.errors import AssistantError, ErrorCode
from app.services.knowledge.models import ContentType, KnowledgeChunk, RetrievalMatch


class VectorStore(Protocol):
    async def ensure_collection(self) -> None: ...
    async def upsert_chunks(self, chunks: list[KnowledgeChunk], vectors: list[list[float]]) -> None: ...
    async def search(self, vector: list[float], *, limit: int, content_type: str | None = None) -> list[RetrievalMatch]: ...
    async def delete_by_source_id(self, source_id: str) -> None: ...
    async def delete_stale(self, active_chunk_ids: set[str]) -> int: ...
    async def close(self) -> None: ...


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
            if content_type and str(chunk.content_type) != content_type:
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

    async def close(self) -> None:
        return None

    def _validate_vector(self, vector: list[float]) -> None:
        if len(vector) != self.dimension:
            raise ValueError("invalid vector dimension")


class QdrantVectorStore(VectorStore):
    def __init__(self, *, url: str, api_key: str | None, collection: str, dimension: int, distance: str, timeout_seconds: float) -> None:
        self.url = url
        self.api_key = api_key
        self.collection = collection
        self.dimension = dimension
        self.distance = distance.lower()
        self.timeout_seconds = timeout_seconds
        self._client: Any | None = None

    @property
    def client(self) -> Any:
        if self._client is None:
            try:
                from qdrant_client import AsyncQdrantClient
            except Exception as exc:  # pragma: no cover - depends on optional package
                raise AssistantError(ErrorCode.QDRANT_UNAVAILABLE) from exc
            self._client = AsyncQdrantClient(url=self.url, api_key=self.api_key, timeout=self.timeout_seconds)
        return self._client

    async def ensure_collection(self) -> None:
        try:
            from qdrant_client.http import models as rest
            collections = await asyncio.wait_for(self.client.get_collections(), timeout=self.timeout_seconds)
            exists = any(item.name == self.collection for item in collections.collections)
            if exists:
                info = await asyncio.wait_for(self.client.get_collection(self.collection), timeout=self.timeout_seconds)
                size = info.config.params.vectors.size
                distance = str(info.config.params.vectors.distance).lower().replace("distance.", "")
                if size != self.dimension or self.distance not in distance:
                    raise AssistantError(ErrorCode.QDRANT_INVALID_RESPONSE)
                return
            await asyncio.wait_for(
                self.client.create_collection(
                    collection_name=self.collection,
                    vectors_config=rest.VectorParams(size=self.dimension, distance=_distance(self.distance)),
                ),
                timeout=self.timeout_seconds,
            )
        except AssistantError:
            raise
        except TimeoutError as exc:
            raise AssistantError(ErrorCode.QDRANT_TIMEOUT) from exc
        except Exception as exc:
            raise AssistantError(ErrorCode.QDRANT_UNAVAILABLE) from exc

    async def upsert_chunks(self, chunks: list[KnowledgeChunk], vectors: list[list[float]]) -> None:
        if len(chunks) != len(vectors):
            raise AssistantError(ErrorCode.QDRANT_INVALID_RESPONSE)
        for vector in vectors:
            self._validate_vector(vector)
        try:
            from qdrant_client.http import models as rest
            points = [rest.PointStruct(id=chunk.chunk_id, vector=vector, payload=_payload(chunk)) for chunk, vector in zip(chunks, vectors, strict=True)]
            await asyncio.wait_for(self.client.upsert(collection_name=self.collection, points=points, wait=True), timeout=self.timeout_seconds)
        except TimeoutError as exc:
            raise AssistantError(ErrorCode.QDRANT_TIMEOUT) from exc
        except Exception as exc:
            raise AssistantError(ErrorCode.QDRANT_UNAVAILABLE) from exc

    async def search(self, vector: list[float], *, limit: int, content_type: str | None = None) -> list[RetrievalMatch]:
        self._validate_vector(vector)
        try:
            query_filter = _content_type_filter(content_type) if content_type else None
            results = await asyncio.wait_for(self.client.search(collection_name=self.collection, query_vector=vector, query_filter=query_filter, limit=limit, with_payload=True), timeout=self.timeout_seconds)
            matches: list[RetrievalMatch] = []
            for result in results:
                payload = result.payload or {}
                chunk = _chunk_from_payload(payload)
                matches.append(RetrievalMatch(chunk=chunk, score=float(result.score)))
            return matches
        except TimeoutError as exc:
            raise AssistantError(ErrorCode.QDRANT_TIMEOUT) from exc
        except AssistantError:
            raise
        except Exception as exc:
            raise AssistantError(ErrorCode.QDRANT_INVALID_RESPONSE) from exc

    async def delete_by_source_id(self, source_id: str) -> None:
        try:
            from qdrant_client.http import models as rest
            selector = rest.FilterSelector(filter=rest.Filter(must=[rest.FieldCondition(key="source_id", match=rest.MatchValue(value=source_id))]))
            await asyncio.wait_for(self.client.delete(collection_name=self.collection, points_selector=selector, wait=True), timeout=self.timeout_seconds)
        except TimeoutError as exc:
            raise AssistantError(ErrorCode.QDRANT_TIMEOUT) from exc
        except Exception as exc:
            raise AssistantError(ErrorCode.QDRANT_UNAVAILABLE) from exc

    async def delete_stale(self, active_chunk_ids: set[str]) -> int:
        # Qdrant cannot efficiently delete "not in set" without scrolling; this controlled implementation scrolls payloads.
        removed = 0
        try:
            offset = None
            from qdrant_client.http import models as rest
            while True:
                points, offset = await asyncio.wait_for(self.client.scroll(collection_name=self.collection, limit=256, offset=offset, with_payload=True, with_vectors=False), timeout=self.timeout_seconds)
                stale_ids = [point.id for point in points if str((point.payload or {}).get("chunk_id")) not in active_chunk_ids]
                if stale_ids:
                    await asyncio.wait_for(self.client.delete(collection_name=self.collection, points_selector=rest.PointIdsList(points=stale_ids), wait=True), timeout=self.timeout_seconds)
                    removed += len(stale_ids)
                if offset is None:
                    return removed
        except TimeoutError as exc:
            raise AssistantError(ErrorCode.QDRANT_TIMEOUT) from exc
        except Exception as exc:
            raise AssistantError(ErrorCode.QDRANT_UNAVAILABLE) from exc

    async def close(self) -> None:
        if self._client is not None:
            await self._client.close()
            self._client = None

    def _validate_vector(self, vector: list[float]) -> None:
        if len(vector) != self.dimension:
            raise AssistantError(ErrorCode.QDRANT_INVALID_RESPONSE)


def _distance(value: str) -> Any:
    from qdrant_client.http import models as rest
    return {"cosine": rest.Distance.COSINE, "dot": rest.Distance.DOT, "euclid": rest.Distance.EUCLID}[value]


def _payload(chunk: KnowledgeChunk) -> dict[str, Any]:
    return {
        "chunk_id": chunk.chunk_id,
        "source_id": chunk.source_id,
        "route": chunk.route,
        "canonical_url": chunk.canonical_url,
        "page_title": chunk.page_title,
        "heading": chunk.heading,
        "heading_path": chunk.heading_path,
        "content": chunk.content,
        "content_type": str(chunk.content_type),
        "updated_at": chunk.updated_at.isoformat(),
        "checksum": chunk.checksum,
        "index_version": chunk.index_version,
        "publication_status": chunk.publication_status,
    }


def _chunk_from_payload(payload: dict[str, Any]) -> KnowledgeChunk:
    from datetime import datetime
    return KnowledgeChunk(
        chunk_id=str(payload["chunk_id"]),
        source_id=str(payload["source_id"]),
        route=str(payload["route"]),
        canonical_url=str(payload["canonical_url"]),
        page_title=str(payload["page_title"]),
        heading=str(payload.get("heading") or ""),
        heading_path=list(payload.get("heading_path") or []),
        content=str(payload["content"]),
        content_type=ContentType(str(payload["content_type"]).replace("ContentType.", "")),
        chunk_index=0,
        updated_at=datetime.fromisoformat(str(payload["updated_at"])),
        checksum=str(payload["checksum"]),
        index_version=str(payload["index_version"]),
    )


def _content_type_filter(content_type: str) -> Any:
    from qdrant_client.http import models as rest
    return rest.Filter(must=[rest.FieldCondition(key="content_type", match=rest.MatchValue(value=content_type))])

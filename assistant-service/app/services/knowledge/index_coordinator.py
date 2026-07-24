import asyncio
import time
from datetime import UTC, datetime
from typing import Literal

from app.services.knowledge.chunker import HeadingAwareChunker
from app.services.knowledge.deduplicator import deduplicate_chunks, deduplicate_sources
from app.services.knowledge.embedding_base import EmbeddingClient
from app.services.knowledge.index_manifest import JsonIndexManifestStore
from app.services.knowledge.models import IndexedSourceManifest, IndexSummary, KnowledgeSource
from app.services.knowledge.qdrant_store import VectorStore

IndexMode = Literal["full", "incremental", "dry-run"]


class KnowledgeIndexCoordinator:
    def __init__(self, *, chunker: HeadingAwareChunker, embedding_client: EmbeddingClient, vector_store: VectorStore, manifest: JsonIndexManifestStore, embedding_model: str, embedding_dimension: int) -> None:
        self.chunker = chunker
        self.embedding_client = embedding_client
        self.vector_store = vector_store
        self.manifest = manifest
        self.embedding_model = embedding_model
        self.embedding_dimension = embedding_dimension

    async def run(self, sources: list[KnowledgeSource], *, mode: IndexMode, cancellation_event: asyncio.Event | None = None) -> IndexSummary:
        start = time.monotonic()
        summary = IndexSummary(discovered=len(sources))
        active_source_ids: set[str] = set()
        await self.vector_store.ensure_collection()
        for source in deduplicate_sources(sources):
            if cancellation_event and cancellation_event.is_set():
                raise asyncio.CancelledError
            active_source_ids.add(source.source_id)
            existing = self.manifest.get(source.source_id)
            if (
                mode == "incremental"
                and existing
                and existing.source_checksum == source.checksum
                and existing.index_version == self.chunker.index_version
                and existing.embedding_model == self.embedding_model
                and existing.embedding_dimension == self.embedding_dimension
            ):
                summary.unchanged += 1
                continue
            chunks = deduplicate_chunks(self.chunker.chunk(source))
            if mode != "dry-run":
                vectors = await self.embedding_client.embed_documents([chunk.content for chunk in chunks], cancellation_event=cancellation_event)
                await self.vector_store.delete_by_source_id(source.source_id)
                await self.vector_store.upsert_chunks(chunks, vectors)
                self.manifest.upsert(IndexedSourceManifest(source_id=source.source_id, source_route=source.route, source_checksum=source.checksum, chunk_ids=[chunk.chunk_id for chunk in chunks], updated_at=source.updated_at, index_version=self.chunker.index_version, embedding_model=self.embedding_model, embedding_dimension=self.embedding_dimension, last_successful_index_at=datetime.now(UTC)))
            summary.indexed += 1
            summary.chunks_upserted += len(chunks)
        if mode == "full":
            removed = self.manifest.remove_missing(active_source_ids)
            summary.removed = len(removed)
            if mode != "dry-run":
                summary.removed += await self.vector_store.delete_stale(
                    self.manifest.active_chunk_ids()
                )
        if mode != "dry-run":
            self.manifest.save()
        summary.duration_ms = int((time.monotonic() - start) * 1000)
        return summary

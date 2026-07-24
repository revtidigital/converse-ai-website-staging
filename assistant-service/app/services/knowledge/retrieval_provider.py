import asyncio

from app.services.knowledge.config import KnowledgeSettings
from app.services.knowledge.embedding_base import EmbeddingClient
from app.services.knowledge.injection_guard import delimit_untrusted_context
from app.services.knowledge.models import KnowledgeChunk, RetrievalResult, SourceMetadata
from app.services.knowledge.qdrant_store import VectorStore
from app.services.knowledge.reranker import DeterministicReranker, Reranker
from app.services.knowledge.route_policy import RoutePolicy


class QdrantRetrievalProvider:
    def __init__(self, *, settings: KnowledgeSettings, embedding_client: EmbeddingClient, vector_store: VectorStore, reranker: Reranker | None = None) -> None:
        self.settings = settings
        self.embedding_client = embedding_client
        self.vector_store = vector_store
        self.reranker = reranker or DeterministicReranker()
        self.route_policy = RoutePolicy(settings.knowledge_allowed_domains)

    async def retrieve(self, query: str, *, current_route: str = "/", cancellation_event: asyncio.Event | None = None) -> RetrievalResult:
        async with asyncio.timeout(self.settings.embedding_request_timeout_seconds + self.settings.qdrant_request_timeout_seconds):
            vector = await self.embedding_client.embed_query(query, cancellation_event=cancellation_event)
            matches = await self.vector_store.search(vector, limit=self.settings.retrieval_fetch_k)
            filtered = [m for m in matches if m.score >= self.settings.retrieval_score_threshold]
            route_decision = self.route_policy.normalize(current_route)
            if route_decision.allowed and route_decision.route:
                for match in filtered:
                    if match.chunk.route == route_decision.route:
                        match.score += min(self.settings.retrieval_current_route_boost, 0.1)
            ranked = await self.reranker.rerank(query, filtered, cancellation_event=cancellation_event)
            chunks = self._select_diverse(ranked)
            return RetrievalResult(context_chunks=chunks, sources=self._sources(chunks))

    async def get_relevant_chunks(self, query: str) -> list[str]:
        result = await self.retrieve(query)
        if not result.context_chunks:
            return []
        return [delimit_untrusted_context([chunk.content for chunk in result.context_chunks])]

    def _select_diverse(self, matches) -> list[KnowledgeChunk]:
        selected: list[KnowledgeChunk] = []
        seen_chunks: set[str] = set()
        per_route: dict[str, int] = {}
        total_chars = 0
        for match in matches:
            chunk = match.chunk
            if chunk.chunk_id in seen_chunks:
                continue
            if per_route.get(chunk.route, 0) >= 3 and len(selected) >= 2:
                continue
            if total_chars + len(chunk.content) > self.settings.retrieval_max_context_characters:
                break
            selected.append(chunk)
            seen_chunks.add(chunk.chunk_id)
            per_route[chunk.route] = per_route.get(chunk.route, 0) + 1
            total_chars += len(chunk.content)
            if len(selected) >= min(self.settings.retrieval_top_k, self.settings.retrieval_max_chunks):
                break
        return selected

    def _sources(self, chunks: list[KnowledgeChunk]) -> list[SourceMetadata]:
        seen: set[tuple[str, str]] = set()
        sources: list[SourceMetadata] = []
        for chunk in chunks:
            key = (chunk.route, chunk.heading)
            if key in seen:
                continue
            seen.add(key)
            snippet = " ".join(chunk.content.split())[:260]
            sources.append(SourceMetadata(title=chunk.page_title, route=chunk.route, canonicalUrl=chunk.canonical_url, heading=chunk.heading, snippet=snippet, contentType=str(chunk.content_type)))
            if len(sources) >= self.settings.retrieval_top_k:
                break
        return sources

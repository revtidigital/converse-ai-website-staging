import asyncio
from typing import Protocol

from app.services.knowledge.models import RetrievalMatch


class Reranker(Protocol):
    async def rerank(self, query: str, matches: list[RetrievalMatch], *, cancellation_event: asyncio.Event | None = None) -> list[RetrievalMatch]: ...


class DeterministicReranker:
    async def rerank(self, query: str, matches: list[RetrievalMatch], *, cancellation_event: asyncio.Event | None = None) -> list[RetrievalMatch]:
        if cancellation_event and cancellation_event.is_set():
            raise asyncio.CancelledError
        query_terms = set(query.lower().split())
        return sorted(matches, key=lambda match: (len(query_terms & set(match.chunk.content.lower().split())), match.score), reverse=True)

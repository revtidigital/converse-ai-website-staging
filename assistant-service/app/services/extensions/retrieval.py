from typing import Protocol

from app.services.knowledge.models import RetrievalResult


class RetrievalProvider(Protocol):
    async def get_relevant_chunks(self, query: str) -> list[str]: ...

    async def retrieve(self, query: str, *, current_route: str = "/") -> RetrievalResult: ...


class NoopRetrievalProvider:
    async def get_relevant_chunks(self, query: str) -> list[str]:
        return []

    async def retrieve(self, query: str, *, current_route: str = "/") -> RetrievalResult:
        return RetrievalResult()

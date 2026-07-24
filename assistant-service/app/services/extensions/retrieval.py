from typing import Protocol


class RetrievalProvider(Protocol):
    async def get_relevant_chunks(self, query: str) -> list[str]: ...


class NoopRetrievalProvider:
    async def get_relevant_chunks(self, query: str) -> list[str]:
        return []

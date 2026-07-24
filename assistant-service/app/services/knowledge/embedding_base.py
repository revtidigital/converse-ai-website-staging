import asyncio
from typing import Protocol


class EmbeddingClient(Protocol):
    async def embed_documents(self, texts: list[str], *, cancellation_event: asyncio.Event | None = None) -> list[list[float]]: ...

    async def embed_query(self, text: str, *, cancellation_event: asyncio.Event | None = None) -> list[float]: ...

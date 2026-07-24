import asyncio
import hashlib
import math

from app.services.knowledge.embedding_base import EmbeddingClient


class DeterministicLocalEmbeddingClient(EmbeddingClient):
    """Offline deterministic fallback for tests/dev; replace with sentence-transformers in live deployments."""

    def __init__(self, *, dimension: int, batch_size: int = 16) -> None:
        self.dimension = dimension
        self.batch_size = batch_size

    async def embed_documents(self, texts: list[str], *, cancellation_event: asyncio.Event | None = None) -> list[list[float]]:
        if not texts:
            raise ValueError("texts must not be empty")
        if len(texts) > self.batch_size:
            raise ValueError("batch too large")
        return [await self.embed_query(text, cancellation_event=cancellation_event) for text in texts]

    async def embed_query(self, text: str, *, cancellation_event: asyncio.Event | None = None) -> list[float]:
        if cancellation_event and cancellation_event.is_set():
            raise asyncio.CancelledError
        if not text.strip():
            raise ValueError("text must not be empty")
        vector = [0.0] * self.dimension
        for token in text.lower().split():
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            vector[int.from_bytes(digest[:4], "big") % self.dimension] += 1.0
        norm = math.sqrt(sum(v * v for v in vector)) or 1.0
        return [v / norm for v in vector]

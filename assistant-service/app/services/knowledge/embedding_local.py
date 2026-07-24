import asyncio
import hashlib
import math
from functools import cached_property
from typing import Any

from app.services.knowledge.embedding_base import EmbeddingClient


class DeterministicLocalEmbeddingClient(EmbeddingClient):
    """Offline deterministic fallback for tests/dev only."""

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
        return _normalize(vector)


class SentenceTransformerEmbeddingClient(EmbeddingClient):
    def __init__(self, *, model_name: str, device: str, batch_size: int, dimension: int, timeout_seconds: float) -> None:
        self.model_name = model_name
        self.device = device
        self.batch_size = batch_size
        self.dimension = dimension
        self.timeout_seconds = timeout_seconds
        self._load_count = 0

    @cached_property
    def model(self) -> Any:
        try:
            from sentence_transformers import SentenceTransformer
        except Exception as exc:  # pragma: no cover - depends on optional package
            raise RuntimeError("sentence-transformers is not available") from exc
        self._load_count += 1
        return SentenceTransformer(self.model_name, device=self.device)

    @property
    def load_count(self) -> int:
        return self._load_count

    async def embed_documents(self, texts: list[str], *, cancellation_event: asyncio.Event | None = None) -> list[list[float]]:
        self._validate_texts(texts)
        if len(texts) > self.batch_size:
            raise ValueError("batch too large")
        prefixed = [f"passage: {text}" for text in texts]
        return await self._encode(prefixed, cancellation_event=cancellation_event)

    async def embed_query(self, text: str, *, cancellation_event: asyncio.Event | None = None) -> list[float]:
        self._validate_texts([text])
        return (await self._encode([f"query: {text}"], cancellation_event=cancellation_event))[0]

    async def _encode(self, texts: list[str], *, cancellation_event: asyncio.Event | None) -> list[list[float]]:
        if cancellation_event and cancellation_event.is_set():
            raise asyncio.CancelledError
        try:
            vectors = await asyncio.wait_for(
                asyncio.to_thread(self.model.encode, texts, normalize_embeddings=True),
                timeout=self.timeout_seconds,
            )
        except TimeoutError as exc:
            raise TimeoutError("embedding request timed out") from exc
        if cancellation_event and cancellation_event.is_set():
            raise asyncio.CancelledError
        normalized = [_normalize([float(value) for value in vector]) for vector in vectors]
        if len(normalized) != len(texts):
            raise ValueError("embedding output count mismatch")
        for vector in normalized:
            if len(vector) != self.dimension:
                raise ValueError("embedding dimension mismatch")
        return normalized

    def _validate_texts(self, texts: list[str]) -> None:
        if not texts or any(not text.strip() for text in texts):
            raise ValueError("texts must not be empty")


def _normalize(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(v * v for v in vector)) or 1.0
    return [v / norm for v in vector]

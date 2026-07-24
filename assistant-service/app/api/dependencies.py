from functools import lru_cache

from app.config import Settings, get_settings
from app.core.concurrency import ConcurrencyLimiter
from app.core.rate_limit import InMemoryRateLimiter
from app.services.extensions.history import HistoryProvider, NoopHistoryProvider
from app.services.extensions.page_context import NoopPageContextProvider, PageContextProvider
from app.services.extensions.retrieval import NoopRetrievalProvider, RetrievalProvider
from app.services.extensions.tools import NoopToolProvider, ToolProvider
from app.services.knowledge.config import KnowledgeSettings
from app.services.knowledge.embedding_base import EmbeddingClient
from app.services.knowledge.embedding_local import (
    DeterministicLocalEmbeddingClient,
    SentenceTransformerEmbeddingClient,
)
from app.services.knowledge.qdrant_store import InMemoryQdrantStore, QdrantVectorStore, VectorStore
from app.services.knowledge.retrieval_provider import QdrantRetrievalProvider
from app.services.llm.base import LLMClient
from app.services.llm.openai_compatible import OpenAICompatibleLLMClient


def settings_dependency() -> Settings:
    return get_settings()


def llm_client_dependency() -> LLMClient:
    return OpenAICompatibleLLMClient(get_settings())


@lru_cache
def rate_limiter_dependency() -> InMemoryRateLimiter:
    s = get_settings()
    return InMemoryRateLimiter(s.rate_limit_requests, s.rate_limit_window_seconds)


@lru_cache
def concurrency_limiter_dependency() -> ConcurrencyLimiter:
    return ConcurrencyLimiter(get_settings().max_concurrent_requests)


@lru_cache
def knowledge_settings_dependency() -> KnowledgeSettings:
    return KnowledgeSettings()


@lru_cache
def embedding_client_dependency() -> EmbeddingClient:
    settings = knowledge_settings_dependency()
    if not settings.knowledge_enabled:
        return DeterministicLocalEmbeddingClient(dimension=settings.embedding_vector_dimension)
    if settings.embedding_provider == "deterministic":
        return DeterministicLocalEmbeddingClient(
            dimension=settings.embedding_vector_dimension,
            batch_size=settings.embedding_batch_size,
        )
    return SentenceTransformerEmbeddingClient(
        model_name=settings.embedding_model,
        device=settings.embedding_device,
        batch_size=settings.embedding_batch_size,
        dimension=settings.embedding_vector_dimension,
        timeout_seconds=settings.embedding_request_timeout_seconds,
    )


@lru_cache
def vector_store_dependency() -> VectorStore:
    settings = knowledge_settings_dependency()
    if settings.knowledge_vector_store == "memory":
        return InMemoryQdrantStore(dimension=settings.qdrant_vector_dimension)
    return QdrantVectorStore(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key.get_secret_value() if settings.qdrant_api_key else None,
        collection=settings.qdrant_collection,
        dimension=settings.qdrant_vector_dimension,
        distance=settings.qdrant_distance,
        timeout_seconds=settings.qdrant_request_timeout_seconds,
    )


@lru_cache
def retrieval_provider_dependency() -> RetrievalProvider:
    settings = knowledge_settings_dependency()
    if not settings.knowledge_enabled:
        return NoopRetrievalProvider()
    return QdrantRetrievalProvider(
        settings=settings,
        embedding_client=embedding_client_dependency(),
        vector_store=vector_store_dependency(),
    )


def history_provider_dependency() -> HistoryProvider:
    return NoopHistoryProvider()


def tool_provider_dependency() -> ToolProvider:
    return NoopToolProvider()


def page_context_provider_dependency() -> PageContextProvider:
    return NoopPageContextProvider()

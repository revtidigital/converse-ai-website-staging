from functools import lru_cache

from app.config import Settings, get_settings
from app.core.concurrency import ConcurrencyLimiter
from app.core.rate_limit import InMemoryRateLimiter
from app.services.extensions.history import HistoryProvider, NoopHistoryProvider
from app.services.extensions.page_context import NoopPageContextProvider, PageContextProvider
from app.services.extensions.retrieval import RetrievalProvider
from app.services.extensions.tools import NoopToolProvider, ToolProvider
from app.services.knowledge.config import KnowledgeSettings
from app.services.knowledge.embedding_local import DeterministicLocalEmbeddingClient
from app.services.knowledge.qdrant_store import QdrantVectorStore
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


def retrieval_provider_dependency() -> RetrievalProvider:
    settings = KnowledgeSettings()
    return QdrantRetrievalProvider(
        settings=settings,
        embedding_client=DeterministicLocalEmbeddingClient(
            dimension=settings.embedding_vector_dimension,
            batch_size=settings.embedding_batch_size,
        ),
        vector_store=QdrantVectorStore(dimension=settings.qdrant_vector_dimension),
    )


def history_provider_dependency() -> HistoryProvider:
    return NoopHistoryProvider()


def tool_provider_dependency() -> ToolProvider:
    return NoopToolProvider()


def page_context_provider_dependency() -> PageContextProvider:
    return NoopPageContextProvider()

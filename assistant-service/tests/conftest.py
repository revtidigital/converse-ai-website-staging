import asyncio
from collections.abc import AsyncIterator

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import (
    concurrency_limiter_dependency,
    llm_client_dependency,
    rate_limiter_dependency,
)
from app.core.concurrency import ConcurrencyLimiter
from app.core.rate_limit import InMemoryRateLimiter
from app.main import app
from app.models.llm import LLMMessage, LLMResult


class FakeLLM:
    def __init__(self, chunks: list[str] | None = None, fail: Exception | None = None) -> None:
        self.chunks = chunks or ["Hello", " world"]
        self.fail = fail
        self.generate_calls = 0

    async def generate(self, messages: list[LLMMessage], *, cancellation_event: asyncio.Event | None = None) -> LLMResult:
        self.generate_calls += 1
        if self.fail:
            raise self.fail
        return LLMResult(content="ok")

    async def stream(self, messages: list[LLMMessage], *, cancellation_event: asyncio.Event | None = None) -> AsyncIterator[str]:
        if self.fail:
            raise self.fail
        for chunk in self.chunks:
            if cancellation_event and cancellation_event.is_set():
                return
            yield chunk


@pytest.fixture
def fake_llm() -> FakeLLM:
    return FakeLLM()


@pytest.fixture
def client(fake_llm: FakeLLM) -> TestClient:
    app.dependency_overrides[llm_client_dependency] = lambda: fake_llm
    app.dependency_overrides[rate_limiter_dependency] = lambda: InMemoryRateLimiter(100, 60)
    app.dependency_overrides[concurrency_limiter_dependency] = lambda: ConcurrencyLimiter(10)
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
    app.dependency_overrides.clear()

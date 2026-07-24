import asyncio
from collections.abc import AsyncIterator
from typing import Protocol

from app.models.llm import LLMMessage, LLMResult


class LLMClient(Protocol):
    async def generate(
        self,
        messages: list[LLMMessage],
        *,
        cancellation_event: asyncio.Event | None = None,
    ) -> LLMResult: ...

    def stream(
        self,
        messages: list[LLMMessage],
        *,
        cancellation_event: asyncio.Event | None = None,
    ) -> AsyncIterator[str]: ...

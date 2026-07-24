from typing import Protocol

from app.models.requests import AssistantTurnRequest


class PageContextProvider(Protocol):
    async def get_context(self, request: AssistantTurnRequest) -> str | None: ...


class NoopPageContextProvider:
    async def get_context(self, request: AssistantTurnRequest) -> str | None:
        return None

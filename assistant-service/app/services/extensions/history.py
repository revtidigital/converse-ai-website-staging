from typing import Protocol

from app.models.requests import AssistantTurnRequest


class HistoryProvider(Protocol):
    async def get_history(self, request: AssistantTurnRequest) -> list[str]: ...


class NoopHistoryProvider:
    async def get_history(self, request: AssistantTurnRequest) -> list[str]:
        return []

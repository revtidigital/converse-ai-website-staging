from typing import Protocol


class SpeechProvider(Protocol):
    async def is_enabled(self) -> bool: ...


class InactiveSpeechProvider:
    async def is_enabled(self) -> bool:
        return False

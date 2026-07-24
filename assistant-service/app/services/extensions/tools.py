from typing import Protocol


class ToolProvider(Protocol):
    async def get_tools(self) -> list[dict[str, str]]: ...


class NoopToolProvider:
    async def get_tools(self) -> list[dict[str, str]]:
        return []

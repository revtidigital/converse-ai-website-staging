import json
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationInfo, field_validator, model_validator


def _has_control(value: str) -> bool:
    return any(ord(ch) < 32 or ord(ch) == 127 for ch in value)


class CurrentPageContext(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(default=None, max_length=500)
    summary: str | None = Field(default=None, max_length=4000)
    visibleText: str | None = Field(default=None, max_length=10000)

    @model_validator(mode="after")
    def bounded(self, info: ValidationInfo) -> "CurrentPageContext":
        limit = int((info.context or {}).get("max_context_length", 12000))
        if len(json.dumps(self.model_dump(exclude_none=True))) > limit:
            raise ValueError("currentPageContext is too large")
        return self


class ConversationMemory(BaseModel):
    model_config = ConfigDict(extra="forbid")
    summary: str | None = Field(default=None, max_length=10000)
    recentMessages: list[str] = Field(default_factory=list, max_length=20)

    @model_validator(mode="after")
    def bounded(self, info: ValidationInfo) -> "ConversationMemory":
        limit = int((info.context or {}).get("max_memory_length", 12000))
        if len(json.dumps(self.model_dump(exclude_none=True))) > limit:
            raise ValueError("conversationMemory is too large")
        return self


class AssistantTurnRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    conversationId: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1)
    inputMode: Literal["text", "voice"]
    currentRoute: str = Field(default="/", max_length=2048)
    currentPageContext: CurrentPageContext | None = None
    conversationMemory: ConversationMemory | None = None

    @field_validator("conversationId", "message", "currentRoute", mode="before")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value

    @field_validator("conversationId", "currentRoute")
    @classmethod
    def reject_control(cls, value: str) -> str:
        if _has_control(value):
            raise ValueError("control characters are not allowed")
        return value

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str, info: ValidationInfo) -> str:
        if not value:
            raise ValueError("message is required")
        if _has_control(value):
            raise ValueError("control characters are not allowed")
        limit = int((info.context or {}).get("max_message_length", 8000))
        if len(value) > limit:
            raise ValueError("message is too large")
        return value

    @field_validator("currentRoute")
    @classmethod
    def validate_route(cls, value: str) -> str:
        lowered = value.lower()
        if lowered.startswith(("http://", "https://", "//", "javascript:")) or not value.startswith("/"):
            raise ValueError("currentRoute must be a local path")
        return value

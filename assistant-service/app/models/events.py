from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ErrorPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    code: str
    message: str
    retryable: bool


class BaseAssistantEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: str
    requestId: str
    conversationId: str


class ResponseStartedEvent(BaseAssistantEvent):
    type: Literal["response.started"] = "response.started"


class ResponseDeltaEvent(BaseAssistantEvent):
    type: Literal["response.delta"] = "response.delta"
    delta: str


class ResponseCompletedEvent(BaseAssistantEvent):
    type: Literal["response.completed"] = "response.completed"
    assistantMessage: str
    sources: list[dict[str, str]] = Field(default_factory=list)
    toolActions: list[dict[str, str]] = Field(default_factory=list)


class ResponseErrorEvent(BaseAssistantEvent):
    type: Literal["response.error"] = "response.error"
    error: ErrorPayload


AssistantEvent = ResponseStartedEvent | ResponseDeltaEvent | ResponseCompletedEvent | ResponseErrorEvent

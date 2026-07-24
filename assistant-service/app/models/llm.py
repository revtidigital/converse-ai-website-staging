from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class LLMMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: Literal["system", "user", "assistant"]
    content: str


class LLMResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    content: str = Field(min_length=0)

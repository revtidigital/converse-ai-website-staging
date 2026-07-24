from functools import lru_cache
from typing import Any
from urllib.parse import urlparse

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _trim(value: Any) -> Any:
    return value.strip() if isinstance(value, str) else value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="forbid", str_strip_whitespace=True)

    llm_base_url: str = Field(default="http://127.0.0.1:8080/v1", alias="LLM_BASE_URL")
    llm_model: str = Field(default="qwen-local", alias="LLM_MODEL")
    llm_api_key: SecretStr | None = Field(default=None, alias="LLM_API_KEY")
    llm_request_timeout_seconds: float = Field(default=60, alias="LLM_REQUEST_TIMEOUT_SECONDS")
    llm_max_output_tokens: int = Field(default=1024, alias="LLM_MAX_OUTPUT_TOKENS")
    llm_max_response_characters: int = Field(default=20000, alias="LLM_MAX_RESPONSE_CHARACTERS")
    allowed_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"], alias="ALLOWED_ORIGINS")
    max_concurrent_requests: int = Field(default=2, alias="MAX_CONCURRENT_REQUESTS")
    rate_limit_requests: int = Field(default=20, alias="RATE_LIMIT_REQUESTS")
    rate_limit_window_seconds: int = Field(default=60, alias="RATE_LIMIT_WINDOW_SECONDS")
    max_message_length: int = Field(default=8000, alias="MAX_MESSAGE_LENGTH")
    max_context_length: int = Field(default=12000, alias="MAX_CONTEXT_LENGTH")
    max_memory_length: int = Field(default=12000, alias="MAX_MEMORY_LENGTH")
    assistant_host: str = Field(default="0.0.0.0", alias="ASSISTANT_HOST")
    assistant_port: int = Field(default=8787, alias="ASSISTANT_PORT")
    assistant_log_level: str = Field(default="INFO", alias="ASSISTANT_LOG_LEVEL")
    assistant_environment: str = Field(default="development", alias="ASSISTANT_ENVIRONMENT")

    assistant_stt_provider: str = Field(default="noop", alias="ASSISTANT_STT_PROVIDER")
    assistant_stt_model: str = Field(default="small", alias="ASSISTANT_STT_MODEL")
    assistant_stt_device: str = Field(default="cpu", alias="ASSISTANT_STT_DEVICE")
    assistant_stt_compute_type: str = Field(default="int8", alias="ASSISTANT_STT_COMPUTE_TYPE")
    assistant_stt_language: str | None = Field(default=None, alias="ASSISTANT_STT_LANGUAGE")
    assistant_stt_beam_size: int = Field(default=1, alias="ASSISTANT_STT_BEAM_SIZE")
    assistant_stt_timeout_seconds: float = Field(default=120, alias="ASSISTANT_STT_TIMEOUT_SECONDS")
    assistant_max_audio_duration_seconds: int = Field(default=120, alias="ASSISTANT_MAX_AUDIO_DURATION_SECONDS")
    assistant_max_audio_bytes: int = Field(default=16000000, alias="ASSISTANT_MAX_AUDIO_BYTES")
    assistant_internal_gateway_token: SecretStr | None = Field(default=None, alias="ASSISTANT_INTERNAL_GATEWAY_TOKEN")

    @field_validator("llm_base_url", mode="before")
    @classmethod
    def validate_base_url(cls, value: Any) -> str:
        value = _trim(value)
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("LLM_BASE_URL must be an absolute http(s) URL")
        return str(value).rstrip("/")

    @field_validator("llm_model", "assistant_log_level", "assistant_environment", "assistant_stt_provider", "assistant_stt_model", "assistant_stt_device", "assistant_stt_compute_type", mode="before")
    @classmethod
    def trim_required_text(cls, value: Any) -> str:
        value = _trim(value)
        if not value:
            raise ValueError("value is required")
        return str(value)

    @field_validator("assistant_stt_language", mode="before")
    @classmethod
    def empty_language_is_none(cls, value: Any) -> Any:
        value = _trim(value)
        return None if value == "" else value

    @field_validator("llm_api_key", "assistant_internal_gateway_token", mode="before")
    @classmethod
    def empty_secret_is_none(cls, value: Any) -> Any:
        value = _trim(value)
        return None if value == "" else value

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: Any) -> list[str]:
        if isinstance(value, str):
            parts = [part.strip() for part in value.split(",") if part.strip()]
        else:
            parts = value
        if not parts:
            raise ValueError("ALLOWED_ORIGINS must include at least one origin")
        for origin in parts:
            parsed = urlparse(origin)
            if origin == "*" or parsed.scheme not in {"http", "https"} or not parsed.netloc:
                raise ValueError("ALLOWED_ORIGINS entries must be explicit http(s) origins")
        return parts

    @field_validator(
        "llm_request_timeout_seconds",
        "llm_max_output_tokens",
        "llm_max_response_characters",
        "max_concurrent_requests",
        "rate_limit_requests",
        "rate_limit_window_seconds",
        "max_message_length",
        "max_context_length",
        "max_memory_length",
        "assistant_port",
        "assistant_stt_beam_size",
        "assistant_stt_timeout_seconds",
        "assistant_max_audio_duration_seconds",
        "assistant_max_audio_bytes",
    )
    @classmethod
    def positive_numbers(cls, value: int | float) -> int | float:
        if value <= 0:
            raise ValueError("numeric limits must be positive")
        return value

    def api_key_value(self) -> str | None:
        return self.llm_api_key.get_secret_value() if self.llm_api_key else None

    def assistant_internal_gateway_token_value(self) -> str | None:
        return self.assistant_internal_gateway_token.get_secret_value() if self.assistant_internal_gateway_token else None


@lru_cache
def get_settings() -> Settings:
    return Settings()

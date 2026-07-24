import asyncio
import json
from collections.abc import AsyncIterator
from typing import Any

import httpx

from app.config import Settings
from app.core.errors import AssistantError, ErrorCode
from app.models.llm import LLMMessage, LLMResult


class OpenAICompatibleLLMClient:
    def __init__(self, settings: Settings, client: httpx.AsyncClient | None = None) -> None:
        self.settings = settings
        self._client = client
        self._chat_completions_url = self._build_chat_completions_url(settings.llm_base_url)

    @staticmethod
    def _build_chat_completions_url(base_url: str) -> str:
        normalized = base_url.strip().rstrip("/")
        suffix = "/chat/completions"
        if normalized.endswith(suffix):
            return normalized
        return f"{normalized}{suffix}"

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        key = self.settings.api_key_value()
        if key:
            headers["Authorization"] = f"Bearer {key}"
        return headers

    def _payload(self, messages: list[LLMMessage], stream: bool) -> dict[str, Any]:
        return {
            "model": self.settings.llm_model,
            "messages": [message.model_dump() for message in messages],
            "stream": stream,
            "max_tokens": self.settings.llm_max_output_tokens,
        }

    def _map_status(self, status: int) -> ErrorCode:
        if status == 429:
            return ErrorCode.LLM_RATE_LIMITED
        if status in {401, 403}:
            return ErrorCode.LLM_AUTHENTICATION_FAILED
        if 400 <= status < 500:
            return ErrorCode.LLM_REQUEST_REJECTED
        return ErrorCode.LLM_UNAVAILABLE

    async def _client_context(self) -> AsyncIterator[httpx.AsyncClient]:
        if self._client is not None:
            yield self._client
            return
        timeout = httpx.Timeout(self.settings.llm_request_timeout_seconds)
        async with httpx.AsyncClient(timeout=timeout) as client:
            yield client

    async def generate(
        self,
        messages: list[LLMMessage],
        *,
        cancellation_event: asyncio.Event | None = None,
    ) -> LLMResult:
        if cancellation_event and cancellation_event.is_set():
            raise AssistantError(ErrorCode.LLM_CANCELLED)
        try:
            async for client in self._client_context():
                response = await client.post(
                    self._chat_completions_url,
                    headers=self._headers(),
                    json=self._payload(messages, stream=False),
                )
            if cancellation_event and cancellation_event.is_set():
                raise AssistantError(ErrorCode.LLM_CANCELLED)
            if response.status_code >= 400:
                raise AssistantError(self._map_status(response.status_code))
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            if not isinstance(content, str):
                raise ValueError
            return LLMResult(content=content[: self.settings.llm_max_response_characters])
        except AssistantError:
            raise
        except (TimeoutError, httpx.TimeoutException) as exc:
            raise AssistantError(ErrorCode.LLM_TIMEOUT) from exc
        except httpx.HTTPError as exc:
            raise AssistantError(ErrorCode.LLM_UNAVAILABLE) from exc
        except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise AssistantError(ErrorCode.LLM_INVALID_RESPONSE) from exc

    async def stream(
        self,
        messages: list[LLMMessage],
        *,
        cancellation_event: asyncio.Event | None = None,
    ) -> AsyncIterator[str]:
        emitted = 0
        try:
            async for client in self._client_context():
                async with client.stream(
                    "POST",
                    self._chat_completions_url,
                    headers=self._headers(),
                    json=self._payload(messages, stream=True),
                ) as response:
                    if response.status_code >= 400:
                        raise AssistantError(self._map_status(response.status_code))
                    async for line in response.aiter_lines():
                        if cancellation_event and cancellation_event.is_set():
                            raise AssistantError(ErrorCode.LLM_CANCELLED)
                        if not line:
                            continue
                        if not line.startswith("data:"):
                            raise AssistantError(ErrorCode.LLM_INVALID_RESPONSE)
                        chunk = line.removeprefix("data:").strip()
                        if chunk == "[DONE]":
                            return
                        try:
                            data = json.loads(chunk)
                            delta = data["choices"][0].get("delta", {}).get("content", "")
                        except (json.JSONDecodeError, KeyError, IndexError, TypeError) as exc:
                            raise AssistantError(ErrorCode.LLM_INVALID_RESPONSE) from exc
                        if not isinstance(delta, str):
                            raise AssistantError(ErrorCode.LLM_INVALID_RESPONSE)
                        if not delta:
                            continue
                        remaining = self.settings.llm_max_response_characters - emitted
                        if remaining <= 0:
                            return
                        piece = delta[:remaining]
                        emitted += len(piece)
                        yield piece
        except AssistantError:
            raise
        except (TimeoutError, httpx.TimeoutException) as exc:
            raise AssistantError(ErrorCode.LLM_TIMEOUT) from exc
        except httpx.HTTPError as exc:
            raise AssistantError(ErrorCode.LLM_UNAVAILABLE) from exc

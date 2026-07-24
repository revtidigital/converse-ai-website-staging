import asyncio

import httpx
import pytest

from app.config import Settings
from app.core.errors import AssistantError, ErrorCode
from app.models.llm import LLMMessage
from app.services.llm.openai_compatible import OpenAICompatibleLLMClient


class ByteStream(httpx.AsyncByteStream):
    def __init__(self, chunks):
        self._chunks = chunks

    async def __aiter__(self):
        for chunk in self._chunks:
            yield chunk


def make_client(handler, settings=None):
    transport = httpx.MockTransport(handler)
    return OpenAICompatibleLLMClient(settings or Settings(), httpx.AsyncClient(transport=transport))


async def test_non_streaming_success_and_auth_header() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url) == "http://127.0.0.1:8080/v1/chat/completions"
        assert request.headers["authorization"] == "Bearer token"
        assert request.read()
        return httpx.Response(200, json={"choices":[{"message":{"content":"ok"}}]})
    result = await make_client(handler, Settings(LLM_API_KEY="token", LLM_BASE_URL="http://127.0.0.1:8080/v1/")).generate([LLMMessage(role="user", content="hi")])
    assert result.content == "ok"


async def test_chat_completions_url_accepts_full_endpoint_without_duplication() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url) == "http://127.0.0.1:8080/v1/chat/completions"
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})

    result = await make_client(
        handler,
        Settings(LLM_BASE_URL="http://127.0.0.1:8080/v1/chat/completions"),
    ).generate([LLMMessage(role="user", content="hi")])
    assert result.content == "ok"


async def test_no_auth_for_empty_key_and_http_errors() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert "authorization" not in request.headers
        return httpx.Response(429, json={"error":"hidden"})
    with pytest.raises(AssistantError) as exc:
        await make_client(handler, Settings(LLM_API_KEY="")).generate([LLMMessage(role="user", content="hi")])
    assert exc.value.code == ErrorCode.LLM_RATE_LIMITED


@pytest.mark.parametrize("status,code", [(400, ErrorCode.LLM_REQUEST_REJECTED), (401, ErrorCode.LLM_AUTHENTICATION_FAILED), (403, ErrorCode.LLM_AUTHENTICATION_FAILED)])
async def test_status_mapping(status: int, code: ErrorCode) -> None:
    with pytest.raises(AssistantError) as exc:
        await make_client(lambda request: httpx.Response(status)).generate([LLMMessage(role="user", content="hi")])
    assert exc.value.code == code


async def test_malformed_json_and_missing_content() -> None:
    with pytest.raises(AssistantError):
        await make_client(lambda request: httpx.Response(200, content=b"{" )).generate([LLMMessage(role="user", content="hi")])
    with pytest.raises(AssistantError):
        await make_client(lambda request: httpx.Response(200, json={"choices":[]})).generate([LLMMessage(role="user", content="hi")])


async def test_streaming_success_and_bounds() -> None:
    chunks = [
        b'data: {"choices":[{"delta":{"content":"abc"}}]}\n\n',
        b'data: {"choices":[{"delta":{"content":"def"}}]}\n\n',
        b'data: [DONE]\n\n',
    ]
    client = make_client(
        lambda request: httpx.Response(200, stream=ByteStream(chunks)),
        Settings(LLM_MAX_RESPONSE_CHARACTERS=4),
    )
    assert [x async for x in client.stream([LLMMessage(role="user", content="hi")])] == ["abc", "d"]


async def test_malformed_stream_chunk() -> None:
    chunks = [b'data: nope\n\n']
    with pytest.raises(AssistantError):
        [
            x
            async for x in make_client(
                lambda request: httpx.Response(200, stream=ByteStream(chunks))
            ).stream([LLMMessage(role="user", content="hi")])
        ]


async def test_cancellation() -> None:
    event = asyncio.Event()
    event.set()
    with pytest.raises(AssistantError) as exc:
        await make_client(lambda request: httpx.Response(200)).generate([LLMMessage(role="user", content="hi")], cancellation_event=event)
    assert exc.value.code == ErrorCode.LLM_CANCELLED


async def test_unavailable_server() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("hidden")
    with pytest.raises(AssistantError) as exc:
        await make_client(handler).generate([LLMMessage(role="user", content="hi")])
    assert exc.value.code == ErrorCode.LLM_UNAVAILABLE

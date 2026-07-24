# Converse Assistant Service — Phase 1

Python FastAPI backend foundation for the self-hosted Converse smart multimodal assistant.

## Architecture

React + TypeScript + Vite frontend calls this FastAPI service. The service routes all future text and voice turns through one shared orchestrator, which talks to a self-hosted llama.cpp-compatible local model server. Future phases will add Qdrant retrieval, Supabase history/tools, and Faster-Whisper + Silero VAD + Kokoro TTS.

## Folder structure

`app/api` contains health and assistant routes. `app/models` contains strict request, response, stream event, and LLM schemas. `app/services/llm` contains the local-model abstraction and OpenAI-compatible HTTP adapter. `app/services/orchestrator` contains the shared assistant brain and production prompt. `app/services/extensions` contains injectable no-op interfaces for future retrieval, history, tools, page context, and speech. `app/core` contains errors, logging, rate limiting, concurrency, request context, and cancellation helpers.

## Python and setup

Python 3.11+ is supported.

```bash
cd assistant-service
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
cp .env.example .env
```

## Environment variables

Copy `.env.example` and configure `LLM_BASE_URL`, `LLM_MODEL`, optional `LLM_API_KEY`, LLM limits, `ALLOWED_ORIGINS`, concurrency, rate limit, request-size limits, host, port, log level, and environment. Do not use `VITE_` variables for backend secrets.

## Run locally

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8787
```

## llama.cpp connection

Run llama.cpp separately; this container does not include model files or llama.cpp. Example:

```bash
llama-server -m /path/to/model.gguf --host 127.0.0.1 --port 8080
```

Set `LLM_BASE_URL=http://127.0.0.1:8080/v1`.

## Endpoints

- `GET /health` returns service liveness without calling the model.
- `GET /health/ready` checks local LLM reachability with a bounded call and returns safe dependency status.
- `POST /v1/assistant/stream` accepts a validated assistant turn and returns Server-Sent Events.

Example request:

```json
{
  "conversationId": "conversation-123",
  "message": "Explain what you can help me with",
  "inputMode": "text",
  "currentRoute": "/",
  "currentPageContext": null,
  "conversationMemory": null
}
```

The stream emits `response.started`, ordered `response.delta`, and one `response.completed`; failures emit one safe `response.error`. Cancellation is propagated on disconnect, timeout, or task cancellation, and upstream streams are closed by context managers.

## Limits, privacy, and security

The service includes an in-memory rate limiter and in-process concurrency limiter. Distributed deployments need a shared Redis-backed limiter. Logs are metadata-only and must not include prompts, user messages, assistant answers, memory, page content, raw upstream bodies, API keys, or Authorization headers. CORS uses explicit `ALLOWED_ORIGINS`; wildcard credentials are not used.

## Validation commands

```bash
python -m pytest
python -m ruff check .
python -m mypy .
python -m compileall .
```

## Docker

```bash
docker build -t converse-assistant-service ./assistant-service
docker run --rm -p 8787:8787 --env-file assistant-service/.env converse-assistant-service
```

The local LLM server must run as a separate service.

## Phase 1 limitations and Phase 2 boundary

Phase 1 does not contain a website knowledge base, Qdrant, embeddings, website sources, chatbot frontend, conversation persistence, microphone support, speech-to-text, text-to-speech, voice playback, hands-free mode, wake word, or website tools. Phase 2 should add website crawling, content cleaning, local embeddings, Qdrant indexing, grounded retrieval, and source metadata. Do not start those features in Phase 1.

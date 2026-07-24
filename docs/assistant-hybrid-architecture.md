# Hybrid Assistant Architecture

## Why hybrid

The hybrid architecture separates browser realtime transport from AI orchestration. React remains responsible for website UI, the Node.js gateway owns browser WebSocket lifecycle and message validation, and Python FastAPI remains responsible for local AI orchestration, website RAG, Qdrant retrieval, embeddings, local LLM integration, and future STT/VAD/TTS workloads.

## Responsibilities

### React / Vite

- Render website UI.
- Use HTTP POST + SSE text chat where already implemented.
- Use a typed `AssistantTransport` boundary for future gateway-backed realtime sessions.
- Never call llama.cpp, Qdrant, Supabase service-role APIs, embeddings, STT, or TTS directly from the browser.

### Node.js gateway

- Accept browser WebSocket connections at `/v1/realtime`.
- Validate origins, message schemas, payload limits, route context, and connection counts.
- Assign temporary session IDs.
- Forward text turns to Python `POST /v1/assistant/stream`.
- Relay streamed response events back to the browser.
- Propagate cancellation through `AbortController`.
- Reserve future binary audio transport boundaries without enabling microphone capture.

### Python FastAPI

- Keep the shared assistant orchestrator.
- Run website retrieval, Qdrant search, embeddings, local LLM calls, and indexing.
- In future phases, run local STT, VAD, and TTS providers.

## Text request flow

1. Browser opens a WebSocket to Node `/v1/realtime` using the built-in HTTP upgrade boundary.
2. Browser sends `session.start`.
3. Browser sends `text.submit` with safe route context.
4. Node validates and forwards the message to Python `POST /v1/assistant/stream`.
5. Python streams `response.started`, `response.delta`, `response.completed`, or `response.error` as SSE.
6. Node parses SSE, validates events, maps them to gateway events, and sends them to the browser.

## Future voice transport

The gateway reserves `audio.start`, `audio.chunk`, `audio.end`, and `audio.cancel` contracts, but this foundation does not enable microphone capture or send audio to Python. Future voice should use binary WebSocket frames with a small JSON metadata envelope rather than base64 audio payloads.

## Cancellation and interruption

Browser `response.cancel` maps to the active request ID. The gateway aborts the Python streaming request, clears the session's active request, and sends `response.cancelled`. Future interruption events should reuse this cancellation path for barge-in without implementing audio playback in this phase.

## Security boundaries

- No wildcard origin is allowed in production.
- Route context is bounded public metadata only.
- Admin/API/external/unsafe routes are rejected.
- Logs must not contain full prompts, complete answers, source chunks, audio bytes, embeddings, tokens, API keys, or private route context.
- The gateway never exposes Python stack traces, Qdrant details, model paths, or internal network errors to browsers.

## Health checks

- `GET /health`: confirms the Node process is alive only.
- `GET /health/ready`: checks safe gateway readiness and whether Python `/health` is reachable. It does not call the LLM.

## Local development

1. Run the Python service separately at `http://127.0.0.1:8787`.
2. Run the gateway from `assistant-gateway` with `npm run dev`.
3. Configure browser clients with `VITE_ASSISTANT_GATEWAY_URL=ws://127.0.0.1:8790` and keep `VITE_ASSISTANT_V2_ENABLED=false` until UI activation is approved.

## Environment variables

Gateway placeholders are documented in `assistant-gateway/.env.example`. Frontend placeholders are limited to non-secret Vite variables.

## Testing

Gateway tests mock Python responses and do not require live FastAPI, Qdrant, embeddings, LLM, STT, TTS, or internet access.

## Deployment considerations

Deploy the Node gateway separately from the Python service and Qdrant. Use `wss` in production, explicit origins, process supervision, and private network routing to Python.

## Migration stages

1. Audit and preserve useful legacy UI/content.
2. Add Node realtime gateway and typed contracts.
3. Delete provider-specific legacy code only after replacement behavior is implemented, validated, and remotely reviewable.

## Voice-input foundation

The implemented voice-input foundation extends the hybrid architecture without adding TTS or audio playback. The browser captures microphone audio only after a user action, converts it to mono PCM signed 16-bit little-endian at 16 kHz, and sends bounded binary WebSocket frames to the Node gateway. JSON control events (`audio.start`, `audio.end`, and `audio.cancel`) manage the audio request lifecycle.

The Node gateway validates the audio session, frame size, total bytes, duration, and one active audio request per session. It forwards the binary audio stream to the Python FastAPI voice boundary and relays transcript events back to the browser. Node does not perform STT, model loading, retrieval, or orchestration.

Python owns the STT boundary through `WebSocket /v1/assistant/voice`, a `SpeechToTextProvider` abstraction, a noop test provider, and a lazy Faster-Whisper provider. Final transcripts are intended to enter the existing shared assistant orchestrator with `inputMode=voice`. Faster-Whisper partial transcripts are not faked; reliable final transcript events are implemented first.

This path does not implement TTS, voice playback, wake word, continuous listening, hands-free conversation, or barge-in.

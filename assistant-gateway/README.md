# Converse Assistant Gateway

Node.js TypeScript realtime gateway for the Converse assistant hybrid architecture.

## Scope

This service accepts browser WebSocket connections, validates message contracts, forwards text requests to the existing Python FastAPI assistant service, and relays streamed events back to the browser. It does not implement embeddings, Qdrant retrieval, prompt construction, LLM orchestration, STT, TTS, or model loading.

## Commands

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
npm run dev
```

## Endpoints

- `GET /health` — process liveness only.
- `GET /health/ready` — safe dependency readiness for Python assistant reachability and WebSocket subsystem.
- `GET /v1/realtime` — WebSocket endpoint for validated assistant gateway events.

## Environment

Copy `.env.example` and keep values secret-free. Production must use explicit origins and `wss` from browser clients.

## Future audio

Audio event names are reserved for a later phase. This gateway foundation does not request microphone permission and does not forward audio frames to Python.

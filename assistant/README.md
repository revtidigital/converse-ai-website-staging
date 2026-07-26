# ConverseAI Website Voice Assistant (Website Brain V2)

A custom, **zero-external-cost**, Grok-style website voice + text assistant.
Grounded in the site's own pages and published blogs via multilingual RAG.
No foundation-model training; no paid LLM/STT/TTS keys required.

## Architecture

```
Browser UI (VoiceAgent) ── mic (Web Speech STT, free) ──┐
        │  Kokoro-82M TTS (free, in-browser) ◀──────────┤
        ▼                                                │
  assistant-gateway  (Node/ws, persistent WS /v1/realtime)   ← independent host
        ▼  HTTP + x-internal-token
  assistant-service  (Node/express, POST /v1/assistant/respond, GET /health)
        ▼  imports
  @converseai/assistant  (WebsiteBrainService — ONE brain for voice + text)
        ├─ language detection (en / hi / hinglish / mixed)
        ├─ intent detection (+ prompt-injection gate)
        ├─ retrieval (hybrid: pgvector + title/keyword/route/slug/heading/page)
        ├─ confidence policy (low ⇒ never invent, never navigate)
        ├─ grounded synthesis ("custom LLM": extractive + templated, multilingual)
        └─ safe-action validation (route/section allowlist)
        ▼
  Supabase pgvector: website_knowledge_chunks (384-d), assistant_session_memory,
                     match_website_knowledge_chunks() RPC
```

Embedding model (ingest **and** query, same normalisation):
`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-d) via
Transformers.js — runs locally, free.

### Why zero-cost
- **STT**: browser Web Speech API (free). Pluggable server providers (Whisper) optional.
- **TTS**: Kokoro-82M neural voice already in the repo (`src/lib/voice/kokoroTTS.ts`) — human-like, free, in-browser.
- **Synthesis**: deterministic grounded composer over retrieved chunks — the
  website's own "custom LLM". An OpenAI-compatible provider is pluggable but never required.

## Confidence calibration (important)
`paraphrase-multilingual-MiniLM-L12-v2` raw cosine scores good query↔document
matches around **0.40–0.55**, off-topic near/below 0. The spec's 0.78/0.65 would
reject everything with this model. Thresholds are env-configurable — set
`ASSISTANT_HIGH_THRESHOLD=0.52`, `ASSISTANT_MEDIUM_THRESHOLD=0.40` (tune on real
indexed data). Devanagari-script queries against English content score ~0.05
lower than romanised — widen the medium threshold or add a Hindi content mirror
if Hindi-script recall matters.

## Ingestion
```
cd assistant
npm install
# dry-run (no writes; works without service-role key)
npx tsx src/ingest/cli.ts --source all --dry-run --verbose
# real index (needs SUPABASE_SERVICE_ROLE_KEY)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx src/ingest/cli.ts --source all
```
Flags: `--source static|blogs|knowledge|all --dry-run --limit N --force
--remove-stale --route /x --blog-slug s --verbose`. Only `is_published=true`
blogs are indexed; unchanged chunks skip via `content_hash`.

## Realtime event contract
Client→server: `session.start audio.start audio.chunk audio.stop text.query
response.cancel session.reset ping` (unknown types rejected).
Server→client: `session.ready transcript.partial transcript.final
assistant.thinking assistant.text.delta assistant.text.final assistant.sources
assistant.action assistant.audio.* assistant.cancelled error pong`.
In the zero-cost default STT/TTS are browser-side, so the live path is
`text.query ⇄ assistant.text.*`.

## Run locally
```
# 1. index content (see above)
# 2. assistant-service
cd assistant-service && npm install && PORT=8787 npm start
# 3. gateway
cd assistant-gateway && npm install && PORT=8080 ASSISTANT_SERVICE_URL=http://127.0.0.1:8787 npm start
# 4. frontend
VITE_ASSISTANT_GATEWAY_URL=ws://localhost:8080/v1/realtime npm run dev
```

## Deploy (manual — do NOT auto-deploy)
- **Supabase**: apply `supabase/migrations/20260726120000_create_assistant_brain.sql`
  (review first — creates new tables only, no drops).
- **assistant-service** + **assistant-gateway**: Render/Railway/Fly/VPS
  (persistent WS). Set the shared `ASSISTANT_INTERNAL_GATEWAY_TOKEN`.
- **Frontend**: stays on Vercel. Set `VITE_ASSISTANT_GATEWAY_URL=wss://<gateway-host>/v1/realtime`.
  Never point it at the Vercel domain — there is no WS reverse proxy there.

## Security
Service-role key is backend-only (never a `VITE_` var). Retrieved content is
untrusted: injection strings are neutralised, secrets scrubbed from output,
actions pass a route/section allowlist on both server and client. Session memory
is RLS-blocked from anon/auth (service-role only), TTL-expired.

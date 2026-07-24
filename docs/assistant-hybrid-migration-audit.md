# Assistant Hybrid Migration Audit

This audit supports the staged migration toward a React + Node.js realtime gateway + Python FastAPI AI architecture. It does not delete legacy files. It classifies current assistant, chatbot, voice, WebSocket, and provider-related files based on repository searches for `voice`, `assistant`, `chatbot`, `orb`, `xai`, `grok`, `microphone`, `mediaDevices`, `MediaRecorder`, `AudioContext`, `WebSocket`, `EventSource`, speech recognition/synthesis, `TTS`, and `STT`.

## Classification key

- `KEEP`: Keep as-is; currently useful and not provider-specific runtime voice code.
- `REFACTOR`: Preserve but adapt to the hybrid boundary over time.
- `DISABLE`: Keep the file but prevent runtime mounting/activation through a feature flag or existing absence of mount.
- `REMOVE_LATER`: Candidate for later deletion only after replacement is implemented, tests pass, and references are proven absent.
- `UNKNOWN`: Do not delete; more runtime investigation is required.

## Files reviewed

| File path | Current responsibility | Used today | Provider-specific | Reusable | Should be disabled | May later be deleted | Dependencies | Risks of removal | Classification |
|---|---|---:|---:|---:|---:|---:|---|---|---|
| `assistant-service/app/api/assistant.py` | FastAPI streaming assistant endpoint | Yes | No | Yes | No | No | FastAPI, orchestrator | Removing breaks backend text stream | KEEP |
| `assistant-service/app/services/orchestrator/assistant_orchestrator.py` | Shared text/voice turn orchestration | Yes | No | Yes | No | No | LLM abstraction, retrieval/history/tools/page context providers | Removing duplicates or breaks the assistant brain | KEEP |
| `assistant-service/app/services/llm/openai_compatible.py` | Self-hosted OpenAI-compatible local LLM adapter | Yes | No paid provider dependency | Yes | No | No | httpx, local llama.cpp-compatible server | Removing breaks local LLM bridge | KEEP |
| `assistant-service/app/services/knowledge/*` | Website discovery, cleaning, chunking, embeddings, Qdrant, retrieval, indexing | Yes for Phase 2 | No | Yes | No | No | Qdrant, sentence-transformers optional, local config | Removing breaks grounded retrieval | KEEP |
| `assistant-service/app/services/extensions/speech.py` | No-op future speech provider interface | Yes as future placeholder | No | Yes | No | No | Python typing only | Removing loses planned STT/TTS injection seam | KEEP |
| `assistant-service/tests/*assistant*`, `assistant-service/tests/*knowledge*` | Backend regression tests | Yes | No | Yes | No | No | pytest | Removing lowers safety coverage | KEEP |
| `docs/assistant-phase-0.md` | Phase 0 audit and architecture notes, including removed xAI references as historical guard context | Yes | Historical mentions only | Yes | No | No | Docs only | Removing loses audit trail | KEEP |
| `docs/assistant-phase-3-preflight.md` | Phase 3 gate result | Yes | No | Yes | No | No | Docs only | Removing loses validation record | KEEP |
| `src/test/assistant-xai-removal.test.ts` | Regression guard against restored xAI identifiers | Yes | Mentions xAI only as forbidden patterns | Yes | No | No | Vitest, git | Removing allows provider-specific regressions | KEEP |
| `src/pages/Chatbot.tsx` and `src/components/chatbot/*` | Public product/marketing pages for chatbot offering | Yes via `src/App.tsx` public route | No runtime assistant provider | Yes | No | No | React Router, UI components | Removing breaks public product pages | KEEP |
| `src/components/ChatbotMockup.tsx` | Static marketing/demo mockup | Yes in public website content | No runtime provider | Yes | No | No | React UI | Removing changes public page content | KEEP |
| `src/pages/AIVoiceAgents.tsx` | Public marketing page for AI voice agents | Yes via `src/App.tsx` public route | No runtime microphone/provider | Yes | No | No | React UI | Removing breaks public services page | KEEP |
| `src/pages/WhatsAppAIChatbot.tsx` | Public marketing page for WhatsApp AI chatbot | Yes via `src/App.tsx` public route | No runtime provider | Yes | No | No | React UI | Removing breaks public product page | KEEP |
| `src/lib/assistant-gateway/*` | Browser transport abstraction for the new Node gateway | New foundation | No | Yes | Feature flagged | No | Browser WebSocket | Premature use before gateway readiness could fail connections | REFACTOR |
| `assistant-gateway/*` | New Node realtime gateway foundation | New service | No | Yes | No | No | Fastify, WebSocket, Zod, Pino | Removing blocks hybrid migration | KEEP |
| `public/*template.html` chatbot/voice links | Static templates with public navigation/footer/product/blog content | Build/static assets | No runtime provider | Yes | No | No | Static HTML | Removing may alter SEO or fallback templates | KEEP |
| `api/check-url.ts`, `api/serve-blog.ts`, `api/sitemap-blogs.ts` | Existing Vercel/API utilities and sitemap/blog content | Yes | No runtime provider | Yes | No | No | Vercel functions | Removing may break routing and SEO | KEEP |

## Provider-specific findings

- No active xAI/Grok runtime client was found in the current assistant implementation.
- The remaining `xai` occurrences are historical documentation and the `assistant-xai-removal` regression test, not provider runtime integrations.
- No microphone, `mediaDevices`, `MediaRecorder`, live `AudioContext`, speech recognition, speech synthesis, STT, or TTS runtime implementation was added by this migration foundation.

## Safe deactivation plan

- Add `VITE_ASSISTANT_V2_ENABLED=false` as the frontend feature flag placeholder.
- Keep legacy/static marketing pages mounted exactly as they are because they are public website content, not runtime voice agents.
- Do not mount a new launcher in this foundation; only provide a transport boundary and gateway service.
- Stage 3 deletion remains blocked until replacement UI/gateway behavior is fully implemented, tested, and remotely reviewable.

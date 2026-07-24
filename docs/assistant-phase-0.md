# Phase 0 — Assistant repository inspection and implementation plan

## Phase status

Phase 0 is complete. This phase intentionally adds no production assistant runtime code, no microphone code, no paid-provider integration, and no UI launcher. It documents the current website surface area that later phases must protect, verifies that removed xAI voice identifiers are absent, and proposes the self-hosted architecture and folder structure for the phased implementation.

## xAI removal verification

The repository was searched for the exact removed xAI identifiers required by the phase brief:

- `XAI_API_KEY`
- `VITE_XAI_VOICE_ENABLED`
- `api.x.ai`
- `xai-client-secret`
- `XaiVoice`
- `xaiVoice`
- `agent_ZpYaLI0fdpzwPPAr`

No matches were found in tracked source files. Future phases must keep this invariant and must not build on incomplete xAI code.

## Existing website functionality to protect

### App shell, routing, and layout

- `src/App.tsx` owns the React Router configuration, global providers, page transitions, public layout, admin route isolation, and the public `Header`, `ScrollToTop`, and `WhatsAppFloat` placement.
- The public layout suppresses the public header and WhatsApp float on `/admin` routes.
- `AnimatePresence` and `PageTransition` wrap public routes and must not be bypassed by assistant work.
- `src/routes/publicRoutes.ts` is the source of truth for static public routes, sitemap routes, and intentionally non-indexed public routes.
- `api/check-url.ts` contains an inlined copy of public route data for serverless URL checks and must stay synchronized with `src/routes/publicRoutes.ts`.

### Public routes currently present

Routes that are public and index candidates unless otherwise excluded:

- `/`
- `/about-us`
- `/contact-us`
- `/book-demo`
- `/blog`
- `/case-studies`
- `/solutions/ai-for-smb`
- `/services`
- `/services/ai-strategy-audit`
- `/services/agentic-automation`
- `/services/ai-integration`
- `/services/ai-voice-agents`
- `/services/custom-ai-agents`
- `/services/knowledge-intelligence`
- `/services/sales-ai`
- `/chatbot`
- `/live-chat`
- `/pre-chat-forms`
- `/omni-channel`
- `/whatsapp-ai-chatbot`
- `/whatsapp-shop`
- `/whatsapp-marketing`
- `/agent-capacity`
- `/private-notes`
- `/live-view`
- `/teams`
- `/agent-reports`
- `/csat-report`
- `/team-reports`
- `/inbox-reports`
- `/terms-and-conditions`
- `/privacy-policy`
- `/blog/:slug` for published blog posts
- `/case-studies/:slug` for public case-study detail pages

Public but intentionally excluded from the assistant knowledge index unless a future product decision changes this:

- `/blog-2`
- `/blog-2/:slug`
- `/services/ai-strategy-audit/start`
- `/thank-you`
- `/teams-2` because it redirects to `/teams`
- `/:slug` on the main host because it resolves to 404 outside the blog subdomain

Private or non-public routes that must never be indexed or exposed through tools:

- `/admin/login`
- `/admin`
- `/admin/case-studies`
- `/admin/pricing`
- `/admin/pricing/new`
- `/admin/pricing/:id/edit`
- `/admin/case-studies/new`
- `/admin/case-studies/:id/edit`
- `/admin/blog`
- `/admin/blog/new`
- `/admin/blog/:id/edit`
- `/admin/blog/trash`
- `/admin/blog/categories`
- `/admin/redirects`
- `/admin/activity`
- `/api/*`

### Existing UI and flows to protect

- Header and mobile navigation: `src/components/Header.tsx`.
- WhatsApp floating action button: `src/components/WhatsAppFloat.tsx`; the future assistant launcher must avoid visual overlap.
- Existing chatbot/product demo pages and components: `src/pages/Chatbot.tsx`, `src/components/ChatbotMockup.tsx`, and `src/components/chatbot/*`.
- Contact flows: `src/pages/ContactUs.tsx`, `src/components/ContactFormDialog.tsx`, `src/components/DemoPopup.tsx`, `src/lib/submitContactForm.ts`, and `src/lib/validations/contact.ts`.
- Book-demo flow: `src/pages/BookDemo.tsx`.
- Blog listing and rendering: `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`, `src/pages/Blog2.tsx`, `src/pages/BlogPost2.tsx`, `api/serve-blog.ts`, and blog hooks under `src/hooks`.
- Case studies: `src/pages/CaseStudies.tsx`, `src/pages/CaseStudyDetail.tsx`, `src/hooks/useCaseStudies.ts`, and `src/data/caseStudies.ts`.
- Supabase client and generated database types: `src/integrations/supabase/client.ts` and `src/integrations/supabase/types.ts`.
- Sitemap generation: `api/sitemap.ts`, `api/sitemap-blogs.ts`, and `src/test/sitemap-routes.test.ts`.
- SEO and canonical behavior: `src/lib/seo.ts`, route-level `Helmet` usage, `src/entry-server.tsx`, and prerendering through `scripts/prerender.mjs`.
- Vite/Vercel behavior: `vite.config.ts` and `vercel.json`.
- Analytics/tracking: `src/lib/tracking.ts`; assistant phases must not log message contents, raw audio, personal form values, API secrets, or auth tokens.

## Current Supabase tables and content sources identified

The generated database type currently declares these public tables:

- `case_studies`
- `pricing_plans`

Application code also references these Supabase tables and storage buckets:

- `blog_posts`
- `blog_categories`
- `blog_tags`
- `blog_revisions`
- `blog_related_posts`
- `blog_faqs`
- `blog_authors`
- `blog_images`
- `blog_redirects`
- `blog_activity_log`
- `cms_settings`
- Storage buckets: `blog-images`, `blog-videos`

Approved public content sources for Phase 2 indexing:

- Static public React route content from `src/pages` and related public components.
- `SITEMAP_ROUTES` from `src/routes/publicRoutes.ts`.
- Published, non-deleted Supabase blog posts only: `status = published` and `deleted_at IS NULL`.
- Published case-study data from Supabase `case_studies` and fallback `src/data/caseStudies.ts` where applicable.
- Public pricing data from `pricing_plans` only when rendered on public pages or intentionally included in the public knowledge base.
- Public contact and book-demo information rendered on `/contact-us`, `/book-demo`, footer, terms, privacy, and public service pages.

Content that must never be indexed:

- Admin screens and admin-only tables such as activity logs, revisions, drafts, trash, redirects management, and editor metadata.
- Draft, deleted, or unpublished blog content.
- Private authentication state or Supabase sessions.
- Environment variables, hidden form values, analytics payloads, and personal form submissions.

## Proposed Phase 1–10 folder structure

### Frontend

```text
src/
  assistant/
    config.ts
    types.ts
    brain-contract.ts
    api/
      assistantClient.ts
      streamText.ts
      voiceSocket.ts
    history/
      historyAdapter.ts
      indexedDbHistoryAdapter.ts
      supabaseHistoryAdapter.ts
      summarizationTypes.ts
    memory/
      conversationMemory.ts
    page-context/
      extractCurrentPageContext.ts
      safePageActions.ts
    tools/
      toolSchemas.ts
      routeAllowlist.ts
      navigationTools.ts
    voice/
      audioWorkletClient.ts
      vadClient.ts
      voiceSession.ts
      playbackQueue.ts
      wakeWordClient.ts
  components/
    assistant/
      AssistantLauncher.tsx
      AssistantPanel.tsx
      ConversationSidebar.tsx
      MessageList.tsx
      MessageBubble.tsx
      AssistantComposer.tsx
      VoiceMode.tsx
      SourceCards.tsx
      AssistantSettings.tsx
      AssistantStatus.tsx
  test/
    assistant-xai-removal.test.ts
    assistant-route-policy.test.ts
```

Frontend principles:

- Lazy-load the assistant when `VITE_ASSISTANT_ENABLED=true`.
- Keep all private credentials out of `VITE_` variables.
- Use the existing design system, accessibility patterns, and responsive layout.
- Place the launcher above or offset from `WhatsAppFloat`.
- Request microphone access only from explicit user actions inside voice UI.

### Self-hosted backend

```text
assistant-service/
  pyproject.toml
  README.md
  .env.example
  app/
    main.py
    config.py
    logging.py
    rate_limit.py
    schemas/
      chat.py
      voice.py
      retrieval.py
      tools.py
      history.py
    brain/
      orchestrator.py
      prompts.py
      safety.py
      cancellation.py
      memory.py
    llm/
      openai_compatible_local.py
      llama_cpp.py
    retrieval/
      crawler.py
      chunker.py
      cleaner.py
      embeddings.py
      qdrant_store.py
      reranker.py
      index_manifest.py
    speech/
      stt_faster_whisper.py
      vad_silero.py
      wake_openwakeword.py
      tts_kokoro.py
      tts_piper.py
    tools/
      registry.py
      website_tools.py
      route_policy.py
    history/
      repository.py
      supabase_repository.py
      sqlite_repository.py
    api/
      health.py
      chat.py
      voice_ws.py
      admin_index.py
    tests/
      test_brain_shared.py
      test_retrieval_policy.py
      test_route_policy.py
      test_voice_cancellation.py
```

Backend principles:

- FastAPI service with health endpoint, streaming HTTP/SSE for text, WebSocket for voice, and typed Pydantic models.
- One shared `process_assistant_turn` orchestration path for both text and voice.
- Local OpenAI-compatible LLM adapter aimed at llama.cpp server; no mandatory paid LLM APIs.
- Qdrant as preferred vector store, with a FAISS/SQLite fallback only if deployment constraints require it.
- Protected index rebuild command/admin endpoint only; never public unauthenticated rebuild.

## Proposed local model choices

Because no target production hardware profile is committed in the repo, use a tiered self-hosted configuration:

| Hardware tier | LLM | Serving | Embeddings | STT | TTS |
| --- | --- | --- | --- | --- | --- |
| Low-cost CPU / small VPS | Qwen 2.5/3 3B or 4B Instruct GGUF Q4_K_M | llama.cpp server | `intfloat/multilingual-e5-small` or `BAAI/bge-small-en-v1.5` | Faster-Whisper small/int8 or whisper.cpp small | Piper |
| Single consumer GPU 8–12 GB VRAM | Qwen 2.5/3 7B or 8B Instruct GGUF Q4_K_M/Q5_K_M | llama.cpp server or vLLM-compatible local server | `BAAI/bge-m3` or multilingual E5 base | Faster-Whisper medium | Kokoro TTS |
| Higher-quality GPU 16–24 GB VRAM | Qwen 7B/8B higher quant or 14B quant if latency allows | llama.cpp server or vLLM-compatible local server | `BAAI/bge-m3` | Faster-Whisper medium/large-v3-turbo | Kokoro TTS |

Recommended first development profile:

- LLM: Qwen 3B/4B instruct quantized locally for reliable development on modest hardware.
- Retrieval: Qdrant local Docker and a multilingual embedding model.
- STT: Faster-Whisper small or base for initial hands-free flow, configurable upward.
- VAD: Silero VAD.
- Wake phrase: optional openWakeWord for “Hey Converse” after explicit microphone permission.
- TTS: Kokoro where hardware and licensing fit; Piper fallback for low-resource deployments.

## Environment variables to add in later phases

Frontend-safe examples:

```env
VITE_ASSISTANT_ENABLED=false
VITE_ASSISTANT_API_URL=http://localhost:8090
VITE_ASSISTANT_HISTORY_ENABLED=true
VITE_ASSISTANT_WAKE_WORD_ENABLED=false
```

Backend examples:

```env
LLM_BASE_URL=http://localhost:8081/v1
LLM_MODEL=qwen-local
EMBEDDING_MODEL=BAAI/bge-m3
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=converse_website
STT_MODEL=small
TTS_MODEL=kokoro
TTS_VOICE=af_heart
ALLOWED_ORIGINS=http://localhost:8080,https://theconverseai.com
MAX_SESSION_MINUTES=30
MAX_CONCURRENT_SESSIONS=20
HISTORY_RETENTION_DAYS=30
```

No production assistant environment variables are added in Phase 0.

## Validation expectations for future phases

Future implementation phases must keep these invariants tested:

- No xAI identifiers or paid-provider required secrets are present.
- Text and voice share one assistant brain contract.
- Public indexing excludes `/admin`, `/api`, drafts, deleted posts, unpublished posts, secrets, private records, hidden form values, and analytics data.
- Microphone APIs are not called on page load.
- Raw audio is not stored.
- Tools navigate only to strict allowlisted internal public routes and only after explicit user intent.

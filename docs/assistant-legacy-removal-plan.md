# Assistant Legacy Removal Plan

No files are deleted in this hybrid gateway foundation. The migration uses staged replacement and documentation before removal.

## Keep

- `assistant-service/**`: Keep the Python FastAPI foundation, orchestrator, LLM adapter, Qdrant retrieval, indexing pipeline, security protections, and tests.
- `src/pages/Chatbot.tsx`, `src/components/chatbot/**`, `src/components/ChatbotMockup.tsx`: Keep because these are public marketing/product pages, not provider-specific runtime assistants.
- `src/pages/AIVoiceAgents.tsx`: Keep because it is public marketing content and does not request microphone permission.
- `src/test/assistant-xai-removal.test.ts`: Keep because it prevents xAI/Grok runtime identifiers from returning.
- `docs/assistant-phase-0.md` and `docs/assistant-phase-3-preflight.md`: Keep as audit and validation history.

## Refactor

- `src/lib/assistant-gateway/**`: Refactor only as the UI transport abstraction evolves. It should remain browser-only, feature-flagged, and free of backend secrets.
- Future assistant UI components: when introduced, depend on an `AssistantTransport` abstraction rather than directly on WebSocket or SSE implementation details.

## Temporarily disabled

- No currently mounted provider-specific assistant launcher was found to disable.
- `VITE_ASSISTANT_V2_ENABLED=false` is added as the safe default so any future assistant v2 UI can be gated without activating runtime behavior by default.

## Eligible for later deletion

No file is eligible for deletion yet. A future Stage 3 deletion PR may classify files as removable only after all of the following are true:

1. No runtime imports reference the file.
2. No routes or public navigation depend on the file.
3. No CSS or assets are required by retained UI.
4. No tests depend on it unless replacement tests exist.
5. Replacement gateway/UI behavior is implemented and validated.
6. Frontend TypeScript, tests, and client build pass.
7. Documentation lists the exact file and why deletion is safe.

## Removal risks

- Removing public chatbot or voice-agent pages would damage existing public website routes and SEO.
- Removing the Python service would break the designated AI orchestration boundary.
- Removing xAI-removal tests would reduce protection against reintroducing paid/provider-specific runtime code.

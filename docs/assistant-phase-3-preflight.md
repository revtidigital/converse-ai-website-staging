# Phase 3 Preflight Checklist

Verification date/time: 2026-07-24T10:04:17Z

This preflight verifies the Phase 2 completion gate before any Phase 3 chatbot UI work. No secrets, API keys, complete prompts, full website content, embeddings, private Supabase rows, or environment-file contents are included.

## Repository

| Checklist item | Command or verification method | Actual result | Status | Evidence | Verified at |
|---|---|---:|---|---|---|
| Repository is revtidigital/converse-ai-website-staging | Working directory inspection with `pwd` | Workspace path is `/workspace/converse-ai-website-staging` | PASS | Staging repository workspace only | 2026-07-24T10:04:17Z |
| Target branch is main | `git checkout main` and `git status` | Local `main` branch is unavailable; current branch is `codex/complete-phase-2-knowledge` | BLOCKED | `error: pathspec 'main' did not match any file(s) known to git` | 2026-07-24T10:04:17Z |
| No production repository was accessed | Repository/remote inspection | No production repository was accessed or modified | PASS | Commands were run only in this staging workspace | 2026-07-24T10:04:17Z |
| Phase 2 production implementation exists on remote main | Local implementation file verification plus previously verified remote raw files | Phase 2 production files exist locally; remote sync cannot be performed from shell because no `origin` remote exists | BLOCKED | Required implementation files exist locally; `git pull origin main` failed because `origin` is not configured | 2026-07-24T10:04:17Z |

## Python environment

| Checklist item | Command or verification method | Actual result | Status | Evidence | Verified at |
|---|---|---:|---|---|---|
| Python 3.11 or compatible configured version is available | `python --version` | Python 3.12.13 is available in this shell | PASS | Compatible Python runtime is present, though not Python 3.11 specifically | 2026-07-24T10:04:17Z |
| Phase 2 dependencies are installed | `python -m pytest` imports test dependencies | FastAPI is missing | FAIL | `ModuleNotFoundError: No module named 'fastapi'` | 2026-07-24T10:04:17Z |
| pip check passes | `python -m pip check` | No broken installed packages reported | PASS | `No broken requirements found.` | 2026-07-24T10:04:17Z |
| pytest passes | `python -m pytest` | pytest did not execute the suite because FastAPI is missing | FAIL | ImportError while loading `tests/conftest.py` | 2026-07-24T10:04:17Z |
| Ruff passes | `python -m ruff check .` from `assistant-service` | Ruff passed | PASS | `All checks passed!` | 2026-07-24T10:04:17Z |
| mypy passes | `python -m mypy .` from `assistant-service` | mypy failed before checking code because Pydantic is missing | FAIL | `Error importing plugin "pydantic.mypy": No module named 'pydantic'` | 2026-07-24T10:04:17Z |
| compileall passes | `python -m compileall .` from `assistant-service` | compileall completed successfully | PASS | Python files compiled without syntax errors | 2026-07-24T10:04:17Z |

## Knowledge infrastructure

| Checklist item | Command or verification method | Actual result | Status | Evidence | Verified at |
|---|---|---:|---|---|---|
| Docker is available | `docker --version` | Docker is unavailable | BLOCKED | `docker: command not found` | 2026-07-24T10:04:17Z |
| Real Qdrant is running | `docker ps` and `docker logs converse-qdrant` | Cannot verify; Docker is unavailable | BLOCKED | `docker: command not found` | 2026-07-24T10:04:17Z |
| Qdrant collection exists | Safe Qdrant runtime check | Not verified; Qdrant is not running | BLOCKED | Docker/Qdrant unavailable | 2026-07-24T10:04:17Z |
| Qdrant vector dimension is 384 | Safe collection inspection | Not verified; Qdrant is not running | BLOCKED | Docker/Qdrant unavailable | 2026-07-24T10:04:17Z |
| Qdrant distance is cosine | Safe collection inspection | Not verified; Qdrant is not running | BLOCKED | Docker/Qdrant unavailable | 2026-07-24T10:04:17Z |
| Real sentence-transformer model loads | Runtime model initialization | Not verified; sentence-transformers dependencies are unavailable | BLOCKED | FastAPI/Pydantic dependency stack is missing; model package cannot be validated | 2026-07-24T10:04:17Z |
| Embedding output dimension is 384 | Runtime embedding check | Not verified | BLOCKED | Real model did not load | 2026-07-24T10:04:17Z |
| query: prefix is used for queries | Source inspection of `SentenceTransformerEmbeddingClient.embed_query` | Query prefix is present | PASS | Query input is encoded with `query: ` prefix | 2026-07-24T10:04:17Z |
| passage: prefix is used for documents | Source inspection of `SentenceTransformerEmbeddingClient.embed_documents` | Passage prefix is present | PASS | Document input is encoded with `passage: ` prefix | 2026-07-24T10:04:17Z |

## Indexing

| Checklist item | Command or verification method | Actual result | Status | Evidence | Verified at |
|---|---|---:|---|---|---|
| Dry-run indexing passes | `python -m app.commands.rebuild_knowledge --mode dry-run` | Not run safely because dependencies and Qdrant are unavailable | BLOCKED | FastAPI/Pydantic/Qdrant/embedding stack is unavailable | 2026-07-24T10:04:17Z |
| Dry-run performs no writes | Runtime dry-run plus manifest/vector-store inspection | Not verified | BLOCKED | Dry-run indexing was blocked | 2026-07-24T10:04:17Z |
| Full indexing passes | Full indexing only when safe | Not run | BLOCKED | Qdrant and real embeddings are unavailable; safe full rebuild conditions are not met | 2026-07-24T10:04:17Z |
| Approved public content is indexed | Qdrant payload/manifest inspection after full indexing | Not verified | BLOCKED | Full indexing was not run | 2026-07-24T10:04:17Z |
| Admin, API and private routes are excluded | Source inspection and route-policy tests when executable | Route policy contains exclusions, but executable tests are blocked | BLOCKED | `/admin`, `/api`, and excluded routes are rejected in code; pytest cannot run | 2026-07-24T10:04:17Z |
| Draft and deleted content is excluded | Supabase adapter/test execution | Not runtime verified | BLOCKED | pytest and live Supabase validation are blocked | 2026-07-24T10:04:17Z |
| Incremental indexing skips unchanged sources | `python -m app.commands.rebuild_knowledge --mode incremental` | Not run | BLOCKED | Dependency/Qdrant/embedding stack unavailable | 2026-07-24T10:04:17Z |
| Stale-source removal works | Qdrant stale-vector deletion check | Not runtime verified | BLOCKED | Qdrant unavailable | 2026-07-24T10:04:17Z |
| Qdrant payload contains only public-safe metadata | Source inspection and runtime payload sampling | Source mapping is public-safe; runtime payload sampling not possible | BLOCKED | Qdrant payload mapping excludes secrets, but no live Qdrant payload exists to inspect | 2026-07-24T10:04:17Z |

## Assistant backend

| Checklist item | Command or verification method | Actual result | Status | Evidence | Verified at |
|---|---|---:|---|---|---|
| GET /health returns HTTP 200 | FastAPI runtime request | Not run | BLOCKED | FastAPI dependency is missing | 2026-07-24T10:04:17Z |
| GET /health does not call the LLM | Backend test/runtime verification | Not runtime verified | BLOCKED | pytest cannot run because FastAPI is missing | 2026-07-24T10:04:17Z |
| GET /health/ready reports safe dependency status | FastAPI runtime request | Not run | BLOCKED | FastAPI dependency is missing | 2026-07-24T10:04:17Z |
| POST /v1/assistant/stream works | FastAPI runtime request | Not run | BLOCKED | FastAPI dependency is missing and no LLM service is running | 2026-07-24T10:04:17Z |
| English retrieval works | Runtime assistant retrieval query | Not verified | BLOCKED | Qdrant, embeddings, indexing, and FastAPI runtime unavailable | 2026-07-24T10:04:17Z |
| Hinglish retrieval works | Runtime assistant retrieval query | Not verified | BLOCKED | Qdrant, embeddings, indexing, and FastAPI runtime unavailable | 2026-07-24T10:04:17Z |
| Source metadata is returned | Runtime streaming completed event | Not verified | BLOCKED | Assistant stream unavailable | 2026-07-24T10:04:17Z |
| Unknown/private questions do not produce invented facts | Runtime assistant retrieval query | Not verified | BLOCKED | Assistant stream unavailable | 2026-07-24T10:04:17Z |
| inputMode=text and inputMode=voice use the same orchestrator | Source inspection plus backend tests | Source contract exists; executable verification blocked | BLOCKED | Backend tests cannot run because FastAPI is missing | 2026-07-24T10:04:17Z |
| Prompt-injection protection passes | Backend tests/runtime prompt-injection check | Not verified at runtime | BLOCKED | pytest and live assistant runtime unavailable | 2026-07-24T10:04:17Z |

## Existing frontend

| Checklist item | Command or verification method | Actual result | Status | Evidence | Verified at |
|---|---|---:|---|---|---|
| npm install passes | `npm install` | Passed | PASS | Dependencies already up to date; npm emitted non-fatal proxy config warning | 2026-07-24T10:04:17Z |
| npx tsc --noEmit passes | `npx tsc --noEmit` | Passed | PASS | TypeScript completed with exit code 0 | 2026-07-24T10:04:17Z |
| npm run test passes | `npm run test` | Passed | PASS | Vitest: 4 files passed, 14 tests passed | 2026-07-24T10:04:17Z |
| npm run build:client passes | `npm run build:client` | Passed | PASS | Vite client build completed; non-fatal Browserslist/chunk-size warnings | 2026-07-24T10:04:17Z |
| Existing Header remains unchanged | Git status / no Phase 3 UI modifications | No frontend code changes were made | PASS | Working tree only contains this preflight document | 2026-07-24T10:04:17Z |
| Existing mobile navigation remains unchanged | Git status / no Phase 3 UI modifications | No frontend code changes were made | PASS | Working tree only contains this preflight document | 2026-07-24T10:04:17Z |
| Existing WhatsAppFloat remains functional | No code changes plus existing frontend build/tests | Not directly manually exercised; no code modifications were made | PASS | Frontend checks passed and component code was untouched | 2026-07-24T10:04:17Z |
| Existing contact and book-demo flows remain functional | No code changes plus existing frontend build/tests | Not directly manually exercised; no code modifications were made | PASS | Frontend checks passed and flow code was untouched | 2026-07-24T10:04:17Z |
| Existing blog and case-study pages remain functional | No code changes plus existing frontend build/tests | Not directly manually exercised; no code modifications were made | PASS | Frontend checks passed and page code was untouched | 2026-07-24T10:04:17Z |
| Existing admin routes remain functional | No code changes plus existing frontend build/tests | Not directly manually exercised; no code modifications were made | PASS | Frontend checks passed and admin route code was untouched | 2026-07-24T10:04:17Z |
| Existing SEO, sitemap and analytics remain functional | No code changes plus existing frontend build/tests | Not directly manually exercised; no code modifications were made | PASS | Frontend checks passed and SEO/sitemap/analytics code was untouched | 2026-07-24T10:04:17Z |

## Phase decision

| Checklist item | Command or verification method | Actual result | Status | Evidence | Verified at |
|---|---|---:|---|---|---|
| Phase 2 is fully verified | Completion gate review | Phase 2 is not fully verified in this environment | FAIL | Dependencies, pytest, mypy, Docker/Qdrant, real embeddings, indexing, and backend runtime checks are not all passing | 2026-07-24T10:04:17Z |
| Phase 3 may begin | Gate decision | Phase 3 must not begin | FAIL | Required preflight items are FAIL or BLOCKED | 2026-07-24T10:04:17Z |

## Blocking summary

Phase 3 is blocked by Phase 2 preflight failures and blockers:

1. Python dependencies are not installed: `fastapi` and `pydantic` are missing.
2. `python -m pytest` fails before executing the suite.
3. `python -m mypy .` fails because the Pydantic mypy plugin cannot import `pydantic`.
4. Docker is not installed, so real Qdrant cannot be verified.
5. Real sentence-transformer model loading and 384-dimensional runtime output cannot be verified.
6. Dry-run, full, and incremental indexing cannot be safely verified.
7. FastAPI health/readiness/streaming endpoints cannot be runtime verified.
8. English, Hinglish, unknown/private, source metadata, text/voice consistency, and prompt-injection assistant checks cannot be runtime verified.

Next command required to continue once package access is available:

```bash
cd assistant-service && python -m pip install -e ".[dev,knowledge]"
```

Next command required to continue once Docker is available:

```bash
docker run --name converse-qdrant -p 6333:6333 -p 6334:6334 -v converse-qdrant-data:/qdrant/storage qdrant/qdrant
```

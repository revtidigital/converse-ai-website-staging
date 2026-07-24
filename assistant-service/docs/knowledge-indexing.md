# Phase 2 Knowledge Indexing

Phase 2 adds a website knowledge pipeline for grounded retrieval over approved published Converse website content.

## Architecture

Discovery -> route policy -> fetch/extract -> clean -> document model -> checksum -> manifest compare -> heading-aware chunking -> local embeddings -> Qdrant upsert/search -> retrieval provider -> shared orchestrator.

## Route policy

The central route policy accepts approved public static routes and dynamic blog/case-study routes, normalizes fragments/query/trailing slashes, and rejects external URLs, `javascript:`, `data:`, control characters, encoded traversal, `/admin`, and `/api`.

## Extraction and cleaning

The HTML extractor reads titles, headings, paragraphs and list items without executing JavaScript. It removes scripts, styles, SVGs, hidden content and empty containers. The cleaner normalizes Unicode/whitespace, preserves numbers, prices, dates and punctuation, removes exact duplicate paragraphs and boilerplate, and rejects empty/noisy content.

## Chunking and checksums

Chunking is heading-aware and sentence-aware with configurable size, overlap, maximum chunks and deterministic IDs. Checksums are normalized SHA-256 hashes for source content, cleaned content, chunks, index version and embedding model version.

## Embeddings

The default documented local multilingual model is `intfloat/multilingual-e5-small` (MIT license per model card at time of selection). Automated tests use deterministic fake embeddings and do not download weights. Configure `EMBEDDING_MODEL`, `EMBEDDING_DEVICE`, `EMBEDDING_BATCH_SIZE`, and dimensions.

## Qdrant

Qdrant remains a separate service. Configure `QDRANT_URL`, optional `QDRANT_API_KEY`, `QDRANT_COLLECTION`, vector dimension, timeout and distance metric. Payloads include only public safe chunk/source metadata and chunk content; never store secrets, raw HTML, private rows or user data.

## Indexing CLI

```bash
python -m app.commands.rebuild_knowledge --mode full
python -m app.commands.rebuild_knowledge --mode incremental
python -m app.commands.rebuild_knowledge --mode dry-run
```

The CLI prints safe summary counts only. It does not print complete content or secrets.

## Internal reindex endpoint

`POST /internal/knowledge/reindex` is unavailable unless `KNOWLEDGE_INDEX_ADMIN_TOKEN` is configured. It requires a bearer token checked with constant-time comparison and returns a safe summary only. The CLI remains preferred.

## Retrieval rules

Retrieval embeds the query, fetches more candidates than returned, applies score threshold, deduplicates chunks, diversifies routes, applies a bounded current-route boost, bounds total context characters, returns safe source metadata, and supports English/Hinglish/simple Latin-script Hindi through multilingual embeddings.

## Prompt-injection protection

Retrieved content is delimited as untrusted reference material and cannot override system instructions, route policy, secret handling or tool restrictions. Suspicious text remains data, not commands.

## Phase 2 limitations and Phase 3 boundary

No chatbot UI, conversation persistence, microphone capture, STT, TTS, hands-free mode, wake word or website action tools are included. Phase 3 should add React text-chat UI and source cards.

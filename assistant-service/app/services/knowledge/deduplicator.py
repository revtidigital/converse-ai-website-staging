from app.services.knowledge.checksums import normalized_checksum
from app.services.knowledge.models import KnowledgeChunk, KnowledgeSource


def deduplicate_sources(sources: list[KnowledgeSource]) -> list[KnowledgeSource]:
    seen_routes: set[str] = set()
    seen_content: set[str] = set()
    result: list[KnowledgeSource] = []
    for source in sources:
        content_hash = normalized_checksum("\n".join(section.content for section in source.sections))
        if source.route in seen_routes or content_hash in seen_content:
            continue
        seen_routes.add(source.route)
        seen_content.add(content_hash)
        result.append(source)
    return result


def deduplicate_chunks(chunks: list[KnowledgeChunk]) -> list[KnowledgeChunk]:
    seen: set[str] = set()
    result: list[KnowledgeChunk] = []
    for chunk in chunks:
        key = normalized_checksum(chunk.content)
        if key in seen:
            continue
        seen.add(key)
        result.append(chunk)
    return result

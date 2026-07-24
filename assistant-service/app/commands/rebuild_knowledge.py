import argparse
import asyncio
from pathlib import Path

from app.services.knowledge.chunker import HeadingAwareChunker
from app.services.knowledge.config import KnowledgeSettings
from app.services.knowledge.embedding_local import DeterministicLocalEmbeddingClient
from app.services.knowledge.index_coordinator import KnowledgeIndexCoordinator
from app.services.knowledge.index_manifest import JsonIndexManifestStore
from app.services.knowledge.qdrant_store import QdrantVectorStore


def main() -> int:
    parser = argparse.ArgumentParser(description="Rebuild Converse website knowledge index")
    parser.add_argument("--mode", choices=["full", "incremental", "dry-run"], default="incremental")
    args = parser.parse_args()
    settings = KnowledgeSettings()
    chunker = HeadingAwareChunker(max_characters=settings.knowledge_chunk_max_characters, overlap_characters=settings.knowledge_chunk_overlap_characters, max_chunks=settings.knowledge_max_chunks_per_source, index_version=settings.knowledge_index_version)
    coordinator = KnowledgeIndexCoordinator(chunker=chunker, embedding_client=DeterministicLocalEmbeddingClient(dimension=settings.embedding_vector_dimension, batch_size=settings.embedding_batch_size), vector_store=QdrantVectorStore(dimension=settings.qdrant_vector_dimension), manifest=JsonIndexManifestStore(Path(".knowledge/index-manifest.json")), embedding_model=settings.embedding_model, embedding_dimension=settings.embedding_vector_dimension)
    summary = asyncio.run(coordinator.run([], mode=args.mode))
    print(summary.model_dump_json())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

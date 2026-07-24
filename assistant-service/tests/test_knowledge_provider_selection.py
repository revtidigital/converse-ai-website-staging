import pytest

from app.services.knowledge.config import KnowledgeSettings


def test_knowledge_disabled_defaults_safe() -> None:
    settings = KnowledgeSettings(KNOWLEDGE_ENABLED="false")
    assert not settings.knowledge_enabled


def test_production_rejects_fake_providers() -> None:
    with pytest.raises(ValueError):
        KnowledgeSettings(ASSISTANT_ENVIRONMENT="production", KNOWLEDGE_VECTOR_STORE="memory")
    with pytest.raises(ValueError):
        KnowledgeSettings(ASSISTANT_ENVIRONMENT="production", EMBEDDING_PROVIDER="deterministic")

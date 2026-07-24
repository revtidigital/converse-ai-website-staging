import pytest

from app.services.knowledge.embedding_local import DeterministicLocalEmbeddingClient


async def test_embedding_success_and_dimension() -> None:
    c = DeterministicLocalEmbeddingClient(dimension=8, batch_size=2)
    assert len(await c.embed_query("hello Hinglish")) == 8
    assert len(await c.embed_documents(["a", "b"])) == 2


async def test_embedding_rejects_empty_and_batch_bounds() -> None:
    c = DeterministicLocalEmbeddingClient(dimension=8, batch_size=1)
    with pytest.raises(ValueError):
        await c.embed_query(" ")
    with pytest.raises(ValueError):
        await c.embed_documents(["a", "b"])

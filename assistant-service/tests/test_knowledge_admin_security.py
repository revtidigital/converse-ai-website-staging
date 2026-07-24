from app.api.knowledge_admin import reindex
from app.services.knowledge.config import KnowledgeSettings


async def test_admin_missing_token_rejected() -> None:
    try:
        await reindex(authorization=None, settings=KnowledgeSettings(KNOWLEDGE_INDEX_ADMIN_TOKEN=""))
    except Exception as exc:
        assert exc.status_code == 404


async def test_admin_correct_token_accepted() -> None:
    result = await reindex(authorization="Bearer token", settings=KnowledgeSettings(KNOWLEDGE_INDEX_ADMIN_TOKEN="token"))
    assert result.discovered == 0

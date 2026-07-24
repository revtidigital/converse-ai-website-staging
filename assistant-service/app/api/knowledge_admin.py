import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.services.knowledge.config import KnowledgeSettings
from app.services.knowledge.models import IndexSummary

router = APIRouter(prefix="/internal/knowledge")


def knowledge_settings_dependency() -> KnowledgeSettings:
    return KnowledgeSettings()


@router.post("/reindex", response_model=IndexSummary)
async def reindex(
    authorization: str | None = Header(default=None),
    settings: KnowledgeSettings = Depends(knowledge_settings_dependency),
) -> IndexSummary:
    expected = settings.knowledge_index_admin_token.get_secret_value() if settings.knowledge_index_admin_token else None
    if not expected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    provided = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return IndexSummary()

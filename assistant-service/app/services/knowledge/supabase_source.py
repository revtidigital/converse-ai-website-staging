from datetime import UTC, datetime
from typing import Any

from app.services.knowledge.checksums import normalized_checksum
from app.services.knowledge.content_cleaner import clean_text
from app.services.knowledge.models import ContentType, KnowledgeSource, SourceSection


def blog_row_to_source(row: dict[str, Any], *, base_url: str) -> KnowledgeSource | None:
    if row.get("status") != "published" or row.get("deleted_at") is not None or not row.get("slug"):
        return None
    content_parts = [row.get("excerpt") or "", row.get("content") or row.get("body") or ""]
    content = clean_text("\n\n".join(part for part in content_parts if part), max_characters=100000)
    route = f"/blog/{row['slug']}"
    updated = row.get("updated_at") or row.get("publish_date") or datetime.now(UTC).isoformat()
    source = KnowledgeSource(source_id=f"blog:{row['slug']}", route=route, canonical_url=row.get("canonical_url") or f"{base_url.rstrip('/')}{route}", page_title=row.get("title") or row["slug"], content_type=ContentType.BLOG, updated_at=_dt(updated), sections=[SourceSection(heading=row.get("title") or "Blog", heading_level=1, heading_path=[row.get("title") or "Blog"], content=content)])
    source.checksum = normalized_checksum(content)
    return source


def case_study_row_to_source(row: dict[str, Any], *, base_url: str) -> KnowledgeSource | None:
    if not row.get("slug"):
        return None
    route = f"/case-studies/{row['slug']}"
    fields = ["client_name", "industry", "challenge", "solution", "results", "description"]
    content = clean_text("\n\n".join(str(row.get(field) or "") for field in fields), max_characters=100000)
    source = KnowledgeSource(source_id=f"case-study:{row['slug']}", route=route, canonical_url=f"{base_url.rstrip('/')}{route}", page_title=row.get("title") or row.get("client_name") or row["slug"], content_type=ContentType.CASE_STUDY, updated_at=_dt(row.get("updated_at") or datetime.now(UTC).isoformat()), sections=[SourceSection(heading=row.get("title") or "Case study", heading_level=1, heading_path=[row.get("title") or "Case study"], content=content)])
    source.checksum = normalized_checksum(content)
    return source


def pricing_row_to_source(row: dict[str, Any], *, base_url: str) -> KnowledgeSource | None:
    if row.get("is_active") is False:
        return None
    name = row.get("name") or row.get("plan_name") or "Pricing"
    content = clean_text("\n\n".join(str(row.get(field) or "") for field in ["name", "description", "price", "features"]), max_characters=20000)
    source = KnowledgeSource(source_id=f"pricing:{name}", route="/services", canonical_url=f"{base_url.rstrip('/')}/services", page_title=f"Pricing: {name}", content_type=ContentType.PRICING, sections=[SourceSection(heading=name, heading_level=2, heading_path=["Pricing", name], content=content)])
    source.checksum = normalized_checksum(content)
    return source


def _dt(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")) if isinstance(value, str) else datetime.now(UTC)

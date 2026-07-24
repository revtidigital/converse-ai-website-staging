import asyncio
from dataclasses import dataclass

import httpx

from app.services.knowledge.checksums import normalized_checksum
from app.services.knowledge.content_extractor import extract_public_html
from app.services.knowledge.models import ContentType, KnowledgeSource
from app.services.knowledge.route_policy import RoutePolicy


@dataclass(frozen=True, slots=True)
class HtmlSourceClient:
    base_url: str
    allowed_domains: list[str]
    timeout_seconds: float

    async def fetch_source(self, route: str, *, cancellation_event: asyncio.Event | None = None) -> KnowledgeSource:
        policy = RoutePolicy(self.allowed_domains)
        decision = policy.normalize(route)
        if not decision.allowed or not decision.route:
            raise ValueError("route is not indexable")
        if cancellation_event and cancellation_event.is_set():
            raise asyncio.CancelledError
        async with httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout_seconds, follow_redirects=False) as client:
            response = await client.get(decision.route)
        if 300 <= response.status_code < 400:
            location = response.headers.get("location", "")
            redirect = policy.normalize(location)
            if not redirect.allowed:
                raise ValueError("unsafe redirect")
            return await self.fetch_source(redirect.route or "/", cancellation_event=cancellation_event)
        response.raise_for_status()
        title, sections = extract_public_html(response.text)
        source = KnowledgeSource(source_id=normalized_checksum(decision.route)[:40], route=decision.route, canonical_url=f"{self.base_url.rstrip('/')}{decision.route}", page_title=title, content_type=_content_type(decision.route), sections=sections)
        source.checksum = normalized_checksum("\n".join(section.content for section in sections))
        return source


def _content_type(route: str) -> ContentType:
    if route == "/":
        return ContentType.HOME
    if route.startswith("/services"):
        return ContentType.SERVICE
    if route.startswith("/solutions"):
        return ContentType.SOLUTION
    if route.startswith("/blog/"):
        return ContentType.BLOG
    if route.startswith("/case-studies/"):
        return ContentType.CASE_STUDY
    if route == "/privacy-policy":
        return ContentType.PRIVACY
    if route == "/terms-and-conditions":
        return ContentType.TERMS
    if route in {"/contact-us", "/book-demo"}:
        return ContentType.CONTACT
    return ContentType.PAGE

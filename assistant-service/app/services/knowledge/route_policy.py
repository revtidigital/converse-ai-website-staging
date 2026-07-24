from dataclasses import dataclass
from urllib.parse import parse_qsl, quote, unquote, urlencode, urlparse, urlunparse

STATIC_APPROVED_ROUTES = {
    "/", "/about-us", "/contact-us", "/book-demo", "/blog", "/case-studies",
    "/solutions/ai-for-smb", "/services", "/services/ai-strategy-audit",
    "/services/agentic-automation", "/services/ai-integration", "/services/ai-voice-agents",
    "/services/custom-ai-agents", "/services/knowledge-intelligence", "/services/sales-ai",
    "/chatbot", "/live-chat", "/pre-chat-forms", "/omni-channel",
    "/whatsapp-ai-chatbot", "/whatsapp-shop", "/whatsapp-marketing", "/agent-capacity",
    "/live-view", "/teams", "/agent-reports", "/csat-report", "/team-reports",
    "/inbox-reports", "/terms-and-conditions", "/privacy-policy",
}
EXCLUDED_ROUTES = {"/blog-2", "/services/ai-strategy-audit/start", "/thank-you", "/private-notes"}
_ALLOWED_QUERY_KEYS = {"page", "category", "tag"}


@dataclass(frozen=True, slots=True)
class RouteDecision:
    allowed: bool
    route: str | None
    canonical_route: str | None
    reason: str


class RoutePolicy:
    def __init__(self, allowed_domains: list[str] | None = None) -> None:
        self.allowed_domains = {domain.lower() for domain in (allowed_domains or [])}

    def normalize(self, value: str) -> RouteDecision:
        if not value or any(ord(ch) < 32 or ord(ch) == 127 for ch in value):
            return RouteDecision(False, None, None, "malformed")
        parsed = urlparse(value.strip())
        if parsed.scheme in {"javascript", "data"}:
            return RouteDecision(False, None, None, "unsafe_scheme")
        if (parsed.scheme or parsed.netloc) and (
            parsed.scheme not in {"http", "https"} or parsed.hostname not in self.allowed_domains
        ):
            return RouteDecision(False, None, None, "external")
        path = parsed.path or "/"
        decoded = unquote(path)
        if ".." in decoded or "%2e" in path.lower() or "\\" in decoded:
            return RouteDecision(False, None, None, "path_traversal")
        path = quote(decoded, safe="/-._~")
        if not path.startswith("/") or path.startswith("//"):
            return RouteDecision(False, None, None, "malformed")
        if len(path) > 1:
            path = path.rstrip("/")
        if path == "/admin" or path.startswith("/admin/") or path == "/api" or path.startswith("/api/"):
            return RouteDecision(False, path, path, "private")
        if path in EXCLUDED_ROUTES:
            return RouteDecision(False, path, path, "excluded")
        query_pairs = [(k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=False) if k in _ALLOWED_QUERY_KEYS]
        query = urlencode(query_pairs)
        route = urlunparse(("", "", path, "", query, ""))
        if self.is_approved_route(path):
            return RouteDecision(True, route, route, "approved")
        return RouteDecision(False, route, route, "not_allowlisted")

    def is_approved_route(self, path: str) -> bool:
        if path in STATIC_APPROVED_ROUTES:
            return True
        if path.startswith("/blog/") and len(path.split("/")) == 3:
            return True
        return bool(path.startswith("/case-studies/") and len(path.split("/")) == 3)

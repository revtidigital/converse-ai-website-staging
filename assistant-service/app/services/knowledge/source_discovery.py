from app.services.knowledge.models import KnowledgeSource
from app.services.knowledge.route_policy import RoutePolicy
from app.services.knowledge.static_routes import repository_static_routes


def discover_static_routes(*, allowed_domains: list[str], max_sources: int) -> list[str]:
    policy = RoutePolicy(allowed_domains)
    routes: list[str] = []
    seen: set[str] = set()
    for route in repository_static_routes():
        decision = policy.normalize(route)
        if decision.allowed and decision.route and decision.route not in seen:
            seen.add(decision.route)
            routes.append(decision.route)
        if len(routes) >= max_sources:
            break
    return routes


def dedupe_discovered_sources(sources: list[KnowledgeSource], *, max_sources: int) -> list[KnowledgeSource]:
    seen: set[str] = set()
    result: list[KnowledgeSource] = []
    for source in sources:
        if source.route in seen:
            continue
        seen.add(source.route)
        result.append(source)
        if len(result) >= max_sources:
            break
    return result

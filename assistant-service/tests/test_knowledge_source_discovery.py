from app.services.knowledge.source_discovery import discover_static_routes


def test_static_routes_discovered_and_bounded() -> None:
    routes = discover_static_routes(allowed_domains=["localhost"], max_sources=3)
    assert len(routes) == 3
    assert all(route.startswith("/") for route in routes)
    assert "/admin" not in routes and "/api" not in routes

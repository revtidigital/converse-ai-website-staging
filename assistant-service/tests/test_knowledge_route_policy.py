from app.services.knowledge.route_policy import RoutePolicy


def test_route_policy_accepts_public_and_normalizes() -> None:
    d = RoutePolicy(["example.com"]).normalize("https://example.com/services/?utm=1#x")
    assert d.allowed and d.route == "/services"


def test_route_policy_rejects_private_and_unsafe() -> None:
    p = RoutePolicy(["example.com"])
    for route in [
        "/admin", "/admin/x", "/api", "/api/x", "/private-notes", "//evil.test/path",
        "https://evil.test/", "javascript:alert(1)", "data:text/plain,x", "file:///tmp/x",
        "blob:https://example.com/x", "/x/%2e%2e/admin", "/x/%2Fadmin", "/x/%5Cadmin",
        "/bad/%zz", "/bad\x00route",
    ]:
        assert not p.normalize(route).allowed


def test_route_policy_accepts_dynamic_public_routes() -> None:
    policy = RoutePolicy(["example.com"])
    assert policy.normalize("/blog/my-post").allowed
    assert policy.normalize("/case-studies/client-win").allowed

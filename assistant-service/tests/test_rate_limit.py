import time

from app.core.rate_limit import InMemoryRateLimiter


def test_rate_limit_returns_429(client) -> None:
    from app.api.dependencies import rate_limiter_dependency
    from app.main import app
    app.dependency_overrides[rate_limiter_dependency] = lambda: InMemoryRateLimiter(1, 60)
    payload = {"conversationId":"c","message":"hi","inputMode":"text"}
    assert client.post("/v1/assistant/stream", json=payload).status_code == 200
    assert client.post("/v1/assistant/stream", json=payload).status_code == 429


def test_stale_limiter_data_cleaned() -> None:
    limiter = InMemoryRateLimiter(1, 1)
    assert limiter.allow("a")[0]
    time.sleep(1.01)
    assert limiter.allow("a")[0]

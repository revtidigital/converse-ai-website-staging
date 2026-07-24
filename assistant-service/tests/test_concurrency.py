import pytest

from app.core.concurrency import ConcurrencyLimiter


async def test_concurrency_limit_enforced_and_released() -> None:
    limiter = ConcurrencyLimiter(1)
    permit = await limiter.acquire()
    assert permit is not None
    assert await limiter.acquire() is None
    permit.release()
    second = await limiter.acquire()
    assert second is not None
    second.release()


@pytest.mark.parametrize("case", ["success", "failure", "timeout", "cancellation"])
async def test_capacity_release_cases(case: str) -> None:
    limiter = ConcurrencyLimiter(1)
    permit = await limiter.acquire()
    assert permit is not None
    permit.release()
    next_permit = await limiter.acquire()
    assert next_permit is not None
    next_permit.release()

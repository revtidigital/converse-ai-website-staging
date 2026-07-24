import asyncio
from dataclasses import dataclass


@dataclass(slots=True)
class ConcurrencyPermit:
    limiter: "ConcurrencyLimiter"
    acquired: bool = True

    def release(self) -> None:
        if self.acquired:
            self.acquired = False
            self.limiter.release()


class ConcurrencyLimiter:
    def __init__(self, limit: int) -> None:
        self._limit = limit
        self._in_use = 0
        self._lock = asyncio.Lock()

    async def acquire(self) -> ConcurrencyPermit | None:
        async with self._lock:
            if self._in_use >= self._limit:
                return None
            self._in_use += 1
            return ConcurrencyPermit(self)

    def release(self) -> None:
        if self._in_use > 0:
            self._in_use -= 1

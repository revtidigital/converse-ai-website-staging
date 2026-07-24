import time
from collections import deque
from dataclasses import dataclass, field


@dataclass
class InMemoryRateLimiter:
    max_requests: int
    window_seconds: int
    max_identities: int = 2048
    _hits: dict[str, deque[float]] = field(default_factory=dict)

    def allow(self, identity: str) -> tuple[bool, int]:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        for key in list(self._hits.keys()):
            q = self._hits[key]
            while q and q[0] <= cutoff:
                q.popleft()
            if not q:
                del self._hits[key]
        q = self._hits.setdefault(identity, deque())
        while q and q[0] <= cutoff:
            q.popleft()
        if len(q) >= self.max_requests:
            retry = max(1, int(self.window_seconds - (now - q[0])))
            return False, retry
        q.append(now)
        if len(self._hits) > self.max_identities:
            self._hits.pop(next(iter(self._hits)))
        return True, 0

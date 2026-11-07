from collections import deque


class RateLimited(Exception):
    def __init__(self, retry_after: float) -> None:
        super().__init__(f"retry after {retry_after:.1f}s")
        self.retry_after = retry_after


# Скользящее окно в памяти процесса: сервис один, а перезапуск честно обнуляет счётчики.
class RateLimiter:
    def __init__(self, max_keys: int = 50_000) -> None:
        self._hits: dict[str, deque[float]] = {}
        self._max_keys = max_keys

    def hit(self, key: str, window: tuple[float, int], now: float) -> None:
        seconds, limit = window
        hits = self._hits.setdefault(f"{seconds}:{key}", deque())
        while hits and hits[0] <= now - seconds:
            hits.popleft()
        if len(hits) >= limit:
            raise RateLimited(retry_after=hits[0] + seconds - now)
        hits.append(now)
        if len(self._hits) > self._max_keys:
            self._evict(now)

    def _evict(self, now: float) -> None:
        for key in list(self._hits):
            seconds = float(key.split(":", 1)[0])
            hits = self._hits[key]
            if not hits or hits[-1] <= now - seconds:
                del self._hits[key]

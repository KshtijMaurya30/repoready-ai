from collections import defaultdict, deque
from time import monotonic

from fastapi import HTTPException, Request, status

from app.core.config import get_settings


_requests: dict[str, deque[float]] = defaultdict(deque)


def enforce_demo_rate_limit(request: Request, bucket: str) -> None:
    """Small process-local limiter for the MVP; use Redis or a gateway in production."""

    settings = get_settings()
    now = monotonic()
    client_host = request.client.host if request.client else "unknown"
    key = f"{client_host}:{bucket}"
    timestamps = _requests[key]
    while timestamps and now - timestamps[0] >= 60:
        timestamps.popleft()
    if len(timestamps) >= settings.rate_limit_per_minute:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demo request limit reached. Please wait a minute and try again.",
        )
    timestamps.append(now)


def clear_rate_limit_state() -> None:
    _requests.clear()


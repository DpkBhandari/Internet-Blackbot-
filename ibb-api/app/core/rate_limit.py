from __future__ import annotations

import time

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.redis_client import get_redis

WINDOW = 60


async def rate_limit_middleware(request: Request, call_next):
    if request.url.path in {"/health", "/docs", "/openapi.json", "/redoc"}:
        return await call_next(request)

    client = get_redis()
    if client is None:
        return await call_next(request)

    ident = request.headers.get("x-client-id") or (request.client.host if request.client else "anon")
    bucket = f"rl:{ident}:{int(time.time() // WINDOW)}"
    try:
        count = await client.incr(bucket)
        if count == 1:
            await client.expire(bucket, WINDOW)
        if count > settings.rate_limit_per_minute:
            return JSONResponse(
                status_code=429,
                content={"error": "rate_limited", "limit": settings.rate_limit_per_minute},
            )
    except Exception:
        pass
    return await call_next(request)

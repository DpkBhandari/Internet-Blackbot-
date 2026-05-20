from __future__ import annotations

import json
from typing import Any, Optional

import redis.asyncio as redis
from loguru import logger

from app.core.config import settings

_client: Optional[redis.Redis] = None


async def init_redis() -> None:
    global _client
    try:
        _client = redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
        await _client.ping()
        logger.info("Redis connected: {}", settings.redis_url)
    except Exception as exc:  # pragma: no cover
        logger.warning("Redis unavailable ({}). Running without cache.", exc)
        _client = None


async def close_redis() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None


def get_redis() -> Optional[redis.Redis]:
    return _client


async def cache_get(key: str) -> Any | None:
    if _client is None:
        return None
    try:
        raw = await _client.get(key)
        return json.loads(raw) if raw else None
    except Exception:
        return None


async def cache_set(key: str, value: Any, ttl: int | None = None) -> None:
    if _client is None:
        return
    try:
        await _client.set(key, json.dumps(value), ex=ttl or settings.cache_ttl_seconds)
    except Exception:
        pass

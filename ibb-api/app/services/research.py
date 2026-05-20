"""Real internet research — SerpAPI, NewsAPI, Semantic Scholar.

If no API keys are configured, the corresponding provider is skipped. If all
providers fail, callers receive an empty list and surface
``insufficient_evidence`` rather than fabricating sources."""
from __future__ import annotations

import asyncio
from typing import List

import httpx
from loguru import logger
from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.redis_client import cache_get, cache_set
from app.schemas.models import Source
from app.utils.text import credibility_for_url, hash_key

TIMEOUT = httpx.Timeout(15.0, connect=5.0)
RETRY = dict(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=4),
             retry=retry_if_exception_type((httpx.HTTPError,)))


async def _get_json(url: str, params: dict | None = None, headers: dict | None = None) -> dict | None:
    try:
        async for attempt in AsyncRetrying(**RETRY):
            with attempt:
                async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                    r = await client.get(url, params=params, headers=headers)
                    r.raise_for_status()
                    return r.json()
    except Exception as exc:
        logger.warning("HTTP fetch failed {}: {}", url, exc)
        return None


async def _serpapi(query: str, limit: int) -> List[Source]:
    if not settings.serpapi_key:
        return []
    data = await _get_json(
        "https://serpapi.com/search.json",
        params={"q": query, "engine": "google", "num": limit, "api_key": settings.serpapi_key},
    )
    if not data:
        return []
    out: list[Source] = []
    for r in (data.get("organic_results") or [])[:limit]:
        url = r.get("link") or ""
        if not url:
            continue
        out.append(Source(
            title=r.get("title") or "", url=url,
            snippet=r.get("snippet") or "",
            source="serpapi",
            published_at=r.get("date"),
            credibility=credibility_for_url(url),
        ))
    return out


async def _newsapi(query: str, limit: int) -> List[Source]:
    if not settings.newsapi_key:
        return []
    data = await _get_json(
        "https://newsapi.org/v2/everything",
        params={"q": query, "pageSize": limit, "language": "en", "sortBy": "relevancy"},
        headers={"X-Api-Key": settings.newsapi_key},
    )
    if not data:
        return []
    out: list[Source] = []
    for a in (data.get("articles") or [])[:limit]:
        url = a.get("url") or ""
        if not url:
            continue
        out.append(Source(
            title=a.get("title") or "", url=url,
            snippet=(a.get("description") or a.get("content") or "")[:600],
            source="newsapi",
            published_at=a.get("publishedAt"),
            credibility=credibility_for_url(url),
        ))
    return out


async def _semantic_scholar(query: str, limit: int) -> List[Source]:
    headers = {"x-api-key": settings.semantic_scholar_key} if settings.semantic_scholar_key else {}
    data = await _get_json(
        "https://api.semanticscholar.org/graph/v1/paper/search",
        params={"query": query, "limit": limit, "fields": "title,abstract,url,year,authors,venue"},
        headers=headers,
    )
    if not data:
        return []
    out: list[Source] = []
    for p in (data.get("data") or [])[:limit]:
        url = p.get("url") or ""
        if not url:
            continue
        out.append(Source(
            title=p.get("title") or "", url=url,
            snippet=(p.get("abstract") or "")[:600],
            source="semantic_scholar",
            published_at=str(p.get("year")) if p.get("year") else None,
            credibility=max(credibility_for_url(url), 0.85),
        ))
    return out


async def search_sources(query: str, limit: int = 8) -> List[Source]:
    query = (query or "").strip()
    if not query:
        return []
    cache_key = f"sources:{hash_key(query, str(limit))}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return [Source(**s) for s in cached]

    results = await asyncio.gather(
        _serpapi(query, limit), _newsapi(query, limit), _semantic_scholar(query, limit),
        return_exceptions=True,
    )
    merged: list[Source] = []
    seen: set[str] = set()
    for res in results:
        if isinstance(res, Exception) or not res:
            continue
        for s in res:
            if s.url in seen:
                continue
            seen.add(s.url)
            merged.append(s)
    merged.sort(key=lambda s: s.credibility, reverse=True)
    merged = merged[: max(limit, 3)]

    await cache_set(cache_key, [s.model_dump() for s in merged], ttl=1800)
    return merged

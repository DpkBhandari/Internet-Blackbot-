from __future__ import annotations

from fastapi import Header, HTTPException, status

from app.core.config import settings


async def require_internal_key(x_internal_key: str | None = Header(default=None)) -> None:
    """The Node backend forwards INTERNAL_API_KEY on every request."""
    if settings.app_env == "development" and not settings.internal_api_key:
        return
    if not x_internal_key or x_internal_key != settings.internal_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid internal key")

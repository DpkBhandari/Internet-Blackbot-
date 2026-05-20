import pytest

from app.core.redis_client import cache_get, cache_set, init_redis


@pytest.mark.asyncio
async def test_cache_roundtrip_no_crash_without_redis():
    # init_redis tolerates absence of redis; cache ops become no-ops
    await init_redis()
    await cache_set("k", {"v": 1}, ttl=5)
    val = await cache_get("k")
    # either the value round-trips, or redis isn't up and we get None
    assert val is None or val == {"v": 1}

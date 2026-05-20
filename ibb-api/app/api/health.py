from fastapi import APIRouter
import time

START = time.time()
router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok", "uptime": round(time.time() - START, 1)}

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
router = APIRouter()
class SourceRequest(BaseModel):
    text: str
    topic: Optional[str] = ""
@router.post("/sources")
async def sources(req: SourceRequest):
    return {"sources": [], "message": "Internet search requires API keys configured in .env"}

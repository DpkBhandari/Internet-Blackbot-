from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
router = APIRouter()
class RecRequest(BaseModel):
    topics: Optional[List[str]] = []
@router.post("/recommendations")
async def recommendations(req: RecRequest):
    return {"recommendations": [{"topic": t, "reason": "Based on your research"} for t in (req.topics or [])[:8]]}

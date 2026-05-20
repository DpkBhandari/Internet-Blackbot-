from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
router = APIRouter()
class KwRequest(BaseModel):
    text: str
    top_n: Optional[int] = 15
@router.post("/keywords")
async def keywords(req: KwRequest):
    if not req.text.strip(): raise HTTPException(400, "text required")
    try:
        from app.services.keywords import KeywordsService
        return {"keywords": KeywordsService().extract(req.text, req.top_n or 15)}
    except Exception as e:
        raise HTTPException(500, str(e))

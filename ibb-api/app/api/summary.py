from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
router = APIRouter()
class SumRequest(BaseModel):
    text: str
    max_length: Optional[int] = 300
@router.post("/summary")
async def summary(req: SumRequest):
    if not req.text.strip(): raise HTTPException(400, "text required")
    try:
        from app.services.summarizer import SummarizerService
        return {"summary": SummarizerService().summarize(req.text, req.max_length or 300)}
    except Exception as e:
        raise HTTPException(500, str(e))

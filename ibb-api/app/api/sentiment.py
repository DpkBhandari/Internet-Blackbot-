from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
router = APIRouter()
class TextRequest(BaseModel):
    text: str
@router.post("/sentiment")
async def sentiment(req: TextRequest):
    if not req.text.strip(): raise HTTPException(400, "text required")
    try:
        from app.services.sentiment import SentimentService
        return SentimentService().analyze(req.text)
    except Exception as e:
        raise HTTPException(500, str(e))

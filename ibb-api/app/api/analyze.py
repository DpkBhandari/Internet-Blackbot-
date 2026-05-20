from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.pipeline import AnalysisPipeline
from typing import Optional

router = APIRouter()
_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = AnalysisPipeline()
    return _pipeline

class AnalyzeRequest(BaseModel):
    text: str
    topic: Optional[str] = ""
    title: Optional[str] = ""

@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    try:
        pipeline = get_pipeline()
        result = await pipeline.run(req.text, topic=req.topic or "", title=req.title or "")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

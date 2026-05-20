from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
router = APIRouter()
class TextRequest(BaseModel):
    text: str
@router.post("/misinformation")
async def misinformation(req: TextRequest):
    if not req.text.strip(): raise HTTPException(400, "text required")
    try:
        from app.utils.text import extract_claims
        from app.services.toxicity import ToxicityService
        claims = extract_claims(req.text)
        tox = ToxicityService().analyze(req.text[:2000])
        score = min(1.0, tox.get("score", 0.1) * 1.5)
        return {
            "misinformationScore": round(score, 3),
            "credibilityScore": round(1.0 - score, 3),
            "claims": [{"text": c, "verdict": "UNVERIFIED", "confidence": 0.5} for c in claims[:8]],
        }
    except Exception as e:
        raise HTTPException(500, str(e))

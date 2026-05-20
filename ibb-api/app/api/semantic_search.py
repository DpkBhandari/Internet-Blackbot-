from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
router = APIRouter()
class SemanticRequest(BaseModel):
    query: str
    candidates: List[str]
    top_k: Optional[int] = 5
@router.post("/semantic-search")
async def semantic_search(req: SemanticRequest):
    if not req.query or not req.candidates: raise HTTPException(400, "query and candidates required")
    try:
        from sentence_transformers import SentenceTransformer, util
        import torch
        model = SentenceTransformer("all-MiniLM-L6-v2")
        q_emb = model.encode(req.query, convert_to_tensor=True)
        c_emb = model.encode(req.candidates, convert_to_tensor=True)
        scores = util.cos_sim(q_emb, c_emb)[0].tolist()
        ranked = sorted(zip(req.candidates, scores), key=lambda x: x[1], reverse=True)[:req.top_k]
        return {"results": [{"text": t, "score": round(s, 4)} for t, s in ranked]}
    except ImportError:
        # Fallback: simple keyword matching
        query_words = set(req.query.lower().split())
        results = []
        for c in req.candidates:
            words = set(c.lower().split())
            score = len(query_words & words) / max(len(query_words), 1)
            results.append({"text": c, "score": round(score, 4)})
        results.sort(key=lambda x: x["score"], reverse=True)
        return {"results": results[:req.top_k]}
    except Exception as e:
        raise HTTPException(500, str(e))

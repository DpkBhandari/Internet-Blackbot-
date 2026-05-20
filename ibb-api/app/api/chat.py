from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.chat import ChatService

router = APIRouter()
_svc = None

def get_svc():
    global _svc
    if _svc is None:
        _svc = ChatService()
    return _svc

class ChatRequest(BaseModel):
    message: str
    context: str = ""

@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        svc = get_svc()
        reply = await svc.chat(req.message, req.context)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

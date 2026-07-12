from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_service import gemini_service
from app.core.config import settings

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        reply = gemini_service.generate_response(request.message)
        return ChatResponse(
            success=True,
            response=reply,
            model=settings.GEMINI_MODEL,
            thinking_process="Processed query via Metro AI assistant."
        )
    except Exception as e:
        error_msg = str(e)
        return ChatResponse(
            success=False,
            response=f"I'm Metro AI! (Offline mode: {error_msg}). I can help you explore stations, check routes, and plan your metro journey across Pune and other cities.",
            model=settings.GEMINI_MODEL,
            thinking_process=f"Fallback triggered: {error_msg}"
        )

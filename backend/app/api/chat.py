from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_service import gemini_service
from app.core.config import settings
from app.db.database import get_db
from app.memory.conversion import ConversationMemory
from sse_starlette.sse import EventSourceResponse

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or "default_session"
    try:
        # Load past conversation history formatted for Gemini
        history = ConversationMemory.get_gemini_history(db, session_id)

        # Generate reply using Gemini
        reply = gemini_service.generate_response(request.message, history=history)

        # Save user message & model reply to database conversation memory
        ConversationMemory.add_message(db, session_id, role="user", content=request.message)
        ConversationMemory.add_message(db, session_id, role="model", content=reply)

        return ChatResponse(
            success=True,
            response=reply,
            model=settings.GEMINI_MODEL,
            thinking_process="Processed query via Metro AI assistant with conversation memory."
        )
    except Exception as e:
        error_msg = str(e)
        return ChatResponse(
            success=False,
            response=f"I'm Metro AI! (Offline mode: {error_msg}). I can help you explore stations, check routes, and plan your metro journey across Pune.",
            model=settings.GEMINI_MODEL,
            thinking_process=f"Fallback triggered: {error_msg}"
        )


@router.post("/stream")
async def chat_stream_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Stream chat responses using structured Server-Sent Events (SSE).
    """
    session_id = request.session_id or "default_session"

    def event_generator():
        try:
            yield {"event": "status", "data": "Processing query with Metro AI..."}

            # Load past conversation history formatted for Gemini
            history = ConversationMemory.get_gemini_history(db, session_id)

            # Store user message immediately
            ConversationMemory.add_message(db, session_id, role="user", content=request.message)

            full_reply = []
            for chunk in gemini_service.get_stream_response(request.message, history=history):
                full_reply.append(chunk)
                yield {"event": "token", "data": chunk}

            # Store full bot message once streaming completes
            complete_text = "".join(full_reply)
            if complete_text:
                ConversationMemory.add_message(db, session_id, role="model", content=complete_text)

            yield {"event": "done", "data": "completed"}
        except Exception as e:
            yield {"event": "error", "data": str(e)}

    return EventSourceResponse(event_generator())


@router.delete("/history/{session_id}")
async def delete_chat_history(session_id: str, db: Session = Depends(get_db)):
    """
    Delete chat history for a specific session ID (used when clearing history in UI).
    """
    deleted = ConversationMemory.delete_session(db, session_id)
    return {"success": True, "deleted": deleted, "session_id": session_id}

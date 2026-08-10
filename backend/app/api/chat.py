import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_service import gemini_service
from app.core.config import settings
from app.core.prompts import SAFE_DEFLECTION_RESPONSE
from app.db.database import get_db
from app.memory.conversion import ConversationMemory
from app.middleware.prompt_guard import sanitize_user_input, validate_response
from sse_starlette.sse import EventSourceResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or "default_session"

    # ── Layer 1: Input sanitization ────────────────────────────────
    _, was_flagged, threat_category = sanitize_user_input(request.message)
    if was_flagged:
        logger.warning(
            f"Prompt injection blocked | endpoint=chat | category={threat_category} | "
            f"session={session_id} | message_preview={request.message[:60]}..."
        )
        # Save the attempt to conversation memory for audit trail
        ConversationMemory.add_message(db, session_id, role="user", content=request.message)
        ConversationMemory.add_message(db, session_id, role="model", content=SAFE_DEFLECTION_RESPONSE)
        return ChatResponse(
            success=True,
            response=SAFE_DEFLECTION_RESPONSE,
            model=settings.GEMINI_MODEL,
            thinking_process="Processed query via Metro AI assistant with conversation memory."
        )

    try:
        # Load past conversation history formatted for Gemini
        history = ConversationMemory.get_gemini_history(db, session_id)

        # Generate reply using Gemini (response validation happens inside gemini_service)
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

    # ── Layer 1: Input sanitization ────────────────────────────────
    _, was_flagged, threat_category = sanitize_user_input(request.message)
    if was_flagged:
        logger.warning(
            f"Prompt injection blocked | endpoint=chat/stream | category={threat_category} | "
            f"session={session_id} | message_preview={request.message[:60]}..."
        )
        ConversationMemory.add_message(db, session_id, role="user", content=request.message)
        ConversationMemory.add_message(db, session_id, role="model", content=SAFE_DEFLECTION_RESPONSE)

        def blocked_generator():
            yield {"event": "token", "data": SAFE_DEFLECTION_RESPONSE}
            yield {"event": "done", "data": "completed"}

        return EventSourceResponse(blocked_generator())

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

            # ── Layer 2: Output validation on accumulated response ─
            complete_text = "".join(full_reply)
            if complete_text:
                validated_text, was_redacted = validate_response(complete_text, SAFE_DEFLECTION_RESPONSE)
                if was_redacted:
                    logger.critical(
                        f"Stream response redacted due to prompt leak | "
                        f"session={session_id} | original_length={len(complete_text)}"
                    )
                    # Note: chunks were already sent. We log this as critical
                    # and save the safe version. In a future iteration, consider
                    # buffering chunks before sending for full validation.
                    ConversationMemory.add_message(db, session_id, role="model", content=validated_text)
                else:
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


# ── LangGraph Route-Aware Chatbot ─────────────────────────────────────

@router.post("/langgraph", response_model=ChatResponse, name="chat_langgraph")
@router.post("/langgraph/", response_model=ChatResponse, include_in_schema=False)
async def chat_langgraph_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    LangGraph-powered chatbot endpoint with route planning intelligence.

    Pipeline:
      think → extract_intent → [geocode → nearest_station → route_planning → format_response]
                               → [general_chat]

    - Detects route queries automatically from natural language
    - Geocodes place names using Photon + Nominatim (free, no API key)
    - Finds nearest Pune metro stations using Haversine distance
    - Computes shortest path via Dijkstra's algorithm
    - Returns structured_route for frontend map rendering
    """
    session_id = request.session_id or "default_session"

    # ── Layer 1: Input sanitization ────────────────────────────────
    _, was_flagged, threat_category = sanitize_user_input(request.message)
    if was_flagged:
        logger.warning(
            f"Prompt injection blocked | endpoint=chat/langgraph | category={threat_category} | "
            f"session={session_id} | message_preview={request.message[:60]}..."
        )
        ConversationMemory.add_message(db, session_id, role="user", content=request.message)
        ConversationMemory.add_message(db, session_id, role="model", content=SAFE_DEFLECTION_RESPONSE)
        return ChatResponse(
            success=True,
            response=SAFE_DEFLECTION_RESPONSE,
            model=settings.GEMINI_MODEL,
            thinking_process="Processed via Metro AI assistant.",
            structured_route=None,
        )

    try:
        from app.langgraph_agent import metro_graph, MetroChatState

        # Build initial state
        initial_state: MetroChatState = {
            "user_message": request.message,
            "session_id": session_id,
            "thinking": "",
            "intent_is_route": False,
            "source_place": "",
            "destination_place": "",
            "source_lat": None,
            "source_lng": None,
            "dest_lat": None,
            "dest_lng": None,
            "geocode_error": None,
            "source_station": None,
            "dest_station": None,
            "station_error": None,
            "route_result": None,
            "route_error": None,
            "final_response": "",
            "structured_route": None,
        }

        # Run LangGraph pipeline
        final_state = await metro_graph.ainvoke(initial_state)

        response_text = final_state.get("final_response", "")
        structured_route = final_state.get("structured_route", None)
        thinking = final_state.get("thinking", "")

        # Build thinking process summary for debugging
        thinking_parts = [f"Thinking: {thinking[:200]}..."] if thinking else []
        if final_state.get("intent_is_route"):
            thinking_parts.append(
                f"Route detected: {final_state.get('source_place')} → {final_state.get('destination_place')}"
            )
            if final_state.get("source_station"):
                thinking_parts.append(
                    f"Nearest stations: {final_state['source_station']['name']} → {final_state.get('dest_station', {}).get('name', 'N/A')}"
                )
        thinking_summary = " | ".join(thinking_parts) or "Processed via LangGraph Metro pipeline."

        # Save conversation to memory
        ConversationMemory.add_message(db, session_id, role="user", content=request.message)
        ConversationMemory.add_message(db, session_id, role="model", content=response_text)

        return ChatResponse(
            success=True,
            response=response_text,
            model=settings.GEMINI_MODEL,
            thinking_process=thinking_summary,
            structured_route=structured_route,
        )

    except Exception as e:
        logging.getLogger(__name__).error(f"LangGraph endpoint error: {e}", exc_info=True)
        return ChatResponse(
            success=False,
            response=(
                "I'm Metro AI! I had trouble processing your request right now. "
                "You can ask about Pune Metro routes, station timings, fares, or facilities."
            ),
            model=settings.GEMINI_MODEL,
            thinking_process=f"LangGraph pipeline error: {str(e)}",
            structured_route=None,
        )

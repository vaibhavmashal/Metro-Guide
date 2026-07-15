from sqlalchemy.orm import Session
from app.db.models.conversation import ConversationSession, ChatMessageLog
# pyrefly: ignore [missing-import]
from google.genai import types


class ConversationMemory:
    """
    Repository/service for managing multi-turn conversation history in PostgreSQL.
    """

    @staticmethod
    def get_or_create_session(db: Session, session_id: str) -> ConversationSession:
        session = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
        if not session:
            session = ConversationSession(id=session_id)
            db.add(session)
            db.commit()
            db.refresh(session)
        return session

    @staticmethod
    def add_message(db: Session, session_id: str, role: str, content: str) -> ChatMessageLog:
        # Ensure session exists
        ConversationMemory.get_or_create_session(db, session_id)

        msg = ChatMessageLog(
            session_id=session_id,
            role=role,
            content=content
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    @staticmethod
    def get_history(db: Session, session_id: str, limit: int = 20) -> list[dict]:
        """
        Retrieves recent conversation messages in chronological order.
        """
        messages = (
            db.query(ChatMessageLog)
            .filter(ChatMessageLog.session_id == session_id)
            .order_by(ChatMessageLog.timestamp.desc())
            .limit(limit)
            .all()
        )
        # Reverse to chronological order (oldest -> newest)
        messages.reverse()
        return [{"role": msg.role, "content": msg.content} for msg in messages]

    @staticmethod
    def get_gemini_history(db: Session, session_id: str, limit: int = 20) -> list[types.Content]:
        """
        Returns history directly formatted as google.genai.types.Content objects.
        """
        history_dicts = ConversationMemory.get_history(db, session_id, limit)
        return [
            types.Content(
                role=item["role"],
                parts=[types.Part.from_text(text=item["content"])]
            )
            for item in history_dicts
        ]

    @staticmethod
    def delete_session(db: Session, session_id: str) -> bool:
        """
        Deletes a conversation session and all its messages via CASCADE.
        """
        session = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
        if session:
            db.delete(session)
            db.commit()
            return True
        return False



from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class ConversationSession(Base):
    __tablename__ = "conversation_sessions"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessageLog", back_populates="session", cascade="all, delete-orphan")


class ChatMessageLog(Base):
    __tablename__ = "chat_message_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("conversation_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    role = Column(String, nullable=False)  # 'user' or 'model'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    session = relationship("ConversationSession", back_populates="messages")

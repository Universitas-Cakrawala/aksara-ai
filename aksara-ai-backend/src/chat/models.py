from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from src.config.postgres import Base
from datetime import datetime
import uuid

class ChatHistory(Base):
    __tablename__ = "chat_histories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    model = Column(String, default="gemini-2.5-flash")
    language = Column(String, default="id")
    is_active = Column(Boolean, default=True)
    created_date = Column(DateTime, default=datetime.utcnow)

    messages = relationship(
        "ChatMessage", back_populates="chat_history", cascade="all, delete-orphan"
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_history_id = Column(String, ForeignKey("chat_histories.id"))
    sender = Column(String)
    text = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    chat_history = relationship("ChatHistory", back_populates="messages")

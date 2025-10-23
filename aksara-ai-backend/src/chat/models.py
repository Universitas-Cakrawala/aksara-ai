from sqlmodel import SQLModel, Field
import uuid
from typing import Optional
from datetime import datetime


class ChatHistory(SQLModel, table=True):
    """Chat history model - stores conversation metadata"""

    __tablename__ = "chat_histories"

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: Optional[str] = None
    model: str = Field(default="gemini-2.5-flash")
    language: str = Field(default="id")
    is_active: bool = Field(default=True)
    deleted: bool = Field(default=False)
    created_by: Optional[str] = None
    created_date: Optional[datetime] = Field(default_factory=lambda: datetime.now())
    updated_by: Optional[str] = None
    updated_date: Optional[datetime] = Field(default_factory=lambda: datetime.now())

    # Note: Relationships will be handled by repository layer for now


class ChatMessage(SQLModel, table=True):
    """Individual chat message model"""

    __tablename__ = "chat_messages"

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    chat_history_id: str = Field(foreign_key="chat_histories.id", index=True)
    sender: str  # 'user' or 'assistant'
    text: str
    deleted: bool = Field(default=False)
    created_date: Optional[datetime] = Field(default_factory=lambda: datetime.now())
    updated_date: Optional[datetime] = Field(default_factory=lambda: datetime.now())

    # Note: Relationships will be handled by repository layer for now

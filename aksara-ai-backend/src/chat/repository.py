"""
Chat Repository - Database operations only
All business logic moved to controller
"""

import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from src.chat.models import ChatHistory, ChatMessage


class ChatRepository:
    """Repository class for database operations on chat history."""

    def __init__(self, db: Session):
        self.db = db

    # ============ ChatHistory Operations ============

    def create_chat_history(
        self,
        user_id: str,
        title: str = "New Chat",
        model: str = "gemini-2.5-flash",
        language: str = "id",
    ) -> ChatHistory:
        """Create new chat history record"""
        new_chat = ChatHistory(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            model=model,
            language=language,
        )
        self.db.add(new_chat)
        return new_chat

    def get_chat_history_by_id(
        self, chat_id: str, user_id: str = None
    ) -> Optional[ChatHistory]:
        """Get chat history by ID, optionally filter by user_id"""
        query = self.db.query(ChatHistory).filter(
            ChatHistory.id == chat_id, ChatHistory.deleted == False
        )
        if user_id:
            query = query.filter(ChatHistory.user_id == user_id)
        return query.first()

    def get_user_chat_histories(self, user_id: str) -> List[ChatHistory]:
        """Get all chat histories for a user"""
        return (
            self.db.query(ChatHistory)
            .filter(
                ChatHistory.user_id == user_id,
                ChatHistory.deleted == False,
                ChatHistory.is_active == True,
            )
            .order_by(desc(ChatHistory.updated_date))
            .all()
        )

    def update_chat_history_title(
        self, chat_id: str, title: str
    ) -> Optional[ChatHistory]:
        """Update chat history title"""
        chat = self.get_chat_history_by_id(chat_id)
        if chat:
            chat.title = title  # type: ignore
        return chat

    def soft_delete_chat_history(self, chat_id: str) -> bool:
        """Soft delete chat history"""
        chat = self.get_chat_history_by_id(chat_id)
        if chat:
            chat.deleted = True  # type: ignore
            return True
        return False

    def hard_delete_chat_history(self, chat_id: str) -> bool:
        """Hard delete chat history (cascade will delete messages)"""
        chat = self.get_chat_history_by_id(chat_id)
        if chat:
            self.db.delete(chat)
            return True
        return False

    # ============ ChatMessage Operations ============

    def create_chat_message(
        self, chat_history_id: str, sender: str, text: str
    ) -> ChatMessage:
        """Create new chat message"""
        new_message = ChatMessage(
            id=str(uuid.uuid4()),
            chat_history_id=chat_history_id,
            sender=sender,
            text=text,
        )
        self.db.add(new_message)
        return new_message

    def get_messages_by_chat_id(self, chat_history_id: str) -> List[ChatMessage]:
        """Get all messages for a chat history"""
        return (
            self.db.query(ChatMessage)
            .filter(
                ChatMessage.chat_history_id == chat_history_id,
                ChatMessage.deleted == False,
            )
            .order_by(ChatMessage.created_date)
            .all()
        )

    def delete_message(self, message_id: str) -> bool:
        """Soft delete a message"""
        message = (
            self.db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
        )
        if message:
            message.deleted = True  # type: ignore
            return True
        return False

    # ============ Transaction Management ============

    def commit(self):
        """Commit transaction"""
        self.db.commit()

    def rollback(self):
        """Rollback transaction"""
        self.db.rollback()

    def refresh(self, instance):
        """Refresh instance from database"""
        self.db.refresh(instance)

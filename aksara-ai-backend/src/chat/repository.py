import uuid
from sqlalchemy.orm import Session
from src.schemas import ChatHistory, ChatMessage
from src.models import ChatHistoryModel  # Pastikan kamu punya model ini di folder models


class ChatRepository:
    """Repository class for managing chat history records."""

    def __init__(self, db: Session):
        self.db = db

    def create_chat_history(self, user_id: str, messages: list[ChatMessage], title: str = None):
        new_chat = ChatHistoryModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title or "New Chat",
            messages=[msg.dict() for msg in messages],
        )
        self.db.add(new_chat)
        self.db.commit()
        self.db.refresh(new_chat)
        return new_chat

    def get_chat_history(self, chat_id: str):
        return self.db.query(ChatHistoryModel).filter(ChatHistoryModel.id == chat_id).first()

    def list_user_histories(self, user_id: str):
        return self.db.query(ChatHistoryModel).filter(ChatHistoryModel.user_id == user_id).all()

    def update_chat_history(self, chat_id: str, new_messages: list[ChatMessage]):
        chat = self.get_chat_history(chat_id)
        if not chat:
            return None
        existing_msgs = chat.messages or []
        chat.messages = existing_msgs + [msg.dict() for msg in new_messages]
        self.db.commit()
        self.db.refresh(chat)
        return chat

    def delete_chat_history(self, chat_id: str):
        chat = self.get_chat_history(chat_id)
        if chat:
            self.db.delete(chat)
            self.db.commit()
            return True
        return False

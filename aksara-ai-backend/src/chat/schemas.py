from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# 🧠 Request dari user untuk generate chat
class ChatRequest(BaseModel):
    """Incoming HTTP request body for chat endpoint."""

    input: str = Field(..., description="User chat input / prompt")
    chat_history_id: Optional[str] = Field(
        None, description="Existing chat history ID for continuation"
    )
    temperature: Optional[float] = Field(
        default=0.0, ge=0.0, le=1.0, description="Sampling temperature"
    )
    max_tokens: Optional[int] = Field(
        default=512, ge=1, le=4096, description="Max tokens to generate"
    )


# 🗣️ Representasi satu pesan dalam percakapan
class ChatMessageResponse(BaseModel):
    """Single message in chat history"""

    id: str
    sender: str  # 'user' or 'assistant'
    text: str
    created_date: datetime

    class Config:
        from_attributes = True


# 🤖 Response standar dari model
class ChatResponse(BaseModel):
    """Standard API response wrapping the model reply."""

    conversation_id: str
    model: str
    input: str
    output: str
    timestamp: str


# 🗂️ Schema untuk chat history detail
class ChatHistoryDetail(BaseModel):
    """Represent a single chat history record with messages."""

    id: str
    title: str
    model: str
    language: str
    is_active: bool
    created_date: datetime
    updated_date: datetime
    messages: List[ChatMessageResponse]

    class Config:
        from_attributes = True


# 📜 Schema untuk list chat histories (summary only)
class ChatHistorySummary(BaseModel):
    """Summary of chat history for listing"""

    id: str
    title: str
    model: str
    message_count: int
    last_message: Optional[str]
    created_date: datetime
    updated_date: datetime

    class Config:
        from_attributes = True


class ChatHistoryListResponse(BaseModel):
    """Response for listing chat histories"""

    histories: List[ChatHistorySummary]
    total: int

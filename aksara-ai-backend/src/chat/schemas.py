from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# 🧠 Request dari user untuk generate chat
class ChatRequest(BaseModel):
    """Incoming HTTP request body for chat endpoint."""
    input: str = Field(..., description="User chat input / prompt")
    temperature: Optional[float] = Field(default=0.0, description="Sampling temperature for the model")
    max_tokens: Optional[int] = Field(default=512, description="Max tokens to generate")


# 🗣️ Representasi satu pesan dalam percakapan
class ChatMessage(BaseModel):
    role: str = Field(..., description="Speaker role, e.g. 'user' or 'assistant'")
    content: str = Field(..., description="Message text")


# 🤖 Response standar dari model
class ChatResponse(BaseModel):
    """Standard API response wrapping the model reply."""
    id: Optional[str]
    model: Optional[str]
    output: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = None


# 🗂️ Schema tambahan untuk menyimpan histori chat di database
class ChatHistory(BaseModel):
    """Represent a single chat history record."""
    id: str
    user_id: str
    title: Optional[str] = None
    messages: List[ChatMessage]
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True


# 📜 Schema untuk menampilkan list chat histories
class ChatHistoryList(BaseModel):
    histories: List[ChatHistory]


# 🔧 Helper: Build Gemini payload
def build_gemini_payload(req: ChatRequest, conversation: Optional[List[ChatMessage]] = None) -> Dict[str, Any]:
    messages = []
    if conversation:
        for msg in conversation:
            messages.append({"author": msg.role, "content": msg.content})

    messages.append({"author": "user", "content": req.input})

    return {
        "model": "gemini-2.5-flash-preview-05-20",
        "messages": messages,
        "temperature": req.temperature or 0.0,
        "max_output_tokens": req.max_tokens or 512,
    }


# 🔧 Helper: Create chat response
def create_chat_response(
    id: Optional[str],
    model: Optional[str],
    outputs: List[Dict[str, Any]],
    metadata: Optional[Dict[str, Any]] = None,
):
    return ChatResponse(id=id, model=model, output=outputs, metadata=metadata)

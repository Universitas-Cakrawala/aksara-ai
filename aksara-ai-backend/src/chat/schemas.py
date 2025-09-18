from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ChatRequest(BaseModel):
    """Incoming HTTP request body for chat endpoint."""

    input: str = Field(..., description="User chat input / prompt")
    temperature: Optional[float] = Field(
        default=0.0, description="Sampling temperature for the model"
    )
    max_tokens: Optional[int] = Field(default=512, description="Max tokens to generate")


class ChatMessage(BaseModel):
    role: str = Field(..., description="speaker role, e.g. 'user' or 'assistant'")
    content: str = Field(..., description="message text")


class ChatResponse(BaseModel):
    """Standard API response wrapping the model reply."""

    id: Optional[str]
    model: Optional[str]
    output: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = None


def build_gemini_payload(
    req: ChatRequest, conversation: Optional[List[ChatMessage]] = None
) -> Dict[str, Any]:
    """Build a minimal Gemini-compatible request payload.

    This function returns a dict you can send to the Gemini API (or your Gemini client).
    It keeps the payload minimal and uses fields available in `req`.
    """
    messages = []
    if conversation:
        for msg in conversation:
            messages.append({"author": msg.role, "content": msg.content})

    # add the current user input as the last message
    messages.append({"author": "user", "content": req.input})

    payload: Dict[str, Any] = {
        "model": "gemini-2.5-flash-preview-05-20",
        "messages": messages,
        "temperature": req.temperature or 0.0,
        "max_output_tokens": req.max_tokens or 512,
    }

    return payload


def create_chat_response(
    id: Optional[str],
    model: Optional[str],
    outputs: List[Dict[str, Any]],
    metadata: Optional[Dict[str, Any]] = None,
):
    """Return the standard API response using project helper `ok`."""
    resp = ChatResponse(id=id, model=model, output=outputs, metadata=metadata)
    return resp

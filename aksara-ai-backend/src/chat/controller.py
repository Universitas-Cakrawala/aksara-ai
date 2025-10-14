from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from decouple import config
import google.genai as genai

from src.auth.handler import get_current_user
from src.chat.schemas import ChatRequest
from src.chat.repository import ChatRepository
from src.user.models import User
from src.config.postgres import get_db
from src.utils.helper import formatError, ok
from src.constants import HTTP_INTERNAL_SERVER_ERROR, HTTP_UNAUTHORIZED


class ChatController:
    # 🔹 Generate chat response (sudah kamu punya)
    @staticmethod
    async def generate_chat_response(
        request: ChatRequest, authorization: str, db: Session = Depends(get_db)
    ):
        try:
            if not authorization:
                raise HTTPException(status_code=HTTP_UNAUTHORIZED, detail="Authorization token is missing!")
            token = (
                authorization.split("Bearer", 1)[1].strip()
                if "Bearer" in authorization
                else authorization
            )
            userId = get_current_user(token)
            if not userId:
                raise HTTPException(status_code=HTTP_UNAUTHORIZED, detail="You are not logged in!")

            user = db.query(User).filter(User.id == userId).first()
            if not user:
                raise HTTPException(status_code=HTTP_UNAUTHORIZED, detail="Session has ended, please login again!")

            gemini_api_key = config("GEMINI_API_KEY", default=None)
            if not gemini_api_key:
                raise HTTPException(status_code=HTTP_INTERNAL_SERVER_ERROR, detail="Gemini API key not configured.")
            
            client = genai.Client(api_key=gemini_api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=request.input,
                config=genai.types.GenerateContentConfig(
                    temperature=request.temperature or 0.0,
                    max_output_tokens=request.max_tokens or 512,
                ),
            )
            
            response_text = ""
            candidates = getattr(response, "candidates", []) or []
            for c in candidates:
                parts = getattr(getattr(c, "content", None), "parts", [])
                if parts:
                    response_text = "".join([getattr(p, "text", "") for p in parts]).strip()
                    break

            chat_data = {
                "id": str(userId),
                "model": "gemini-2.5-flash",
                "input": request.input,
                "output": response_text,
            }
            return ok(chat_data, "Successfully generated chat response", 200)

        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

    # 🔹 Get all chat histories (list)
    @staticmethod
    async def get_chat_histories(authorization: str, db: Session = Depends(get_db)):
        try:
            if not authorization:
                raise HTTPException(status_code=HTTP_UNAUTHORIZED, detail="Authorization token is missing!")
            token = (
                authorization.split("Bearer", 1)[1].strip()
                if "Bearer" in authorization
                else authorization
            )
            userId = get_current_user(token)
            if not userId:
                raise HTTPException(status_code=HTTP_UNAUTHORIZED, detail="You are not logged in!")

            repo = ChatRepository(db)
            chat_histories = repo.list_user_histories(userId)
            
            # Format the response
            formatted_histories = [
                {
                    "conversation_id": chat.id,
                    "title": chat.title,
                    "model": chat.model,
                    "language": chat.language,
                    "is_active": chat.is_active,
                    "created_date": chat.created_date.isoformat(),
                    "message_count": len(chat.messages) if chat.messages else 0
                }
                for chat in chat_histories
            ]
            
            return ok(formatted_histories, "Successfully fetched chat histories", 200)
        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

    # 🔹 Find one chat by ID (fitur kamu)
    @staticmethod
    async def get_chat_history_by_id(history_id: str, authorization: str, db: Session = Depends(get_db)):
        try:
            if not authorization:
                raise HTTPException(status_code=HTTP_UNAUTHORIZED, detail="Authorization token is missing!")
            token = (
                authorization.split("Bearer", 1)[1].strip()
                if "Bearer" in authorization
                else authorization
            )
            userId = get_current_user(token)
            if not userId:
                raise HTTPException(status_code=HTTP_UNAUTHORIZED, detail="You are not logged in!")

            repo = ChatRepository(db)
            chat = repo.find_one_chat(history_id, userId)
            if not chat:
                raise HTTPException(status_code=404, detail="Chat history not found")

            chat_data = {
                "conversation_id": chat.id,
                "title": chat.title,
                "model": chat.model,
                "language": chat.language,
                "is_active": chat.is_active,
                "created_date": chat.created_date.isoformat(),
                "messages": [
                    {
                        "message_id": msg.id,
                        "sender": msg.sender,
                        "text": msg.text,
                        "timestamp": msg.timestamp.isoformat(),
                    }
                    for msg in chat.messages
                ],
            }
            return ok(chat_data, "Successfully retrieved chat history", 200)
        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

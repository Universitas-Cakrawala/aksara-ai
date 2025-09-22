from google import genai
from google.genai import types
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from src.config.postgres import get_db
from src.utils.helper import ok, formatError
from src.user.models import User
from src.auth.handler import get_current_user
from src.constants import HTTP_UNAUTHORIZED
from src.chat.schemas import ChatRequest
from decouple import config


class ChatController:
    @staticmethod
    async def generate_chat_response(
        request: ChatRequest,
        authorization: str,
        db: Session = Depends(get_db),
    ):
        """Receive a chat request, forward it to Gemini, and return structured response."""
        try:
            if not authorization:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Authorization token is missing!",
                )

            print("Authorization:", authorization)

            if isinstance(authorization, str) and "Bearer" in authorization:
                try:
                    token = authorization.split("Bearer", 1)[1].strip()
                except Exception:
                    token = authorization
            else:
                token = authorization

            userId = get_current_user(token)

            if userId is None:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="You are not logged in!",
                )

            user = (
                db.query(User).filter(User.id == userId, User.deleted == False).first()
            )

            if not user:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Session has ended, please login again!",
                )

            # Call Gemini directly with the user input
            # Get API key from environment variables
            gemini_api_key = config("GEMINI_API_KEY", default=None)
            if not gemini_api_key:
                raise HTTPException(
                    status_code=500,
                    detail="Gemini API key not configured. Please set GEMINI_API_KEY environment variable.",
                )

            client = genai.Client(api_key=gemini_api_key)

            response = client.models.generate_content(
                model="gemini-2.5-flash-preview-05-20",  # gunakan "gemini-2.5-flash-preview-05-20" untuk free tier
                contents=request.input,
                config=types.GenerateContentConfig(
                    temperature=request.temperature or 0.0,
                    max_output_tokens=request.max_tokens or 512,
                    thinking_config=types.ThinkingConfig(thinking_budget=0),
                ),
            )

            # Extract response text - Gemini typically returns response.text
            response_text = ""
            if hasattr(response, "text") and response.text:
                response_text = response.text
            else:
                # Fallback for different response formats
                response_text = str(response)

            # Build simple response structure
            chat_data = {
                "id": str(userId),
                "model": "gemini-2.5-flash-preview-05-20",
                "input": request.input,
                "output": response_text,
                "metadata": {
                    "temperature": request.temperature or 0.0,
                    "max_tokens": request.max_tokens or 512,
                },
            }

            return ok(chat_data, "Successfully generated chat response", 200)

        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), 500)

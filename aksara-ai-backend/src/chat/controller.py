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
                db.query(User).filter(User.id == userId).first()
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

            # Configure the Gemini AI
            genai.configure(api_key=gemini_api_key)
            
            # Create the model (updated to latest Gemini 2.5 Flash)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Generate content
            response = model.generate_content(
                request.input,
                generation_config=genai.GenerationConfig(
                    temperature=request.temperature or 0.0,
                    max_output_tokens=request.max_tokens or 512,
                ),
            )

            # Extract response text safely and handle safety blocks
            response_text = ""
            normalized_finish_reason = None
            safety_blocked = False

            def normalize_finish_reason(reason):
                if reason is None:
                    return None
                if hasattr(reason, "name"):
                    return reason.name
                if isinstance(reason, str):
                    return reason
                if isinstance(reason, (int, float)):
                    return int(reason)
                return str(reason)

            if response:
                prompt_feedback = getattr(response, "prompt_feedback", None)
                if prompt_feedback and getattr(prompt_feedback, "block_reason", None):
                    safety_blocked = True
                    normalized_finish_reason = normalize_finish_reason(
                        getattr(prompt_feedback, "block_reason", None)
                    ) or normalized_finish_reason

                candidates = getattr(response, "candidates", []) or []
                for candidate in candidates:
                    finish_reason = normalize_finish_reason(
                        getattr(candidate, "finish_reason", None)
                    )
                    if finish_reason is not None:
                        normalized_finish_reason = finish_reason
                        if (
                            (isinstance(finish_reason, int) and finish_reason == 2)
                            or (
                                isinstance(finish_reason, str)
                                and "SAFETY" in finish_reason.upper()
                            )
                        ):
                            safety_blocked = True

                    parts = (
                        getattr(getattr(candidate, "content", None), "parts", [])
                        or []
                    )
                    text_parts = [
                        getattr(part, "text", "")
                        for part in parts
                        if getattr(part, "text", "")
                    ]

                    if text_parts:
                        response_text = "".join(text_parts).strip()
                        break

                if not response_text:
                    text_attr = getattr(response, "text", None)
                    if text_attr:
                        response_text = text_attr.strip()

            if not response_text:
                if safety_blocked:
                    response_text = (
                        "Maaf, permintaan ini tidak dapat diproses karena melanggar kebijakan keamanan. "
                        "Silakan coba dengan pertanyaan atau kata-kata yang berbeda."
                    )
                else:
                    response_text = (
                        "Maaf, saya tidak dapat menghasilkan respons untuk pertanyaan tersebut saat ini. "
                        "Silakan coba lagi dengan pertanyaan yang berbeda."
                    )

            # Build simple response structure
            chat_data = {
                "id": str(userId),
                "model": "gemini-2.5-flash",
                "input": request.input,
                "output": response_text,
                "metadata": {
                    "temperature": request.temperature or 0.0,
                    "max_tokens": request.max_tokens or 512,
                    "finish_reason": normalized_finish_reason,
                    "safety_blocked": safety_blocked,
                },
            }

            return ok(chat_data, "Successfully generated chat response", 200)

        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), 500)

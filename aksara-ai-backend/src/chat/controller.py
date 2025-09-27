import google.genai as genai
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from src.config.postgres import get_db
from src.utils.helper import ok, formatError
from src.user.models import User
from src.auth.handler import get_current_user
from src.constants import HTTP_UNAUTHORIZED, HTTP_INTERNAL_SERVER_ERROR
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

            user = db.query(User).filter(User.id == userId).first()

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
                    status_code=HTTP_INTERNAL_SERVER_ERROR,
                    detail="Gemini API key not configured. Please set GEMINI_API_KEY environment variable.",
                )

            # Create Gemini client
            client = genai.Client(api_key=gemini_api_key)

            # Generate content using the client
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=request.input,
                config=genai.types.GenerateContentConfig(
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
                    normalized_finish_reason = (
                        normalize_finish_reason(
                            getattr(prompt_feedback, "block_reason", None)
                        )
                        or normalized_finish_reason
                    )

                candidates = getattr(response, "candidates", []) or []
                for candidate in candidates:
                    finish_reason = normalize_finish_reason(
                        getattr(candidate, "finish_reason", None)
                    )
                    if finish_reason is not None:
                        normalized_finish_reason = finish_reason
                        if (isinstance(finish_reason, int) and finish_reason == 2) or (
                            isinstance(finish_reason, str)
                            and "SAFETY" in finish_reason.upper()
                        ):
                            safety_blocked = True

                    parts = (
                        getattr(getattr(candidate, "content", None), "parts", []) or []
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
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

    @staticmethod
    async def get_chat_histories(
        authorization: str,
        db: Session = Depends(get_db),
    ):
        """Fetch chat histories for the authenticated user."""
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

            user = db.query(User).filter(User.id == userId).first()

            if not user:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Session has ended, please login again!",
                )

            # For demo purposes, return empty chat history
            chat_histories = [
                {
                    "conversation_id": "c0a80154-7c2b-4f6d-9a2b-1a2b3c4d5e6f",
                    "title": "Diskusi tentang arsitektur Transformer",
                    "last_message_preview": "Terima kasih, itu sangat jelas.",
                    "last_sender": "user",
                    "last_timestamp": "2025-09-27T12:36:45Z",
                    "total_messages": 4,
                    "model": "gemini-2.5-flash",
                    "language": "id",
                    "is_active": True,
                    "created_date": "2025-09-27T12:34:56Z",
                },
                {
                    "conversation_id": "d4f5a6b7-c8d9-40e1-9f2a-0b1c2d3e4f50",
                    "title": "Catatan harian prompt",
                    "last_message_preview": "Bisa tolong ringkas poin-poin utamanya?",
                    "last_sender": "model",
                    "last_timestamp": "2025-09-26T09:15:10Z",
                    "total_messages": 2,
                    "model": "gemini-2.5-flash",
                    "language": "id",
                    "is_active": False,
                    "created_date": "2025-09-26T09:10:00Z",
                },
                {
                    "conversation_id": "e1f2a3b4-c5d6-47e8-9a0b-1c2d3e4f5g6h",
                    "title": "Rencana perjalanan liburan",
                    "last_message_preview": "Apa rekomendasi tempat makan di sana?",
                    "last_sender": "user",
                    "last_timestamp": "2025-09-25T18:45:30Z",
                    "total_messages": 5,
                    "model": "gemini-2.5-flash",
                    "language": "id",
                    "is_active": True,
                    "created_date": "2025-09-25T18:30:00Z",
                },
            ]

            return ok(chat_histories, "Successfully fetched chat histories", 200)

        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

    @staticmethod
    async def get_chat_history_by_id(
        history_id: str,
        authorization: str,
        db: Session = Depends(get_db),
    ):
        """Fetch a specific chat history by ID for the authenticated user."""
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

            user = db.query(User).filter(User.id == userId).first()

            if not user:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Session has ended, please login again!",
                )

            # For demo purposes, return static chat history details
            chat_history = {
                "conversation_id": "c0a80154-7c2b-4f6d-9a2b-1a2b3c4d5e6f",
                "title": "Diskusi tentang arsitektur Transformer",
                "model": "gemini-2.5-flash",
                "language": "id",
                "is_active": True,
                "created_date": "2025-09-27T12:34:56Z",
                "messages": [
                    {
                        "message_id": "m1",
                        "sender": "user",
                        "text": "Halo, bisakah kamu menjelaskan bagaimana arsitektur Transformer bekerja?",
                        "timestamp": "2025-09-27T12:34:56Z",
                    },
                    {
                        "message_id": "m2",
                        "sender": "model",
                        "text": (
                            "Tentu! Arsitektur Transformer adalah model deep learning yang "
                            "menggunakan mekanisme attention untuk memproses data sekuensial..."
                        ),
                        "timestamp": "2025-09-27T12:35:30Z",
                    },
                    {
                        "message_id": "m3",
                        "sender": "user",
                        "text": "Bisakah kamu memberikan contoh aplikasinya?",
                        "timestamp": "2025-09-27T12:36:10Z",
                    },
                    {
                        "message_id": "m4",
                        "sender": "model",
                        "text": (
                            "Tentu! Transformer banyak digunakan dalam pemrosesan bahasa alami, "
                            "seperti dalam model GPT dan BERT..."
                        ),
                        "timestamp": "2025-09-27T12:36:45Z",
                    },
                ],
            }
            return ok(chat_history, "Successfully retrieved chat history", 200)
        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

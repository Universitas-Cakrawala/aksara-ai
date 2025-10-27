"""
Chat Controller - Business logic and query orchestration
All database queries executed here using repository
"""

from datetime import datetime

import google.genai as genai
from decouple import config
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from src.chat.repository import ChatRepository
from src.chat.schemas import (
    ChatHistoryDetail,
    ChatHistoryListResponse,
    ChatHistorySummary,
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
)
from src.config.postgres import get_db
from src.constants import HTTP_INTERNAL_SERVER_ERROR
from src.middleware.middleware import get_user_id_from_token
from src.utils.helper import formatError, ok


class ChatController:
    """Controller class for chat business logic"""

    @staticmethod
    async def generate_chat_response(
        request: ChatRequest, authorization: str, db: Session = Depends(get_db)
    ):
        """Generate chat response using Gemini API and save to database"""
        try:
            # Get user ID from token (authentication already handled by middleware)
            userId = get_user_id_from_token(authorization)

            # Initialize repository
            repo = ChatRepository(db)

            # Get or create chat history
            chat_history = None
            if request.chat_history_id and request.chat_history_id.strip():
                # Try to get existing chat history
                chat_history = repo.get_chat_history_by_id(
                    request.chat_history_id, userId
                )
                if not chat_history:
                    raise HTTPException(
                        status_code=404, detail="Chat history not found"
                    )
            else:
                # Create new chat history (chat_history_id is None, empty, or whitespace)
                chat_history = repo.create_chat_history(
                    user_id=userId, title="New Chat", model="gemini-2.5-flash"
                )
                repo.commit()
                repo.refresh(chat_history)

            # Get conversation context (previous messages)
            messages = repo.get_messages_by_chat_id(chat_history.id)
            conversation_context = []
            for msg in messages:
                role = "user" if msg.sender == "user" else "model"
                conversation_context.append(
                    {"role": role, "parts": [{"text": msg.text}]}
                )

            # Add current user input
            conversation_context.append(
                {"role": "user", "parts": [{"text": request.input}]}
            )

            # Call Gemini API
            gemini_api_key = config("GEMINI_API_KEY", default=None)
            if not gemini_api_key:
                raise HTTPException(
                    status_code=HTTP_INTERNAL_SERVER_ERROR,
                    detail="Gemini API key not configured.",
                )

            client = genai.Client(api_key=gemini_api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=conversation_context,
                config=genai.types.GenerateContentConfig(
                    temperature=request.temperature or 0.0,
                    max_output_tokens=request.max_tokens or 512,
                ),
            )

            # Extract response text
            response_text = ""

            # Check if response has candidates
            if hasattr(response, "candidates") and response.candidates:
                candidate = response.candidates[0]

                # Extract content
                if hasattr(candidate, "content") and candidate.content:
                    content = candidate.content

                    # Extract parts
                    if hasattr(content, "parts") and content.parts:
                        # Get text from first part
                        first_part = content.parts[0]
                        if hasattr(first_part, "text") and first_part.text:
                            response_text = first_part.text.strip()

            # Fallback: try direct text access
            if not response_text and hasattr(response, "text") and response.text:
                response_text = response.text.strip()

            # Final fallback
            if not response_text:
                response_text = "I apologize, but I encountered an issue generating a response. Please try again."

            # Save user message
            repo.create_chat_message(
                chat_history_id=chat_history.id, sender="user", text=request.input
            )

            # Save assistant message
            repo.create_chat_message(
                chat_history_id=chat_history.id, sender="assistant", text=response_text
            )

            # Auto-generate title if this is the first message
            if len(messages) == 0 and request.input:
                title = (
                    request.input[:50] + "..."
                    if len(request.input) > 50
                    else request.input
                )
                repo.update_chat_history_title(chat_history.id, title)

            repo.commit()

            # Build response
            chat_response = ChatResponse(
                conversation_id=chat_history.id,
                model="gemini-2.5-flash",
                input=request.input,
                output=response_text,
                timestamp=datetime.now().isoformat(),
            )

            return ok(
                chat_response.model_dump(), "Successfully generated chat response", 200
            )

        except HTTPException as e:
            db.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            db.rollback()
            print(f"❌ Error in generate_chat_response: {str(e)}")
            print(f"❌ Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

    @staticmethod
    async def get_chat_histories(authorization: str, db: Session = Depends(get_db)):
        """Get all chat histories for current user"""
        try:
            # Get user ID from token (authentication already handled by middleware)
            userId = get_user_id_from_token(authorization)

            # Query chat histories
            repo = ChatRepository(db)
            chat_histories = repo.get_user_chat_histories(userId)

            # Transform to summary format
            summaries = []
            for chat in chat_histories:
                try:
                    messages = repo.get_messages_by_chat_id(chat.id or "")
                    last_message = messages[-1].text if messages else None

                    # Ensure dates are not None
                    created_date = chat.created_date or datetime.now()
                    updated_date = chat.updated_date or datetime.now()

                    summary = ChatHistorySummary(
                        id=chat.id or "",
                        title=chat.title or "New Chat",
                        model=chat.model,
                        message_count=len(messages),
                        last_message=last_message,
                        created_date=created_date,
                        updated_date=updated_date,
                    )
                    summaries.append(summary)
                except Exception as e:
                    print(f"❌ Error processing chat {chat.id}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    continue

            response = ChatHistoryListResponse(
                histories=summaries, total=len(summaries)
            )
            return ok(response.model_dump(), "Successfully fetched chat histories", 200)

        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            print(f"❌ Error in get_chat_histories: {str(e)}")
            import traceback
            traceback.print_exc()
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

    @staticmethod
    async def get_chat_history_by_id(
        history_id: str, authorization: str, db: Session = Depends(get_db)
    ):
        """Get chat history detail with all messages"""
        try:
            # Get user ID from token (authentication already handled by middleware)
            userId = get_user_id_from_token(authorization)

            # Query chat history
            repo = ChatRepository(db)
            chat_history = repo.get_chat_history_by_id(history_id, userId)

            if not chat_history:
                raise HTTPException(status_code=404, detail="Chat history not found")

            # Get messages
            messages = repo.get_messages_by_chat_id(chat_history.id)
            message_responses = [
                ChatMessageResponse(
                    id=msg.id,
                    sender=msg.sender,
                    text=msg.text,
                    created_date=msg.created_date,
                )
                for msg in messages
            ]

            # Build response
            detail = ChatHistoryDetail(
                id=chat_history.id,
                title=chat_history.title or "New Chat",
                model=chat_history.model,
                language=chat_history.language,
                is_active=chat_history.is_active,
                created_date=chat_history.created_date,
                updated_date=chat_history.updated_date,
                messages=message_responses,
            )

            return ok(detail.model_dump(), "Successfully fetched chat history", 200)

        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

    @staticmethod
    async def delete_chat_history(
        history_id: str, authorization: str, db: Session = Depends(get_db)
    ):
        """Delete chat history (soft delete)"""
        try:
            # Get user ID from token (authentication already handled by middleware)
            userId = get_user_id_from_token(authorization)

            # Verify ownership
            repo = ChatRepository(db)
            chat_history = repo.get_chat_history_by_id(history_id, userId)

            if not chat_history:
                raise HTTPException(status_code=404, detail="Chat history not found")

            # Soft delete
            success = repo.soft_delete_chat_history(history_id)
            if not success:
                raise HTTPException(
                    status_code=500, detail="Failed to delete chat history"
                )

            repo.commit()
            return ok({"deleted": True}, "Successfully deleted chat history", 200)

        except HTTPException as e:
            db.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            db.rollback()
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)

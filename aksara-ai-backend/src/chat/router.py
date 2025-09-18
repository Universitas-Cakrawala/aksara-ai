from fastapi import APIRouter
from src.chat.controller import ChatController
from src.auth.auth import JWTBearer
from src.config.postgres import get_db
from sqlalchemy.orm import Session
from src.chat.schemas import ChatRequest
from src.common.response_examples import ResponseExamples
from fastapi import Depends

routerChat = APIRouter()


@routerChat.post(
    "/message",
    dependencies=[Depends(JWTBearer())],
    responses=ResponseExamples.chat_responses(),
    summary="Generate chat response",
)
async def generate_chat_response(
    request: ChatRequest,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    return await ChatController.generate_chat_response(request, authorization, db)

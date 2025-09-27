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


@routerChat.get(
    "/histories",
    dependencies=[Depends(JWTBearer())],
    responses=ResponseExamples.chat_histories_responses(),
    summary="Get chat histories",
)
async def get_chat_histories(
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    return await ChatController.get_chat_histories(authorization, db)


# get one chat history by id
@routerChat.get(
    "/histories/{history_id}",
    dependencies=[Depends(JWTBearer())],
    responses=ResponseExamples.chat_history_responses(),
    summary="Get chat history by ID",
)
async def get_chat_history_by_id(
    history_id: str,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    return await ChatController.get_chat_history_by_id(history_id, authorization, db)

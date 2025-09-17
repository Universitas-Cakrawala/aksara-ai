from fastapi import APIRouter, Depends, Header
from src.user.controller import UserController
from src.auth.auth import JWTBearer, OptionalJWTBearer
from typing import Optional
from src.config.postgres import get_db
from sqlalchemy.orm import Session
from src.auth.handler import decodeJWT
from src.user.schemas import (
    UserCreate,
    UserUpdate,
    UserLogin,
    PasswordUpdate,
)
from src.common.response_examples import ResponseExamples


routerUser = APIRouter()


@routerUser.post(
    "/register",
    responses=ResponseExamples.user_register_responses(),
    summary="Register a new user",
)
async def register_user(
    request: UserCreate,
    authorization: str = Header(...),
    token: Optional[str] = Depends(OptionalJWTBearer),
    db: Session = Depends(get_db),
):
    if token:
        decodeJWT(token)
    return await UserController.register(request, authorization, db)


@routerUser.post(
    "/login",
    responses=ResponseExamples.user_login_responses(),
    summary="Login user",
)
async def login_user(
    request: UserLogin,
    db: Session = Depends(get_db),
):
    return await UserController.login(request, db)


@routerUser.get(
    "/profile",
    dependencies=[Depends(JWTBearer())],
    responses=ResponseExamples.user_profile_responses(),
    summary="Get user profile",
)
async def get_user_profile(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    return await UserController.profile(authorization, db)


@routerUser.delete(
    "/{id}",
    dependencies=[Depends(JWTBearer())],
    responses=ResponseExamples.user_delete_responses(),
    summary="Delete user",
)
async def delete_user(
    id: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    return await UserController.delete(id, authorization, db)


@routerUser.put(
    "/{id}",
    dependencies=[Depends(JWTBearer())],
    responses=ResponseExamples.user_update_responses(),
    summary="Update user",
)
async def update_user(
    request: UserUpdate,
    id: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    return await UserController.update(id, request, authorization, db)


@routerUser.put(
    "/update-password/{id}",
    dependencies=[Depends(JWTBearer())],
    responses=ResponseExamples.user_password_update_responses(),
    summary="Update user password",
)
async def update_user_password(
    request: PasswordUpdate,
    id: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    return await UserController.updatePasswordById(id, request, authorization, db)

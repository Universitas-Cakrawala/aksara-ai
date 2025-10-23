from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.auth.auth import JWTBearer
from src.common.response_examples import ResponseExamples
from src.config.postgres import get_db
from src.user.controller import UserController
from src.user.schemas import (
    PasswordUpdate,
    ProfileUpdate,
    UserCreate,
    UserLogin,
)

routerUser = APIRouter()


@routerUser.post(
    "/register",
    responses=ResponseExamples.user_register_responses(),
    summary="Register a new user",
)
async def register_user(
    request: UserCreate,
    db: Session = Depends(get_db),
):
    return await UserController.register(request, db)


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
    responses=ResponseExamples.user_profile_responses(),
    summary="Get user profile",
)
async def get_user_profile(
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    # Role validation handled by controller
    return await UserController.profile(authorization, db)


@routerUser.put(
    "/{id}",
    responses=ResponseExamples.user_update_responses(),
    summary="Update user profile",
)
async def update_user_profile(
    request: ProfileUpdate,
    id: str,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    # Role validation handled by controller
    return await UserController.updateProfile(id, request, authorization, db)


@routerUser.put(
    "/update-password/{id}",
    responses=ResponseExamples.user_password_update_responses(),
    summary="Update user password",
)
async def update_user_password(
    request: PasswordUpdate,
    id: str,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    # Role validation handled by controller
    return await UserController.updatePasswordById(id, request, authorization, db)

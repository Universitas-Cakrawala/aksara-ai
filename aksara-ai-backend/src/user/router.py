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
from src.utils.pagination import PageParams


routerUser = APIRouter()


@routerUser.post("/register")
async def action(
    request: UserCreate,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Depends(OptionalJWTBearer),
    db: Session = Depends(get_db),
):
    if token:
        decodeJWT(token)
    return await UserController.register(request, authorization, db)


@routerUser.post("/login")
async def action(
    request: UserLogin,
    db: Session = Depends(get_db),
):
    return await UserController.login(request, db)


@routerUser.get("/profile", dependencies=[Depends(JWTBearer())])
async def action(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    return await UserController.profile(authorization, db)


@routerUser.delete("/{id}", dependencies=[Depends(JWTBearer())])
async def action(
    id: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    return await UserController.delete(id, authorization, db)


@routerUser.put("/{id}", dependencies=[Depends(JWTBearer())])
async def action(
    request: UserUpdate,
    id: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    return await UserController.update(id, request, authorization, db)


@routerUser.put("/update-password/{id}", dependencies=[Depends(JWTBearer())])
async def action(
    request: PasswordUpdate,
    id: str,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    return await UserController.updatePasswordById(id, request, authorization, db)

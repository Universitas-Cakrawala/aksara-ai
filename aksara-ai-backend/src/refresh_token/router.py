from fastapi import APIRouter, Depends
from src.refresh_token.controller import (
    TokenHandler,
)  # Pastikan TokenHandler diimpor dengan benar
from src.auth.auth import RefreshTokenBearer
from src.common.response_examples import ResponseExamples

routerRefreshToken = APIRouter()
refresh_token_scheme = RefreshTokenBearer()


@routerRefreshToken.post(
    "",
    responses=ResponseExamples.refresh_token_responses(),
    summary="Refresh access token",
    description="Generate a new access token using a valid refresh token",
)
async def refresh_access_token(authorization: str = Depends(refresh_token_scheme)):
    # Mengambil token dengan menghilangkan kata `Bearer `
    refresh_token = authorization

    # Memanggil metode statis `refresh_access_token` pada `TokenHandler`
    response = await TokenHandler.refresh_access_token(refresh_token)
    return response

from pydantic import BaseModel
from src.auth.handler import (
    refresh_access_token as external_refresh_access_token,
)  # Fungsi refresh token dari modul eksternal
from src.common.schemas import create_success_response, create_error_response


class TokenHandler:

    class TokenResponse(BaseModel):
        access_token: str
        refresh_token: str

    @staticmethod
    async def refresh_access_token(refresh_token: str):

        new_access_token = external_refresh_access_token(refresh_token)
        if new_access_token is None:
            return create_error_response(
                message="Invalid or expired refresh token",
                error_code=401,
                status_code=401,
            )

        # Return response in the standardized format
        token_data = {
            "access_token": new_access_token["access_token"],
            "refresh_token": new_access_token["refresh_token"],
        }

        return create_success_response(
            message="Successfully refreshed access token!",
            data=token_data,
            status_code=200,
        )

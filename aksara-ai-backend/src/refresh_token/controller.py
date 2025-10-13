from pydantic import BaseModel as BaseModelV2

from src.auth.handler import (
    refresh_access_token as external_refresh_access_token,  # Fungsi refresh token dari modul eksternal
)
from src.constants import HTTP_UNAUTHORIZED
from src.utils.helper import formatError, ok


class TokenHandler:

    class TokenResponse(BaseModelV2):
        access_token: str
        refresh_token: str

    @staticmethod
    async def refresh_access_token(refresh_token: str):

        new_access_token = external_refresh_access_token(refresh_token)
        if new_access_token is None:
            return formatError(
                message="Invalid or expired refresh token",
                status_code=HTTP_UNAUTHORIZED,
            )

        # Return response in the standardized format
        token_data = {
            "access_token": new_access_token["access_token"],
            "refresh_token": new_access_token["refresh_token"],
        }

        return ok(
            values=token_data,
            message="Access token refreshed successfully",
            status_code=200,
        )

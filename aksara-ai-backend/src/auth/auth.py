import time
from typing import Optional

import jwt
from decouple import config
from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.auth.handler import decodeJWT
from src.constants import (
    HTTP_UNAUTHORIZED,
)

JWT_SECRET: str = str(config("JWT_SECRET"))
JWT_ALGORITHM: str = str(config("JWT_ALGORITHM"))


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(
            JWTBearer, self
        ).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid authentication scheme.",
                )
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid token or expired token.",
                )
            return credentials.credentials
        # else:
        #     raise HTTPException(
        #         status_code=HTTP_UNAUTHORIZED, detail="Invalid authorization code."
        #     )

    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False

        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            isTokenValid = True
        return isTokenValid


class JWTBearerLimitedEndpoints(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearerLimitedEndpoints, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(
            JWTBearerLimitedEndpoints, self
        ).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid authentication scheme.",
                )
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid token or expired token.",
                )
            return credentials.credentials

    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False

        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            isTokenValid = True
        return isTokenValid


class OptionalJWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = False):
        super(OptionalJWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid authentication scheme.",
                )
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid token or expired token.",
                )
            return credentials.credentials

    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False

        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            isTokenValid = True
        return isTokenValid


class RefreshTokenBearer(HTTPBearer):
    async def __call__(self, request: Request) -> str:
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)

        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid authentication scheme.",
                )
            token = credentials.credentials
            payload = self.verify_jwt(token)
            if payload and payload.get("type") == "refresh":
                return token
            raise HTTPException(
                status_code=HTTP_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )
        else:
            raise HTTPException(
                status_code=HTTP_UNAUTHORIZED, detail="Invalid authorization code."
            )

    def verify_jwt(self, token: str) -> dict:
        try:
            decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return (
                decoded_token
                if decoded_token["expires"] >= time.time()
                else {
                    "value": "error",
                    "message": "Token has expired",
                    "error_code": HTTP_UNAUTHORIZED,
                }
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=HTTP_UNAUTHORIZED, detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=HTTP_UNAUTHORIZED, detail="Invalid token")

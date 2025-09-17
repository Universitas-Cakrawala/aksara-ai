from typing import Dict, Optional
from decouple import config
import jwt
import time
from src.constants import HTTP_UNAUTHORIZED

JWT_SECRET: str = str(config("JWT_SECRET"))
JWT_ALGORITHM: str = str(config("JWT_ALGORITHM"))

ACCESS_TOKEN_EXPIRE_TIME_ONE_HOUR = 60 * 60  # 1 jam
ACCESS_TOKEN_EXPIRE_TIME_FIVE_MINUTES = 5 * 60  # 5 menit
ACCESS_TOKEN_EXPIRE_TIME_ONE_DAY = 24 * 60 * 60  # 1 hari
REFRESH_TOKEN_EXPIRE_TIME = 7 * 24 * 60 * 60  # 7 hari


def token_response(access_token: str, refresh_token: str) -> Dict[str, str]:
    return {"access_token": access_token, "refresh_token": refresh_token}


# Function used for signing the JWT access and refresh tokens
def signJWT(id: str) -> Dict[str, str]:
    # Membuat access token dengan masa berlaku 15 menit
    access_token_expiration = time.time() + ACCESS_TOKEN_EXPIRE_TIME_ONE_DAY
    access_payload = {"id": id, "expires": access_token_expiration, "type": "access"}
    access_token = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    # Membuat refresh token dengan masa berlaku 7 hari
    refresh_token_expiration = time.time() + REFRESH_TOKEN_EXPIRE_TIME
    refresh_payload = {"id": id, "expires": refresh_token_expiration, "type": "refresh"}
    refresh_token = jwt.encode(refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return token_response(access_token, refresh_token)


def signJWTLimitedAPI(payload: dict) -> str:

    access_token_expiration = time.time() + ACCESS_TOKEN_EXPIRE_TIME_ONE_DAY
    access_payload = {**payload, "expires": access_token_expiration, "type": "access"}
    access_token = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return access_token


def signJWT2(payload: Dict, type="access") -> str:
    access_token_expiration = time.time() + ACCESS_TOKEN_EXPIRE_TIME_ONE_DAY
    payload["expires"] = access_token_expiration
    payload["type"] = type
    encodedJWT = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return encodedJWT


def decodeJWT2(token: str) -> dict:
    try:
        if token is None or token == "":
            return {
                "value": "error",
                "message": "Token is empty",
                "error_code": HTTP_UNAUTHORIZED,
            }

        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # Periksa apakah token sudah kadaluwarsa
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
        return {
            "value": "error",
            "message": "Token has expired",
            "error_code": HTTP_UNAUTHORIZED,
        }
    except jwt.InvalidTokenError:
        return {
            "value": "error",
            "message": "Invalid token",
            "error_code": HTTP_UNAUTHORIZED,
        }


def decodeJWT(token: str) -> dict:
    try:
        if token is None or token == "":
            return {
                "value": "error",
                "message": "Token is empty",
                "error_code": HTTP_UNAUTHORIZED,
            }

        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # Periksa apakah token sudah kadaluwarsa
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
        return {
            "value": "error",
            "message": "Token has expired",
            "error_code": HTTP_UNAUTHORIZED,
        }
    except jwt.InvalidTokenError:
        return {
            "value": "error",
            "message": "Invalid token",
            "error_code": HTTP_UNAUTHORIZED,
        }


# Fungsi untuk mendapatkan access token baru dari refresh token
def refresh_access_token(refresh_token: str) -> Optional[Dict[str, str]]:
    decoded_token = decodeJWT(refresh_token)
    if decoded_token and decoded_token.get("type") == "refresh":
        # Buat access token baru jika refresh token masih valid
        new_access_token = signJWT(decoded_token["id"])["access_token"]
        return token_response(new_access_token, refresh_token)
    return None


def get_current_user(jwtoken: str) -> Optional[str]:
    try:
        payload = decodeJWT(jwtoken)
        if payload:
            return payload["id"]
    except:
        pass
    return None  # Kembalikan None jika token tidak valid

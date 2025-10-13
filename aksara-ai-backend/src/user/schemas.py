from typing import Dict, List, Optional

from pydantic import BaseModel as BaseModelV2

from src.user.models import UserRole
from src.utils.date import serialize_date


class UserCreate(BaseModelV2):
    username: str
    password: str
    nama_lengkap: str
    email: str
    role: Optional[UserRole] = UserRole.USER


class UserUpdate(BaseModelV2):
    username: str
    password: str
    nama_lengkap: str
    email: str
    role: Optional[UserRole] = None


class ProfileUpdate(BaseModelV2):
    username: str
    nama_lengkap: str
    email: str


class PasswordUpdate(BaseModelV2):
    old_password: str
    confirm_new_password: str
    new_password: str


class UserLogin(BaseModelV2):
    username: str
    password: str


def actionTransformUser(userValue, profileValue):
    return {
        "username": userValue.username,
        "nama_lengkap": profileValue.nama_lengkap,
        "email": profileValue.email,
        "created_by": userValue.created_by,
        "created_date": serialize_date(userValue.created_date),
    }


def mapUserData(user_data):
    user, profile = user_data
    mapped_data = {
        "user": {
            "id": str(user.id),
            "is_active": user.is_active,
            "username": user.username,
            "created_by": user.created_by,
            "updated_by": user.updated_by,
            "deleted": user.deleted,
            "created_date": serialize_date(user.created_date),
            "updated_date": serialize_date(user.updated_date),
        },
        "profile": {
            "id_user": str(profile.id_user),
            "nama_lengkap": profile.nama_lengkap,
            "email": profile.email,
            "created_by": profile.created_by,
            "updated_by": profile.updated_by,
            "created_date": serialize_date(profile.created_date),
            "updated_date": serialize_date(profile.updated_date),
        },
    }

    return mapped_data


def mapUserProfileData(user_data):
    user, profile = user_data

    mapped_data = {
        "user": {
            "id": str(user.id),
            "is_active": user.is_active,
            "username": user.username,
            "created_by": user.created_by,
            "updated_by": user.updated_by,
            "deleted": user.deleted,
            "created_date": serialize_date(user.created_date),
            "updated_date": serialize_date(user.updated_date),
        },
        "profile": {
            "id_user": str(profile.id_user),
            "nama_lengkap": profile.nama_lengkap,
            "email": profile.email,
            "created_by": profile.created_by,
            "updated_by": profile.updated_by,
            "created_date": serialize_date(profile.created_date),
            "updated_date": serialize_date(profile.updated_date),
        },
    }

    return mapped_data


def transformUsers(results: List[tuple]) -> List[Dict]:
    mapped_results = []
    for user, profile in results:
        user_dict = {
            "user": {
                "id": str(user.id),
                "is_active": user.is_active,
                "username": user.username,
                "created_by": user.created_by,
                "updated_by": user.updated_by,
                "deleted": user.deleted,
                "created_date": serialize_date(user.created_date),
                "updated_date": serialize_date(user.updated_date),
            },
            "profile": {
                "id_user": str(profile.id_user),
                "nama_lengkap": profile.nama_lengkap,
                "email": profile.email,
                "created_by": profile.created_by,
                "updated_by": profile.updated_by,
                "created_date": serialize_date(profile.created_date),
                "updated_date": serialize_date(profile.updated_date),
            },
        }
        mapped_results.append(user_dict)
    return mapped_results


def actionTransformUserLogin(values):
    return {"id": str(values.id), "password": values.password}


def singleTransformSignJWT(values):
    return {"access_token": f'{values["access_token"]}'}

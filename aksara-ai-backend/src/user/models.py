from sqlmodel import SQLModel, Field
import datetime
from typing import Optional
import uuid
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"


class User(SQLModel, table=True):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True
    )
    username: str = Field(unique=True, index=True)
    password: str
    is_active: bool
    role: UserRole = Field(default=UserRole.USER, index=True)
    deleted: bool = Field(default=False)
    created_by: str
    created_date: Optional[datetime.datetime] = None
    updated_by: str
    updated_date: Optional[datetime.datetime] = None


class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profile"
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True
    )
    id_user: str = Field(foreign_key="user.id", unique=True)
    nama_lengkap: str
    email: str
    deleted: bool = Field(default=False)
    created_by: str
    created_date: Optional[datetime.datetime] = None
    updated_by: str
    updated_date: Optional[datetime.datetime] = None

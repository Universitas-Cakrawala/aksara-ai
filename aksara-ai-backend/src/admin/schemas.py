"""
Admin Schemas - Request and Response models for Admin API
"""

from typing import Optional

from pydantic import BaseModel

from src.user.models import UserRole


class UserListResponse(BaseModel):
    """Response model for user list"""

    id: str
    username: str
    role: UserRole
    is_active: bool
    deleted: bool
    created_date: str
    email: Optional[str] = None
    nama_lengkap: Optional[str] = None

    class Config:
        from_attributes = True


class UserStatisticsResponse(BaseModel):
    """Response model for user statistics"""

    total_users: int
    admin_users: int
    regular_users: int


class ToggleUserActiveRequest(BaseModel):
    """Request model to toggle user active status"""

    is_active: bool


class ChangeUserRoleRequest(BaseModel):
    """Request model to change user role"""

    role: UserRole


class AdminUserCreateRequest(BaseModel):
    """Request model for admin to create user"""

    username: str
    password: str
    nama_lengkap: str
    email: str
    role: UserRole = UserRole.USER


class AdminUserUpdateRequest(BaseModel):
    """Request model for admin to update user"""

    username: Optional[str] = None
    nama_lengkap: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

"""
AdminRouter - REST API routes for admin functionality
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.admin.controller import AdminController
from src.admin.schemas import (
    AdminUserCreateRequest,
    AdminUserUpdateRequest,
    ChangeUserRoleRequest,
    ToggleUserActiveRequest,
)
from src.auth.auth import JWTBearer
from src.config.postgres import get_db

# Create admin router
admin_router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@admin_router.get(
    "/statistics",
    summary="Get dashboard statistics",
)
async def get_statistics(
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    """Get dashboard statistics - Admin only"""
    return await AdminController.get_dashboard_statistics(authorization, db)


@admin_router.get(
    "/users",
    summary="Get all users",
)
async def get_all_users(
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    """Get all users - Admin only"""
    return await AdminController.get_all_users(authorization, db)


@admin_router.get(
    "/users/{user_id}",
    summary="Get user by ID",
)
async def get_user(
    user_id: str,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    """Get user by ID - Admin only"""
    return await AdminController.get_user_by_id(user_id, authorization, db)


@admin_router.post(
    "/users",
    summary="Create new user",
)
async def create_user(
    request: AdminUserCreateRequest,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    """Create new user - Admin only"""
    return await AdminController.create_user(request, authorization, db)


@admin_router.put(
    "/users/{user_id}",
    summary="Update user",
)
async def update_user(
    user_id: str,
    request: AdminUserUpdateRequest,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    """Update user - Admin only"""
    return await AdminController.update_user(user_id, request, authorization, db)


@admin_router.patch(
    "/users/{user_id}/toggle-active",
    summary="Toggle user active status",
)
async def toggle_user_active(
    user_id: str,
    request: ToggleUserActiveRequest,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    """Toggle user active status - Admin only"""
    return await AdminController.toggle_user_active(user_id, request, authorization, db)


@admin_router.delete(
    "/users/{user_id}",
    summary="Delete user",
)
async def delete_user(
    user_id: str,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    """Soft delete user - Admin only"""
    return await AdminController.delete_user(user_id, authorization, db)


@admin_router.patch(
    "/users/{user_id}/change-role",
    summary="Change user role",
)
async def change_user_role(
    user_id: str,
    request: ChangeUserRoleRequest,
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    """Change user role - Admin only"""
    return await AdminController.change_user_role(user_id, request, authorization, db)


def setup_admin_routes(app):
    """Setup admin routes"""
    app.include_router(admin_router)
    return admin_router

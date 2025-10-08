"""
AdminRouter - Route definitions for admin functionality
"""

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from src.admin.controller import AdminController
from src.config.postgres import get_db
from src.user.models import User, UserRole

# Create admin router
admin_router = APIRouter(prefix="/admin", tags=["admin"])


@admin_router.get("/login", response_class=HTMLResponse)
async def admin_login_page(request: Request):
    """Display admin login page"""
    return await AdminController.login_page(request)


@admin_router.post("/login")
async def admin_login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    """Handle admin login"""
    return await AdminController.login(request, username, password, db)


@admin_router.get("/logout")
async def admin_logout(request: Request):
    """Handle admin logout"""
    return await AdminController.logout(request)


@admin_router.get("/dashboard", response_class=HTMLResponse)
async def admin_dashboard(
    request: Request,
    current_admin: User = Depends(AdminController.require_admin),
    db: Session = Depends(get_db),
):
    """Admin dashboard"""
    return await AdminController.dashboard(request, current_admin, db)


@admin_router.get("/users", response_class=HTMLResponse)
async def admin_users_list(
    request: Request,
    current_admin: User = Depends(AdminController.require_admin),
    db: Session = Depends(get_db),
):
    """List all users"""
    return await AdminController.users_list(request, current_admin, db)


@admin_router.post("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    current_admin: User = Depends(AdminController.require_admin),
    db: Session = Depends(get_db),
):
    """Toggle user active status"""
    return await AdminController.toggle_user_active(user_id, current_admin, db)


@admin_router.post("/users/{user_id}/delete")
async def delete_user(
    user_id: str,
    current_admin: User = Depends(AdminController.require_admin),
    db: Session = Depends(get_db),
):
    """Soft delete user"""
    return await AdminController.delete_user(user_id, current_admin, db)


@admin_router.post("/users/{user_id}/change-role")
async def change_user_role(
    user_id: str,
    role: UserRole = Form(...),
    current_admin: User = Depends(AdminController.require_admin),
    db: Session = Depends(get_db),
):
    """Change user role"""
    return await AdminController.change_user_role(user_id, role, current_admin, db)


def setup_admin_routes(app):
    """Setup admin routes"""
    app.include_router(admin_router)
    return admin_router

"""
AdminController - Business logic for admin functionality
"""

import hashlib
from typing import Union

import bcrypt
from fastapi import Depends, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from src.admin.repository import AdminRepository
from src.config.postgres import get_db
from src.user.models import User, UserRole

# Initialize templates
templates = Jinja2Templates(directory="templates")


class AdminController:
    """Controller class for Admin business logic"""

    @staticmethod
    def require_admin(request: Request, db: Session = Depends(get_db)) -> User:
        """Dependency to require admin authentication"""
        admin_id = request.session.get("admin_user_id")
        if not admin_id:
            raise HTTPException(status_code=401, detail="Not authenticated")

        repo = AdminRepository(db)
        user = repo.get_admin_by_id(admin_id)

        if not user:
            raise HTTPException(status_code=401, detail="Not authorized")

        return user

    @staticmethod
    async def login_page(request: Request) -> HTMLResponse:
        """Display admin login page"""
        return templates.TemplateResponse("admin/login.html", {"request": request})

    @staticmethod
    async def login(
        request: Request,
        username: str = Form(...),
        password: str = Form(...),
        db: Session = Depends(get_db),
    ) -> Union[RedirectResponse, HTMLResponse]:
        """Handle admin login"""
        try:
            repo = AdminRepository(db)
            user = repo.get_admin_by_username(username)

            if not user:
                return templates.TemplateResponse(
                    "admin/login.html",
                    {"request": request, "error": "Invalid credentials"},
                )

            # Verify password - handle both bcrypt and SHA256 hashes
            password_valid = AdminController._verify_password(password, user.password)

            if not password_valid:
                return templates.TemplateResponse(
                    "admin/login.html",
                    {"request": request, "error": "Invalid credentials"},
                )

            # Set session
            request.session["admin_user_id"] = user.id
            return RedirectResponse(url="/admin/dashboard", status_code=302)

        except Exception as e:
            return templates.TemplateResponse(
                "admin/login.html",
                {"request": request, "error": f"Login failed: {str(e)}"},
            )

    @staticmethod
    async def logout(request: Request) -> RedirectResponse:
        """Handle admin logout"""
        request.session.clear()
        return RedirectResponse(url="/admin/login", status_code=302)

    @staticmethod
    async def dashboard(
        request: Request,
        current_admin: User = Depends(require_admin),
        db: Session = Depends(get_db),
    ) -> HTMLResponse:
        """Admin dashboard"""
        repo = AdminRepository(db)
        stats = repo.get_user_statistics()

        return templates.TemplateResponse(
            "admin/dashboard.html",
            {"request": request, "current_admin": current_admin, "stats": stats},
        )

    @staticmethod
    async def users_list(
        request: Request,
        current_admin: User = Depends(require_admin),
        db: Session = Depends(get_db),
    ) -> HTMLResponse:
        """List all users"""
        repo = AdminRepository(db)
        users = repo.get_all_users()

        return templates.TemplateResponse(
            "admin/users.html",
            {"request": request, "current_admin": current_admin, "users": users},
        )

    @staticmethod
    async def toggle_user_active(
        user_id: str,
        current_admin: User = Depends(require_admin),
        db: Session = Depends(get_db),
    ) -> RedirectResponse:
        """Toggle user active status"""
        try:
            repo = AdminRepository(db)
            user = repo.get_user_by_id(user_id)

            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Toggle active status
            new_status = not user.is_active
            success = repo.update_user_active_status(user_id, new_status)

            if not success:
                raise HTTPException(
                    status_code=400, detail="Failed to update user status"
                )

            repo.commit()
            return RedirectResponse(url="/admin/users", status_code=302)

        except HTTPException:
            repo.rollback()
            raise
        except Exception as e:
            repo.rollback()
            raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

    @staticmethod
    async def delete_user(
        user_id: str,
        current_admin: User = Depends(require_admin),
        db: Session = Depends(get_db),
    ) -> RedirectResponse:
        """Soft delete user"""
        try:
            repo = AdminRepository(db)
            user = repo.get_user_by_id(user_id)

            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Prevent admin from deleting themselves
            if user.id == current_admin.id:
                raise HTTPException(status_code=400, detail="Cannot delete yourself")

            success = repo.soft_delete_user(user_id, current_admin.username)

            if not success:
                raise HTTPException(status_code=400, detail="Failed to delete user")

            repo.commit()
            return RedirectResponse(url="/admin/users", status_code=302)

        except HTTPException:
            repo.rollback()
            raise
        except Exception as e:
            repo.rollback()
            raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

    @staticmethod
    async def change_user_role(
        user_id: str,
        role: UserRole = Form(...),
        current_admin: User = Depends(require_admin),
        db: Session = Depends(get_db),
    ) -> RedirectResponse:
        """Change user role"""
        try:
            repo = AdminRepository(db)
            user = repo.get_user_by_id(user_id)

            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            success = repo.update_user_role(user_id, role)

            if not success:
                raise HTTPException(
                    status_code=400, detail="Failed to update user role"
                )

            repo.commit()
            return RedirectResponse(url="/admin/users", status_code=302)

        except HTTPException:
            repo.rollback()
            raise
        except Exception as e:
            repo.rollback()
            raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

    @staticmethod
    def _verify_password(password: str, stored_password: str) -> bool:
        """Verify password against stored hash (supports bcrypt and SHA256 fallback)"""
        try:
            # Try bcrypt verification first
            if stored_password.startswith("$2b$") or stored_password.startswith("$2a$"):
                return bcrypt.checkpw(
                    password.encode("utf-8"), stored_password.encode("utf-8")
                )
            else:
                # If not bcrypt format, try SHA256 (fallback for old passwords)
                sha256_hash = hashlib.sha256(password.encode()).hexdigest()
                return stored_password == sha256_hash
        except Exception:
            # If bcrypt fails, try SHA256 (fallback for old passwords)
            sha256_hash = hashlib.sha256(password.encode()).hexdigest()
            return stored_password == sha256_hash

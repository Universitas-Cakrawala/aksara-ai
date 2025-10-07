"""
FastAPI Admin Configuration
This module sets up a simple admin interface for user management
"""

from fastapi import APIRouter, Request, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from datetime import datetime
import bcrypt
import hashlib

from src.config.postgres import get_db
from src.user.models import User, UserRole

# Initialize templates
templates = Jinja2Templates(directory="templates")

# Create admin router
admin_router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(request: Request, db: Session = Depends(get_db)) -> User:
    """Dependency to require admin authentication"""
    admin_id = request.session.get("admin_user_id")
    if not admin_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = (
        db.query(User)
        .filter(
            User.id == admin_id,
            User.role == UserRole.ADMIN,
            User.is_active == True,
            User.deleted == False,
        )
        .first()
    )

    if not user:
        raise HTTPException(status_code=401, detail="Not authorized")

    return user


@admin_router.get("/login", response_class=HTMLResponse)
async def admin_login_page(request: Request):
    """Display admin login page"""
    return templates.TemplateResponse("admin/login.html", {"request": request})


@admin_router.post("/login")
async def admin_login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    """Handle admin login"""
    try:
        user = (
            db.query(User)
            .filter(
                User.username == username,
                User.role == UserRole.ADMIN,
                User.is_active == True,
                User.deleted == False,
            )
            .first()
        )

        if not user:
            return templates.TemplateResponse(
                "admin/login.html", {"request": request, "error": "Invalid credentials"}
            )

        # Verify password - handle both bcrypt and SHA256 hashes
        password_valid = False
        try:
            # Try bcrypt verification first
            if user.password.startswith("$2b$") or user.password.startswith("$2a$"):
                password_valid = bcrypt.checkpw(
                    password.encode("utf-8"), user.password.encode("utf-8")
                )
            else:
                # If not bcrypt format, try SHA256 (fallback for old passwords)
                sha256_hash = hashlib.sha256(password.encode()).hexdigest()
                password_valid = user.password == sha256_hash
        except Exception as bcrypt_error:
            # If bcrypt fails, try SHA256 (fallback for old passwords)
            sha256_hash = hashlib.sha256(password.encode()).hexdigest()
            password_valid = user.password == sha256_hash

        if not password_valid:
            return templates.TemplateResponse(
                "admin/login.html", {"request": request, "error": "Invalid credentials"}
            )

        # Set session
        request.session["admin_user_id"] = user.id
        return RedirectResponse(url="/admin/dashboard", status_code=302)

    except Exception as e:
        return templates.TemplateResponse(
            "admin/login.html", {"request": request, "error": f"Login failed: {str(e)}"}
        )


@admin_router.get("/logout")
async def admin_logout(request: Request):
    """Handle admin logout"""
    request.session.clear()
    return RedirectResponse(url="/admin/login", status_code=302)


@admin_router.get("/dashboard", response_class=HTMLResponse)
async def admin_dashboard(
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin dashboard"""
    # Get user statistics
    total_users = db.query(User).filter(User.deleted == False).count()
    admin_users = (
        db.query(User)
        .filter(User.role == UserRole.ADMIN, User.deleted == False)
        .count()
    )
    regular_users = (
        db.query(User).filter(User.role == UserRole.USER, User.deleted == False).count()
    )

    stats = {
        "total_users": total_users,
        "admin_users": admin_users,
        "regular_users": regular_users,
    }

    return templates.TemplateResponse(
        "admin/dashboard.html",
        {"request": request, "current_admin": current_admin, "stats": stats},
    )


@admin_router.get("/users", response_class=HTMLResponse)
async def admin_users_list(
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all users"""
    users = db.query(User).filter(User.deleted == False).all()

    return templates.TemplateResponse(
        "admin/users.html",
        {"request": request, "current_admin": current_admin, "users": users},
    )


@admin_router.post("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Toggle user active status"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()

    return RedirectResponse(url="/admin/users", status_code=302)


@admin_router.post("/users/{user_id}/delete")
async def delete_user(
    user_id: str,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Soft delete user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admin from deleting themselves
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user.deleted = True
    user.updated_by = current_admin.username
    user.updated_date = datetime.now()
    db.commit()

    return RedirectResponse(url="/admin/users", status_code=302)


@admin_router.post("/users/{user_id}/change-role")
async def change_user_role(
    user_id: str,
    role: UserRole = Form(...),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Change user role"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    db.commit()

    return RedirectResponse(url="/admin/users", status_code=302)


def setup_admin_routes(app):
    """Setup admin routes"""
    app.include_router(admin_router)
    return admin_router

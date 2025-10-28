"""
AdminController - Business logic for admin functionality (API-based)
"""

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from src.admin.repository import AdminRepository
from src.admin.schemas import (
    AdminUserCreateRequest,
    AdminUserUpdateRequest,
    ChangeUserRoleRequest,
    ToggleUserActiveRequest,
)
from src.config.postgres import get_db
from src.constants import (
    HTTP_BAD_REQUEST,
    HTTP_CREATED,
    HTTP_FORBIDDEN,
    HTTP_NOT_FOUND,
    HTTP_OK,
    HTTP_UNAUTHORIZED,
)
from src.middleware.middleware import (
    get_password_hash,
    get_user_id_from_token,
    require_admin_role,
)
from src.user.repository import UserRepository
from src.utils.date import serialize_date
from src.utils.helper import formatError, ok, validateEmail


class AdminController:
    """Controller class for Admin business logic - REST API based"""

    @staticmethod
    async def get_dashboard_statistics(
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        """Get dashboard statistics for admin"""
        try:
            admin_role = require_admin_role(authorization, db)
            if not admin_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! Admin role required.",
                )

            repo = AdminRepository(db)
            stats = repo.get_user_statistics()

            return ok(stats, "Successfully retrieved statistics!", HTTP_OK)
        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def get_all_users(
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        """Get all users - Admin only"""
        try:
            admin_role = require_admin_role(authorization, db)
            if not admin_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! Admin role required.",
                )

            repo = AdminRepository(db)
            user_repo = UserRepository(db)

            users = repo.get_all_users()

            # Transform users data with profile information
            users_data = []
            for user in users:
                profile = user_repo.get_profile_by_user_id(str(user.id))
                user_data = {
                    "id": str(user.id),
                    "username": user.username,
                    "role": user.role,
                    "is_active": user.is_active,
                    "deleted": user.deleted,
                    "created_date": serialize_date(user.created_date),
                    "email": profile.email if profile else None,
                    "nama_lengkap": profile.nama_lengkap if profile else None,
                }
                users_data.append(user_data)

            return ok(users_data, "Successfully retrieved all users!", HTTP_OK)
        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def get_user_by_id(
        user_id: str,
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        """Get user by ID - Admin only"""
        try:
            admin_role = require_admin_role(authorization, db)
            if not admin_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! Admin role required.",
                )

            repo = AdminRepository(db)
            user_repo = UserRepository(db)

            user = repo.get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail=f"User with id {user_id} not found!",
                )

            profile = user_repo.get_profile_by_user_id(user_id)
            user_data = {
                "id": str(user.id),
                "username": user.username,
                "role": user.role,
                "is_active": user.is_active,
                "deleted": user.deleted,
                "created_date": serialize_date(user.created_date),
                "email": profile.email if profile else None,
                "nama_lengkap": profile.nama_lengkap if profile else None,
            }

            return ok(user_data, "Successfully retrieved user!", HTTP_OK)
        except HTTPException as e:
            return formatError(e.detail, e.status_code)
        except Exception as e:
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def create_user(
        request: AdminUserCreateRequest,
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        """Create new user - Admin only"""
        try:
            admin_role = require_admin_role(authorization, db)
            if not admin_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! Admin role required.",
                )

            user_repo = UserRepository(db)
            admin_repo = AdminRepository(db)

            admin_id = get_user_id_from_token(authorization)
            admin_user = admin_repo.get_admin_by_id(admin_id)
            if not admin_user:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid admin session!",
                )

            # Validate input
            username = request.username.strip()
            password = request.password.strip()
            nama_lengkap = request.nama_lengkap.strip()
            email = request.email.strip()

            if not validateEmail(email):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Email tidak valid!",
                )

            if username == "":
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Username couldn't be empty!",
                )
            elif len(password) < 8:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Password must be at least 8 characters!",
                )
            elif len(password.encode("utf-8")) > 72:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Password is too long! Maximum 72 bytes allowed.",
                )

            # Check if email/username already exists
            if user_repo.is_email_taken(email):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail=f"Email : {email} already exists!",
                )

            if user_repo.is_username_taken(username):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Username already exists!",
                )

            # Hash password
            hashed_password = get_password_hash(password)

            # Create user with specified role
            user = user_repo.create_user(
                username, hashed_password, admin_user.username, role=request.role
            )
            profile = user_repo.create_user_profile(
                user.id, nama_lengkap, email, admin_user.username
            )

            # Commit transaction
            user_repo.commit()

            response_data = {
                "id": str(user.id),
                "username": user.username,
                "role": user.role,
                "nama_lengkap": profile.nama_lengkap,
                "email": profile.email,
            }

            return ok(response_data, "User created successfully!", HTTP_CREATED)
        except HTTPException as e:
            user_repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            user_repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def update_user(
        user_id: str,
        request: AdminUserUpdateRequest,
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        """Update user - Admin only"""
        try:
            admin_role = require_admin_role(authorization, db)
            if not admin_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! Admin role required.",
                )

            user_repo = UserRepository(db)
            admin_repo = AdminRepository(db)

            admin_id = get_user_id_from_token(authorization)
            admin_user = admin_repo.get_admin_by_id(admin_id)
            if not admin_user:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid admin session!",
                )

            # Check if user exists
            user = user_repo.get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail=f"User with id {user_id} not found!",
                )

            profile = user_repo.get_profile_by_user_id(user_id)

            # Prepare update data
            user_updates = {}
            profile_updates = {}

            # Update username if provided
            if request.username and request.username.strip():
                if user_repo.is_username_taken(
                    request.username.strip(), exclude_user_id=user_id
                ):
                    raise HTTPException(
                        status_code=HTTP_BAD_REQUEST,
                        detail="Username already exists!",
                    )
                user_updates["username"] = request.username.strip()
                user_updates["updated_by"] = admin_user.username

            # Update role if provided
            if request.role:
                user_updates["role"] = request.role
                user_updates["updated_by"] = admin_user.username

            # Update is_active if provided
            if request.is_active is not None:
                user_updates["is_active"] = request.is_active
                user_updates["updated_by"] = admin_user.username

            # Update profile fields if provided
            if request.email and request.email.strip():
                if not validateEmail(request.email):
                    raise HTTPException(
                        status_code=HTTP_BAD_REQUEST,
                        detail="Email tidak valid!",
                    )
                if user_repo.is_email_taken(request.email, exclude_user_id=user_id):
                    raise HTTPException(
                        status_code=HTTP_BAD_REQUEST,
                        detail=f"Email : {request.email} already exists!",
                    )
                profile_updates["email"] = request.email
                profile_updates["updated_by"] = admin_user.username

            if request.nama_lengkap:
                profile_updates["nama_lengkap"] = request.nama_lengkap
                profile_updates["updated_by"] = admin_user.username

            # Perform updates
            if user_updates:
                user_repo.update_user(user_id, user_updates)

            if profile_updates and profile:
                user_repo.update_user_profile(profile.id, profile_updates)

            # Commit transaction
            user_repo.commit()

            return ok("", "User updated successfully!", HTTP_OK)
        except HTTPException as e:
            user_repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            user_repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def toggle_user_active(
        user_id: str,
        request: ToggleUserActiveRequest,
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        """Toggle user active status - Admin only"""
        try:
            admin_role = require_admin_role(authorization, db)
            if not admin_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! Admin role required.",
                )

            admin_repo = AdminRepository(db)

            user = admin_repo.get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail="User not found!",
                )

            success = admin_repo.update_user_active_status(user_id, request.is_active)
            if not success:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Failed to update user status!",
                )

            admin_repo.commit()

            status_text = "activated" if request.is_active else "deactivated"
            return ok("", f"User {status_text} successfully!", HTTP_OK)
        except HTTPException as e:
            admin_repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            admin_repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def delete_user(
        user_id: str,
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        """Soft delete user - Admin only"""
        try:
            admin_role = require_admin_role(authorization, db)
            if not admin_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! Admin role required.",
                )

            admin_repo = AdminRepository(db)

            admin_id = get_user_id_from_token(authorization)
            admin_user = admin_repo.get_admin_by_id(admin_id)
            if not admin_user:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Invalid admin session!",
                )

            user = admin_repo.get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail="User not found!",
                )

            # Prevent admin from deleting themselves
            if user_id == str(admin_user.id):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Cannot delete yourself!",
                )

            success = admin_repo.soft_delete_user(user_id, admin_user.username)
            if not success:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Failed to delete user!",
                )

            admin_repo.commit()

            return ok("", "User deleted successfully!", HTTP_OK)
        except HTTPException as e:
            admin_repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            admin_repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def change_user_role(
        user_id: str,
        request: ChangeUserRoleRequest,
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        """Change user role - Admin only"""
        try:
            admin_role = require_admin_role(authorization, db)
            if not admin_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! Admin role required.",
                )

            admin_repo = AdminRepository(db)
            user = admin_repo.get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail="User not found!",
                )

            success = admin_repo.update_user_role(user_id, request.role)
            if not success:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Failed to update user role!",
                )

            admin_repo.commit()

            return ok("", f"User role changed to {request.role}!", HTTP_OK)
        except HTTPException as e:
            admin_repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            admin_repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

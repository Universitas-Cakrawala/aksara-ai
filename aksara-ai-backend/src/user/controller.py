from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from src.auth.handler import signJWT
from src.config.postgres import get_db
from src.constants import (
    HTTP_ACCEPTED,
    HTTP_BAD_REQUEST,
    HTTP_CREATED,
    HTTP_NOT_FOUND,
    HTTP_OK,
    HTTP_UNAUTHORIZED,
    HTTP_FORBIDDEN,
)
from src.user.repository import UserRepository
from src.user.schemas import (
    PasswordUpdate,
    ProfileUpdate,
    UserCreate,
    UserLogin,
    UserUpdate,
    actionTransformUserLogin,
    mapUserProfileData,
)
from src.middleware.middleware import (
    get_password_hash,
    verify_password,
    get_user_id_from_token,
    require_user_role,
)
from src.utils.helper import formatError, ok, validateEmail


class UserController:
    @staticmethod
    async def register(
        request: UserCreate,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        try:
            # Initialize repository
            repo = UserRepository(db)

            # Extract and validate input data
            username = request.username.strip()
            password = request.password.strip()
            nama_lengkap = request.nama_lengkap.strip()
            email = request.email.strip()

            # Validate email format
            if not validateEmail(email):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Email tidak valid!",
                )

            # Validate input constraints
            if username == "":
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Username couldn't be empty!",
                )
            elif len(password) < 8:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="password must be at least 8 characters!",
                )
            elif len(password.encode("utf-8")) > 72:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Password is too long! Maximum 72 bytes allowed.",
                )

            # Check if email already exists
            if repo.is_email_taken(email):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail=f"Email : {email} already exists!",
                )

            # Check if username already exists
            if repo.is_username_taken(username):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Username already exists!",
                )

            # Hash password
            hashed_password = get_password_hash(password)

            # Create user and profile
            user = repo.create_user(username, hashed_password, username)
            profile = repo.create_user_profile(user.id, nama_lengkap, email, username)

            # Commit transaction
            repo.commit()

            # Auto-login user after successful registration by generating tokens
            tokens = signJWT(str(user.id))
            response_data = {
                "id": str(user.id),
                "username": user.username,
                "nama_lengkap": profile.nama_lengkap,
                "email": profile.email,
                "access_token": tokens.get("access_token"),
                "refresh_token": tokens.get("refresh_token"),
            }

            return ok(response_data, "Successfully Create User!", HTTP_CREATED)
        except HTTPException as e:
            repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def update(
        id: str,
        request: UserUpdate,
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        try:
            user_role = require_user_role(authorization, db)
            if not user_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! User role required.",
                )

            # Initialize repository
            repo = UserRepository(db)

            # Get user ID from token (authentication already handled by middleware)
            user_id = get_user_id_from_token(authorization)

            # Validate email format
            if not validateEmail(request.email):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Email tidak valid!",
                )

            # Check if email already exists (excluding current user)
            if repo.is_email_taken(request.email, exclude_user_id=id):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail=f"Email : {request.email} already exists!",
                )

            # Check if user exists
            existing_user = repo.get_user_by_id(id)
            if not existing_user:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail=f"User with id {id} not found!",
                )

            # Check if user profile exists
            existing_profile = repo.get_profile_by_user_id(id)
            if not existing_profile:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail="Your profile not found!",
                )

            # Get current user data for audit
            current_user_data = repo.get_user_by_id(user_id)
            if not current_user_data:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="Session has ended, please login again!",
                )

            # Prepare update data
            user_update_data = {}
            profile_update_data = {}

            # Update username if provided and not empty
            if request.username.strip():
                user_update_data["username"] = request.username.strip()
                user_update_data["updated_by"] = current_user_data.username

            # Update profile fields if provided
            if request.nama_lengkap:
                profile_update_data["nama_lengkap"] = request.nama_lengkap
                profile_update_data["updated_by"] = current_user_data.username

            if request.email:
                profile_update_data["email"] = request.email
                profile_update_data["updated_by"] = current_user_data.username

            # Perform updates using repository
            if user_update_data:
                repo.update_user(id, user_update_data)

            if profile_update_data:
                repo.update_user_profile(existing_profile.id, profile_update_data)

            # Commit transaction
            repo.commit()

            return ok(
                "",
                f"User with name {request.nama_lengkap} update successfully!",
                HTTP_OK,
            )
        except HTTPException as e:
            repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def updateProfile(
        id: str,
        request: ProfileUpdate,
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        try:
            user_role = require_user_role(authorization, db)
            if not user_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! User role required.",
                )

            # Initialize repository
            repo = UserRepository(db)

            # Get user ID from token (authentication already handled by middleware)
            user_id = get_user_id_from_token(authorization)

            # Validate that the user is updating their own profile
            if user_id != id:
                raise HTTPException(
                    status_code=HTTP_UNAUTHORIZED,
                    detail="You can only update your own profile!",
                )

            # Validate email format
            if not validateEmail(request.email):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Email tidak valid!",
                )

            # Check if email already exists (excluding current user)
            if repo.is_email_taken(request.email, exclude_user_id=id):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail=f"Email : {request.email} already exists!",
                )

            # Check if username already exists (excluding current user)
            if repo.is_username_taken(request.username.strip(), exclude_user_id=id):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail=f"Username : {request.username} already exists!",
                )

            # Get current user and profile
            user = repo.get_user_by_id(id)
            if not user:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail=f"User with id {id} not found!",
                )

            profile = repo.get_profile_by_user_id(id)
            if not profile:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail="User profile not found!",
                )

            # Prepare update data
            user_updates = {}
            profile_updates = {}

            # Update username if changed
            if request.username.strip() != user.username:
                user_updates["username"] = request.username.strip()
                user_updates["updated_by"] = user.username

            # Update profile fields if changed
            if request.nama_lengkap != profile.nama_lengkap:
                profile_updates["nama_lengkap"] = request.nama_lengkap
                profile_updates["updated_by"] = user.username

            if request.email != profile.email:
                profile_updates["email"] = request.email
                profile_updates["updated_by"] = user.username

            # Perform updates using repository
            if user_updates:
                repo.update_user(id, user_updates)

            if profile_updates:
                repo.update_user_profile(profile.id, profile_updates)

            # Commit transaction
            repo.commit()

            return ok(
                "",
                "Profile updated successfully!",
                HTTP_OK,
            )
        except HTTPException as e:
            repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def login(
        request: UserLogin,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        try:
            # Initialize repository
            repo = UserRepository(db)

            # Extract and validate input
            username = request.username.strip()
            password = request.password.strip()

            if username == "":
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="username couldn't be empty!",
                )
            elif len(password) < 8:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="password must be at least 8 characters!",
                )
            elif len(password.encode("utf-8")) > 72:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Password is too long! Maximum 72 bytes allowed.",
                )

            # Get user with profile from repository
            user_with_profile = repo.get_user_with_profile_by_username(username)
            if not user_with_profile:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail="user not found!",
                )

            user, profile = user_with_profile

            # Check if user is active
            if not user.is_active:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Your account is no longer active!",
                )

            # Verify password
            transformer_user = actionTransformUserLogin(user)
            if not verify_password(password, transformer_user["password"]):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="password atau username yang di input salah!",
                )

            # Generate JWT tokens and return response
            tokens = signJWT(transformer_user["id"])
            response_data = {
                "id": transformer_user["id"],
                "username": user.username,
                "role": user.role,  # Include role information
                "nama_lengkap": profile.nama_lengkap,
                "email": profile.email,
                "access_token": tokens.get("access_token"),
                "refresh_token": tokens.get("refresh_token"),
            }

            return ok(response_data, "Successfully Login!", HTTP_ACCEPTED)
        except HTTPException as e:
            repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def profile(
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        try:
            user_role = require_user_role(authorization, db)
            if not user_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! User role required.",
                )

            # Initialize repository
            repo = UserRepository(db)

            # Get user ID from token (authentication already handled by middleware)
            user_id = get_user_id_from_token(authorization)

            # Get user with profile from repository
            user_with_profile = repo.get_user_with_profile(user_id)
            if not user_with_profile:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail="User profile not found!",
                )

            # Transform data and return response
            transformer = mapUserProfileData(user_with_profile)
            return ok(transformer, "Successfully Get user Profile!", HTTP_OK)
        except HTTPException as e:
            repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

    @staticmethod
    async def updatePasswordById(
        id: str,
        request: PasswordUpdate,
        authorization: str,
        db: Session = Depends(get_db),
    ) -> JSONResponse:
        try:
            user_role = require_user_role(authorization, db)
            if not user_role:
                raise HTTPException(
                    status_code=HTTP_FORBIDDEN,
                    detail="Access denied! User role required.",
                )

            # Initialize repository
            repo = UserRepository(db)

            # Get user ID from token (authentication already handled by middleware)
            user_id = get_user_id_from_token(authorization)

            # Get user data from repository
            user_data = repo.get_user_by_id(id)
            if not user_data:
                raise HTTPException(
                    status_code=HTTP_NOT_FOUND,
                    detail="User not found!",
                )

            # Validate password match
            if request.new_password != request.confirm_new_password:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="New password and Confirm new password do not match!",
                )

            # Verify old password
            if not verify_password(request.old_password, user_data.password):
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Old password is incorrect!",
                )

            # Validate new password length
            if len(request.new_password) < 8:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Password must be at least 8 characters long!",
                )
            elif len(request.new_password.encode("utf-8")) > 72:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Password is too long! Maximum 72 bytes allowed.",
                )

            # Update password using repository
            hashed_password = get_password_hash(request.new_password)
            success = repo.update_user_password(
                user_id, hashed_password, user_data.username
            )

            if not success:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Failed to update password!",
                )

            # Commit transaction
            repo.commit()

            return ok("", "Update password successfully!", HTTP_OK)
        except HTTPException as e:
            repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)

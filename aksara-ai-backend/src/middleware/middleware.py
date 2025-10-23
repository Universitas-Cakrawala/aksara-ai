"""
Authentication and Authorization Middleware
This middleware handles JWT authentication and role-based authorization for all users
"""

from typing import Optional

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from src.auth.handler import get_current_user
from src.config.postgres import get_db
from src.constants import HTTP_FORBIDDEN, HTTP_UNAUTHORIZED
from src.user.models import User, UserRole

import bcrypt
from src.utils.helper import log


def get_current_active_user(authorization: str, db: Session = Depends(get_db)) -> User:
    """
    General authentication middleware to get current authenticated user
    Works for all roles (ADMIN and USER)
    Raises HTTPException if user is not authenticated or inactive
    """
    try:
        if not authorization:
            raise HTTPException(
                status_code=HTTP_UNAUTHORIZED, detail="Authorization token is missing!"
            )

        # Handle token extraction
        if isinstance(authorization, str) and "Bearer" in authorization:
            try:
                token = authorization.split("Bearer", 1)[1].strip()
            except Exception:
                token = authorization
        else:
            token = authorization

        # Get user ID from JWT token
        user_id = get_current_user(token)

        if user_id is None:
            raise HTTPException(
                status_code=HTTP_UNAUTHORIZED, detail="You are not logged in!"
            )

        # Get user from database
        user = (
            db.query(User)
            .filter(User.id == user_id, User.deleted == False, User.is_active == True)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=HTTP_UNAUTHORIZED,
                detail="Session has ended, please login again!",
            )

        return user

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_UNAUTHORIZED, detail="Invalid authorization token"
        )


def require_admin_role(
    authorization: str, db: Session = Depends(get_db)
) -> User | None:
    """
    Authorization middleware specifically for ADMIN role
    Raises HTTPException if user is not admin
    """
    # First authenticate the user
    user = get_current_active_user(authorization, db)

    # Check if user has admin role
    if user.role != UserRole.ADMIN:
        return None

    return user


def require_user_role(authorization: str, db: Session = Depends(get_db)) -> User | None:
    """
    Authorization middleware specifically for USER role
    Raises HTTPException if user is not regular user
    """
    # First authenticate the user
    user = get_current_active_user(authorization, db)

    # Check if user has user role
    if user.role != UserRole.USER:
        return None

    return user


def require_any_role(
    authorization: str,
    allowed_roles: Optional[list[UserRole]] = None,
    db: Session = Depends(get_db),
) -> User:
    """
    Authorization middleware for multiple allowed roles
    Raises HTTPException if user role is not in allowed_roles

    Args:
        authorization: JWT token from request header
        allowed_roles: List of allowed roles. If None, any authenticated user is allowed
        db: Database session

    Returns:
        User object if authenticated and authorized
    """
    # First authenticate the user
    user = get_current_active_user(authorization, db)

    # If no specific roles required, allow any authenticated user
    if allowed_roles is None:
        return user

    # Check if user has one of the allowed roles
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=HTTP_FORBIDDEN,
            detail=f"Access denied! Required roles: {', '.join([role.value for role in allowed_roles])}",
        )

    return user


def is_admin_user(authorization: str, db: Session = Depends(get_db)) -> bool:
    """
    Helper function to check if user is admin without raising exceptions
    Returns True if admin, False otherwise
    """
    try:
        require_admin_role(authorization, db)
        return True
    except HTTPException:
        return False


def is_authenticated(authorization: str, db: Session = Depends(get_db)) -> bool:
    """
    Helper function to check if user is authenticated without raising exceptions
    Returns True if authenticated, False otherwise
    """
    try:
        get_current_active_user(authorization, db)
        return True
    except HTTPException:
        return False


def get_user_or_none(
    authorization: str, db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Helper function to get current user without raising exceptions
    Returns User object if authenticated, None otherwise
    """
    try:
        return get_current_active_user(authorization, db)
    except HTTPException:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using bcrypt with proper error handling"""
    try:
        # Ensure password is within bcrypt limits
        password_bytes = plain_password.encode("utf-8")
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]

        # Ensure hashed password is bytes
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode("utf-8")

        return bcrypt.checkpw(password_bytes, hashed_password)
    except Exception as e:
        log(f"Password verification error: {e}", log_level="error")
        return False


def get_password_hash(password: str) -> str:
    """Hash password using bcrypt with proper error handling"""
    try:
        # Ensure password is within bcrypt limits
        password_bytes = password.encode("utf-8")
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]

        # Generate salt and hash
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode("utf-8")
    except Exception as e:
        log(f"Password hashing error: {e}", log_level="error")
        raise


def get_user_id_from_token(authorization: str) -> str:
    """Extract user ID from JWT token"""
    token = (
        authorization.split("Bearer", 1)[1].strip()
        if "Bearer" in authorization
        else authorization
    )
    user_id = get_current_user(token)
    if not user_id:
        raise HTTPException(
            status_code=HTTP_UNAUTHORIZED, detail="Invalid or expired token"
        )
    return user_id

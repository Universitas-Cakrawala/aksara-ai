"""
Admin Role Middleware
This middleware checks if user has admin role for protected admin endpoints
"""

from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from src.config.postgres import get_db
from src.user.models import User, UserRole
from src.auth.handler import get_current_user
from src.constants import HTTP_UNAUTHORIZED, HTTP_FORBIDDEN


def require_admin_role(authorization: str, db: Session = Depends(get_db)) -> User:
    """
    Dependency to check if current user has admin role
    Raises HTTPException if user is not admin
    """
    try:
        if not authorization:
            raise HTTPException(
                status_code=HTTP_UNAUTHORIZED, detail="Authorization token is missing!"
            )

        # Handle token extraction (similar to other controllers)
        if isinstance(authorization, str) and "Bearer" in authorization:
            try:
                token = authorization.split("Bearer", 1)[1].strip()
            except Exception:
                token = authorization
        else:
            token = authorization

        # Get user ID from JWT token
        userId = get_current_user(token)

        if userId is None:
            raise HTTPException(
                status_code=HTTP_UNAUTHORIZED, detail="You are not logged in!"
            )

        # Get user from database
        user = (
            db.query(User)
            .filter(User.id == userId, User.deleted == False, User.is_active == True)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=HTTP_UNAUTHORIZED,
                detail="Session has ended, please login again!",
            )

        # Check if user has admin role
        if user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=HTTP_FORBIDDEN, detail="Access denied! Admin role required."
            )

        return user

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_UNAUTHORIZED, detail="Invalid authorization token"
        )


def is_admin_user(authorization: str, db: Session = Depends(get_db)) -> bool:
    """
    Helper function to check if user is admin without raising exceptions
    Returns True if admin, False otherwise
    """
    try:
        user = require_admin_role(authorization, db)
        return True
    except HTTPException:
        return False

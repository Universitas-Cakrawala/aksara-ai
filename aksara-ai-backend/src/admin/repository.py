"""
AdminRepository - Database operations for admin functionality
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from src.user.models import User, UserRole


class AdminRepository:
    """Repository class for Admin database operations"""

    def __init__(self, db: Session):
        self.db = db

    # Admin authentication operations
    def get_admin_by_id(self, admin_id: str) -> Optional[User]:
        """Get admin user by ID (active, not deleted, admin role)"""
        return (
            self.db.query(User)
            .filter(
                User.id == admin_id,
                User.role == UserRole.ADMIN,
                User.is_active == True,
                User.deleted == False,
            )
            .first()
        )

    def get_admin_by_username(self, username: str) -> Optional[User]:
        """Get admin user by username (active, not deleted, admin role)"""
        return (
            self.db.query(User)
            .filter(
                User.username == username,
                User.role == UserRole.ADMIN,
                User.is_active == True,
                User.deleted == False,
            )
            .first()
        )

    # User management operations
    def get_all_users(self) -> List[User]:
        """Get all non-deleted users"""
        return self.db.query(User).filter(User.deleted == False).all()

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def update_user_active_status(self, user_id: str, is_active: bool) -> bool:
        """Toggle user active status"""
        result = (
            self.db.query(User)
            .filter(User.id == user_id)
            .update({"is_active": is_active})
        )
        return result > 0

    def soft_delete_user(self, user_id: str, updated_by: str) -> bool:
        """Soft delete user"""
        result = (
            self.db.query(User)
            .filter(User.id == user_id)
            .update(
                {
                    "deleted": True,
                    "updated_by": updated_by,
                    "updated_date": datetime.now(),
                }
            )
        )
        return result > 0

    def update_user_role(self, user_id: str, role: UserRole) -> bool:
        """Update user role"""
        result = self.db.query(User).filter(User.id == user_id).update({"role": role})
        return result > 0

    # Statistics operations
    def get_total_users_count(self) -> int:
        """Get total number of non-deleted users"""
        return self.db.query(User).filter(User.deleted == False).count()

    def get_admin_users_count(self) -> int:
        """Get number of admin users"""
        return (
            self.db.query(User)
            .filter(User.role == UserRole.ADMIN, User.deleted == False)
            .count()
        )

    def get_regular_users_count(self) -> int:
        """Get number of regular users"""
        return (
            self.db.query(User)
            .filter(User.role == UserRole.USER, User.deleted == False)
            .count()
        )

    def get_user_statistics(self) -> dict:
        """Get user statistics summary"""
        return {
            "total_users": self.get_total_users_count(),
            "admin_users": self.get_admin_users_count(),
            "regular_users": self.get_regular_users_count(),
        }

    # Transaction management
    def commit(self):
        """Commit the current transaction"""
        self.db.commit()

    def rollback(self):
        """Rollback the current transaction"""
        self.db.rollback()

import uuid
from typing import Optional, Tuple

from sqlalchemy import Row
from sqlalchemy.orm import Session

from src.constants import CURRENT_DATETIME
from src.user.models import User, UserProfile


class UserRepository:
    """Repository class for User and UserProfile database operations"""

    def __init__(self, db: Session):
        self.db = db

    # User operations
    def create_user(self, username: str, password: str, created_by: str) -> User:
        """Create a new user"""
        user_id = uuid.uuid4().hex
        user = User(
            id=user_id,
            username=username,
            password=password,
            is_active=True,
            created_by=created_by,
            created_date=CURRENT_DATETIME,
            updated_by=created_by,
        )
        self.db.add(user)
        return user

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID (active, not deleted)"""
        return (
            self.db.query(User)
            .filter(User.id == user_id, User.is_active, User.deleted == False)
            .first()
        )

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()

    def get_active_user_by_username(self, username: str) -> Optional[User]:
        """Get active user by username (active, not deleted)"""
        return (
            self.db.query(User)
            .filter(
                User.username == username,
                User.deleted == False,
                User.is_active == True,
            )
            .first()
        )

    def update_user(self, user_id: str, update_data: dict) -> bool:
        """Update user data"""
        update_data["updated_date"] = CURRENT_DATETIME
        result = self.db.query(User).filter(User.id == user_id).update(update_data)
        return result > 0

    def update_user_password(
        self, user_id: str, new_password: str, updated_by: str
    ) -> bool:
        """Update user password"""
        update_data = {
            "password": new_password,
            "updated_date": CURRENT_DATETIME,
            "updated_by": updated_by,
        }
        result = self.db.query(User).filter(User.id == user_id).update(update_data)
        return result > 0

    # UserProfile operations
    def create_user_profile(
        self, user_id: str, nama_lengkap: str, email: str, created_by: str
    ) -> UserProfile:
        """Create a new user profile"""
        profile_id = uuid.uuid4().hex
        profile = UserProfile(
            id=profile_id,
            id_user=user_id,
            nama_lengkap=nama_lengkap,
            email=email,
            created_by=created_by,
            created_date=CURRENT_DATETIME,
            updated_by=created_by,
        )
        self.db.add(profile)
        return profile

    def get_profile_by_user_id(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by user ID (not deleted)"""
        return (
            self.db.query(UserProfile)
            .filter(UserProfile.id_user == user_id, UserProfile.deleted == False)
            .first()
        )

    def get_profile_by_email(
        self, email: str, exclude_user_id: str = None
    ) -> Optional[UserProfile]:
        """Get profile by email, optionally excluding a specific user"""
        query = self.db.query(UserProfile).filter(
            UserProfile.email == email, UserProfile.deleted == False
        )
        if exclude_user_id:
            query = query.join(User).filter(User.id != exclude_user_id)
        return query.first()

    def update_user_profile(self, profile_id: str, update_data: dict) -> bool:
        """Update user profile data"""
        update_data["updated_date"] = CURRENT_DATETIME
        result = (
            self.db.query(UserProfile)
            .filter(UserProfile.id == profile_id)
            .update(update_data)
        )
        return result > 0

    # Combined operations
    def get_user_with_profile(
        self, user_id: str
    ) -> Optional[Row[Tuple[User, UserProfile]]]:
        """Get user with profile by user ID (both not deleted)"""
        return (
            self.db.query(User, UserProfile)
            .join(UserProfile, UserProfile.id_user == User.id)
            .filter(
                User.deleted == False,
                UserProfile.deleted == False,
                User.id == user_id,
            )
            .first()
        )

    def get_user_with_profile_by_username(
        self, username: str
    ) -> Optional[Row[Tuple[User, UserProfile]]]:
        """Get user with profile by username (both active and not deleted)"""
        return (
            self.db.query(User, UserProfile)
            .join(UserProfile, UserProfile.id_user == User.id)
            .filter(
                User.username == username,
                User.deleted == False,
                User.is_active,
                UserProfile.deleted == False,
            )
            .first()
        )

    # Validation helpers
    def is_email_taken(self, email: str, exclude_user_id: str = None) -> bool:
        """Check if email is already taken by another user"""
        return self.get_profile_by_email(email, exclude_user_id) is not None

    def is_username_taken(self, username: str, exclude_user_id: str = None) -> bool:
        """Check if username is already taken by another active user"""
        query = self.db.query(User).filter(
            User.username == username.strip(),
            User.deleted == False,
        )
        if exclude_user_id:
            query = query.filter(User.id != exclude_user_id)
        return query.first() is not None

    # Transaction management
    def commit(self):
        """Commit the current transaction"""
        self.db.commit()

    def rollback(self):
        """Rollback the current transaction"""
        self.db.rollback()

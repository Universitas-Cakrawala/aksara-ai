"""
Admin User Seeder
This script creates an admin user for fastapi-admin access
"""

import os
import sys
from datetime import datetime

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session
from src.config.postgres import engine
from src.user.models import User, UserRole
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_admin_user():
    """Create admin user if not exists"""

    # Admin user credentials
    admin_username = "admin"
    admin_password = "admin123"  # Change this in production!

    with Session(engine) as session:
        # Check if admin user already exists
        existing_admin = (
            session.query(User)
            .filter(User.username == admin_username, User.role == UserRole.ADMIN)
            .first()
        )

        if existing_admin:
            print(f"Admin user '{admin_username}' already exists!")
            return existing_admin

        # Hash password
        hashed_password = pwd_context.hash(admin_password)

        # Create admin user
        admin_user = User(
            username=admin_username,
            password=hashed_password,
            is_active=True,
            role=UserRole.ADMIN,
            deleted=False,
            created_by="system",
            created_date=datetime.now(),
            updated_by="system",
            updated_date=datetime.now(),
        )

        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)

        print(f"✅ Admin user created successfully!")
        print(f"Username: {admin_username}")
        print(f"Password: {admin_password}")
        print(f"⚠️  Please change the password after first login!")

        return admin_user


if __name__ == "__main__":
    create_admin_user()

#!/usr/bin/env python3
"""
Seed script untuk mengisi data awal database
"""
import sys
from pathlib import Path

# Tambahkan root project ke sys.path
project_root = Path(__file__).parent.parent  # Go up one level to project root
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session

from src.config.postgres import SessionLocal
from src.middleware.middleware import (  # Use the same password hashing as the app
    get_password_hash,
)
from src.user.models import UserRole
from src.user.repository import UserRepository


def create_admin_user(db: Session):
    """Buat user admin default menggunakan repository pattern"""
    repo = UserRepository(db)

    try:
        # Cek apakah admin user sudah ada
        existing_admin = repo.get_user_by_username("admin")

        if existing_admin:
            print("Admin user already exists, checking profile...")
            # Get existing profile
            existing_profile = repo.get_profile_by_user_id(existing_admin.id)

            if not existing_profile:
                print("Creating missing admin profile...")
                # Buat profile untuk admin yang sudah ada menggunakan repository
                profile = repo.create_user_profile(
                    user_id=existing_admin.id,
                    nama_lengkap="Administrator",
                    email="admin@aksara.ai",
                    created_by="system",
                )
                repo.commit()
                print("Created missing admin profile")
                return existing_admin, profile
            else:
                print("Admin profile already exists")
                return existing_admin, existing_profile

        print("Creating new admin user...")
        # Use the same password hashing as the application
        password_plain = "admin123"
        password_hash = get_password_hash(password_plain)

        # Create admin user menggunakan repository
        user = repo.create_user(
            username="admin", password=password_hash, created_by="system"
        )

        # Set role as ADMIN manually (karena repository create_user tidak set role)
        user.role = UserRole.ADMIN
        user.is_active = True

        print("Creating new admin profile...")
        # Buat profile untuk admin menggunakan repository
        profile = repo.create_user_profile(
            user_id=user.id,
            nama_lengkap="Administrator",
            email="admin@aksara.ai",
            created_by="system",
        )

        repo.commit()
        print("Created new admin user and profile")
        return user, profile

    except Exception as e:
        print(f"Error in create_admin_user: {e}")
        repo.rollback()
        raise


def seed_database():
    """Mengisi database dengan data awal"""
    print("Starting database seeding...")

    db = SessionLocal()
    try:

        print("Setting up admin user...")
        user, profile = create_admin_user(db)

        if user and profile:
            print(f"Admin user ready: {user.username}")
            print(f"Admin profile ready: {profile.nama_lengkap}")

            print("Database seeding completed successfully!")
            print("\n Default admin credentials:")
            print(f"   Username: {user.username}")
            print("   Password: admin123")
            print(f"   Email: {profile.email}")
            print(f"   Role: {user.role}")
            print("\n Note: Password is now securely hashed with bcrypt!")
        else:
            print("Failed to set up admin user and profile")

    except Exception as e:
        print(f"Error during seeding: {e}")
        # Repository handles its own rollback in create_admin_user
        raise  # Re-raise untuk debugging
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

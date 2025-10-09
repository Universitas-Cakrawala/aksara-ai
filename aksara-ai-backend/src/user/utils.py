import bcrypt


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
        print(f"Password verification error: {e}")
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
        print(f"Password hashing error: {e}")
        raise

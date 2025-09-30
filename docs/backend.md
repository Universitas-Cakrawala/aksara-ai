# Backend Documentation - Aksara AI

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Authentication & Security](#authentication--security)
- [Models & Schemas](#models--schemas)
- [Controllers](#controllers)
- [Configuration](#configuration)
- [Database Migrations](#database-migrations)
- [Deployment](#deployment)
- [Monitoring & Logging](#monitoring--logging)

## 🎯 Overview

The Aksara AI backend is a robust FastAPI application designed to provide secure authentication, AI-powered chat functionality, and efficient data management. Built with modern Python practices and PostgreSQL database.

### Key Features

- 🚀 **High Performance**: FastAPI with async/await support
- 🔐 **Secure Authentication**: JWT-based authentication with refresh tokens
- 💾 **Database Management**: PostgreSQL with SQLAlchemy ORM
- 📊 **Data Validation**: Pydantic models for request/response validation
- 🔄 **Database Migrations**: Alembic for schema versioning
- 🌐 **API Documentation**: Auto-generated OpenAPI/Swagger docs
- 🐳 **Containerization**: Docker support for deployment
- 📝 **Logging**: Comprehensive logging and monitoring
- 🧪 **Testing**: Comprehensive test suite

## 🏗️ Architecture

### High-Level Architecture

```mermaid
graph TB
    A[Frontend Client] -->|HTTP/HTTPS| B[FastAPI Server]
    B --> C[Authentication Middleware]
    B --> D[API Routes]
    D --> E[Controllers]
    E --> F[Models/Database]
    E --> G[External AI Service]
    F --> H[PostgreSQL Database]
    B --> I[Logging System]
    
    subgraph "Security Layer"
        C
        J[JWT Token Validation]
        K[IP Middleware]
    end
    
    subgraph "Data Layer"
        F
        H
        L[Alembic Migrations]
    end
```

### Request Flow

1. **Client Request** → FastAPI receives HTTP request
2. **Middleware Processing** → IP validation, CORS, authentication
3. **Route Matching** → FastAPI routes request to appropriate endpoint
4. **Controller Logic** → Business logic execution
5. **Database Operations** → SQLAlchemy ORM interactions
6. **Response Formation** → Pydantic serialization
7. **Client Response** → JSON response returned

## 📁 Project Structure

```
aksara-ai-backend/
├── migrations/                 # Alembic database migrations
│   ├── env.py                 # Alembic configuration
│   ├── script.py.mako         # Migration template
│   └── versions/              # Migration files
│       ├── 001_initial_migration.py
│       └── 002_refresh_tokens.py
├── src/                       # Source code
│   ├── auth/                  # Authentication module
│   │   ├── auth.py           # JWT utilities
│   │   └── handler.py        # Auth handlers
│   ├── config/               # Configuration
│   │   └── postgres.py       # Database configuration
│   ├── health/               # Health check module
│   │   ├── controller.py     # Health controller
│   │   ├── router.py         # Health routes
│   │   └── schemas.py        # Health schemas
│   ├── middleware/           # Custom middleware
│   │   └── ip_middleware.py  # IP validation middleware
│   ├── refresh_token/        # Refresh token module
│   │   ├── controller.py     # Token controller
│   │   ├── models.py         # Token models
│   │   └── router.py         # Token routes
│   ├── user/                 # User module
│   │   ├── controller.py     # User controller
│   │   ├── models.py         # User models
│   │   ├── router.py         # User routes
│   │   ├── schemas.py        # User schemas
│   │   └── utils.py          # User utilities
│   ├── utils/                # Shared utilities
│   │   ├── allowed_middleware.py
│   │   ├── date.py           # Date utilities
│   │   ├── helper.py         # Helper functions
│   │   ├── pagination.py     # Pagination utilities
│   │   ├── token.py          # Token utilities
│   │   └── validate.py       # Validation utilities
│   └── constants.py          # Application constants
├── logs/                     # Log files
├── main.py                   # Application entry point
├── requirements.txt          # Python dependencies
├── alembic.ini              # Alembic configuration
├── docker-compose.yml       # Docker Compose configuration
├── docker-compose.dev.yml   # Development Docker Compose
├── Dockerfile               # Docker build configuration
├── Makefile                 # Build automation
├── migrate.py               # Migration utilities
├── seed.py                  # Database seeding
├── validate.py              # Validation scripts
├── run-dev.sh              # Development server script
├── run-prod.sh             # Production server script
└── stop.sh                 # Server stop script
```

## 🛠️ Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Programming language |
| FastAPI | 0.115.4 | Web framework |
| Uvicorn | 0.32.0 | ASGI server |
| SQLAlchemy | 2.0.40 | ORM |
| Alembic | 1.13.3 | Database migrations |

### Database & Storage

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 14+ | Primary database |
| psycopg2-binary | 2.9.11 | PostgreSQL adapter |
| asyncpg | 0.29.0 | Async PostgreSQL driver |

### Authentication & Security

| Technology | Version | Purpose |
|------------|---------|---------|
| python-jose[cryptography] | 3.3.0 | JWT tokens |
| passlib[bcrypt] | 1.7.4 | Password hashing |
| bcrypt | 4.2.1 | Secure hashing |

### Validation & Serialization

| Technology | Version | Purpose |
|------------|---------|---------|
| Pydantic | 2.10.1 | Data validation |
| pydantic-settings | 2.6.1 | Settings management |

### Development & Deployment

| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | Latest | Containerization |
| python-multipart | 0.0.12 | Form data handling |
| python-dotenv | 1.0.1 | Environment management |

## 🗄️ Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string username UK
        string email UK
        string nama_lengkap
        string hashed_password
        datetime created_at
        datetime updated_at
        boolean is_active
    }
    
    REFRESH_TOKENS {
        int id PK
        int user_id FK
        string token UK
        datetime expires_at
        datetime created_at
        boolean is_revoked
    }
    
    CHAT_HISTORIES {
        int id PK
        int user_id FK
        string title
        jsonb messages
        datetime created_at
        datetime updated_at
    }
    
    USERS ||--o{ REFRESH_TOKENS : "has"
    USERS ||--o{ CHAT_HISTORIES : "owns"
```

### Table Specifications

#### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

**Indexes:**
- Primary key on `id`
- Unique index on `username`
- Unique index on `email`
- Index on `is_active` for filtering

#### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_revoked BOOLEAN DEFAULT FALSE
);
```

**Indexes:**
- Primary key on `id`
- Foreign key on `user_id`
- Unique index on `token`
- Index on `expires_at` for cleanup
- Index on `is_revoked` for filtering

#### Chat Histories Table

```sql
CREATE TABLE chat_histories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- Primary key on `id`
- Foreign key on `user_id`
- GIN index on `messages` for JSON queries
- Index on `created_at` for sorting

## 🛣️ API Endpoints

### Authentication Endpoints

#### POST `/users/register`
**Purpose:** Register new user account

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "nama_lengkap": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "nama_lengkap": "string",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `201`: Successfully created
- `400`: Validation error
- `409`: Username/email already exists

#### POST `/users/login`
**Purpose:** Authenticate user and return tokens

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "nama_lengkap": "string"
  }
}
```

**Status Codes:**
- `200`: Successfully authenticated
- `401`: Invalid credentials
- `422`: Validation error

#### POST `/users/refresh`
**Purpose:** Refresh access token using refresh token

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### User Management Endpoints

#### GET `/users/profile`
**Purpose:** Get current user profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "nama_lengkap": "string",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### PUT `/users/profile`
**Purpose:** Update user profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "nama_lengkap": "string",
  "email": "string"
}
```

### Chat Endpoints

#### POST `/chat/message`
**Purpose:** Send message and get AI response

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "message": "string",
  "conversation_id": "string" // optional
}
```

**Response:**
```json
{
  "response": "string",
  "conversation_id": "string",
  "message_id": "string"
}
```

#### GET `/chat/histories`
**Purpose:** Get user's chat histories

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit`: Number of histories to return (default: 20)
- `offset`: Number of histories to skip (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "message_count": 10
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

#### GET `/chat/histories/{history_id}`
**Purpose:** Get specific chat history with messages

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "data": {
    "id": "string",
    "title": "string",
    "messages": [
      {
        "id": "string",
        "content": "string",
        "sender": "user|ai",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Health Check Endpoints

#### GET `/health`
**Purpose:** Basic health check

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET `/health/detailed`
**Purpose:** Detailed health check including database

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "database": "connected",
  "version": "1.0.0",
  "uptime": 3600
}
```

## 🔐 Authentication & Security

### JWT Token System

#### Token Structure
```python
# Access Token Payload
{
  "sub": "user_id",           # Subject (user ID)
  "username": "string",       # Username
  "exp": 1234567890,         # Expiration timestamp
  "iat": 1234567890,         # Issued at timestamp
  "type": "access"           # Token type
}

# Refresh Token Payload
{
  "sub": "user_id",
  "exp": 1234567890,
  "iat": 1234567890,
  "type": "refresh",
  "jti": "unique_id"         # JWT ID for revocation
}
```

#### Token Configuration
```python
# Token settings
ACCESS_TOKEN_EXPIRE_MINUTES = 60     # 1 hour
REFRESH_TOKEN_EXPIRE_DAYS = 30       # 30 days
ALGORITHM = "HS256"                  # Signing algorithm
SECRET_KEY = "your-secret-key"       # JWT secret
```

### Password Security

#### Password Hashing
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

#### Password Requirements
- Minimum 6 characters
- Must contain at least one letter
- Must contain at least one number
- Special characters recommended

### Security Middleware

#### IP Validation Middleware
```python
class IPValidationMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Validate client IP
            client_ip = get_client_ip(scope)
            if not is_allowed_ip(client_ip):
                # Return 403 Forbidden
                pass
        
        await self.app(scope, receive, send)
```

#### CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Authentication Dependencies

#### Get Current User
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)) -> User:
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await get_user_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

## 📊 Models & Schemas

### SQLAlchemy Models

#### User Model (`src/user/models.py`)
```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    nama_lengkap = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
```

#### Refresh Token Model (`src/refresh_token/models.py`)
```python
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_revoked = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="refresh_tokens")
```

### Pydantic Schemas

#### User Schemas (`src/user/schemas.py`)
```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    nama_lengkap: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    nama_lengkap: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
```

#### Chat Schemas
```python
class MessageBase(BaseModel):
    content: str
    sender: str  # 'user' or 'ai'

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ChatHistoryBase(BaseModel):
    title: str

class ChatHistoryCreate(ChatHistoryBase):
    pass

class ChatHistoryResponse(ChatHistoryBase):
    id: str
    user_id: int
    messages: List[MessageResponse]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

## 🎛️ Controllers

### User Controller (`src/user/controller.py`)

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from .models import User
from .schemas import UserCreate, UserUpdate, UserResponse
from ..auth.auth import hash_password, verify_password

class UserController:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        # Check if username exists
        existing_user = await self.get_user_by_username(user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already registered"
            )
        
        # Check if email exists
        existing_email = await self.get_user_by_email(user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = hash_password(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            nama_lengkap=user_data.nama_lengkap,
            hashed_password=hashed_password
        )
        
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        
        return UserResponse.from_orm(db_user)
    
    async def authenticate_user(self, username: str, password: str) -> User:
        user = await self.get_user_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        return user
    
    async def get_user_by_id(self, user_id: int) -> User:
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def get_user_by_username(self, username: str) -> User:
        result = await self.db.execute(select(User).filter(User.username == username))
        return result.scalar_one_or_none()
    
    async def get_user_by_email(self, email: str) -> User:
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalar_one_or_none()
    
    async def update_user(self, user_id: int, user_data: UserUpdate) -> UserResponse:
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        
        return UserResponse.from_orm(user)
```

### Chat Controller
```python
class ChatController:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def send_message(self, user_id: int, message: str, conversation_id: Optional[str] = None):
        # Save user message
        user_message = await self.save_message(user_id, message, "user", conversation_id)
        
        # Get AI response
        ai_response = await self.get_ai_response(message)
        
        # Save AI response
        ai_message = await self.save_message(user_id, ai_response, "ai", conversation_id)
        
        return {
            "response": ai_response,
            "conversation_id": conversation_id or str(uuid.uuid4()),
            "message_id": ai_message.id
        }
    
    async def get_ai_response(self, message: str) -> str:
        # Integration with AI service (Gemini, OpenAI, etc.)
        # This would connect to your AI service
        return "AI response to: " + message
    
    async def get_chat_histories(self, user_id: int, limit: int = 20, offset: int = 0):
        query = select(ChatHistory).filter(ChatHistory.user_id == user_id).offset(offset).limit(limit)
        result = await self.db.execute(query)
        histories = result.scalars().all()
        
        return {
            "data": [ChatHistoryResponse.from_orm(history) for history in histories],
            "total": len(histories),
            "limit": limit,
            "offset": offset
        }
```

## ⚙️ Configuration

### Database Configuration (`src/config/postgres.py`)

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from typing import AsyncGenerator

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/aksara_ai"
)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### Application Configuration (`src/constants.py`)

```python
import os
from typing import Optional

class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/aksara_ai")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    
    # AI Service
    AI_SERVICE_URL: Optional[str] = os.getenv("AI_SERVICE_URL")
    AI_SERVICE_API_KEY: Optional[str] = os.getenv("AI_SERVICE_API_KEY")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Application
    APP_NAME: str = "Aksara AI Backend"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
```

### Environment Variables (`.env`)

```bash
# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/aksara_ai

# JWT Configuration
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# AI Service Configuration
AI_SERVICE_URL=https://api.openai.com/v1
AI_SERVICE_API_KEY=your-ai-service-api-key

# Application Configuration
ENVIRONMENT=development
LOG_LEVEL=INFO

# Database credentials for Docker
POSTGRES_DB=aksara_ai
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
```

## 🗂️ Database Migrations

### Alembic Configuration (`alembic.ini`)

```ini
[alembic]
script_location = migrations
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = postgresql+asyncpg://postgres:password@localhost:5432/aksara_ai

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### Migration Environment (`migrations/env.py`)

```python
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

# Import your models here
from src.user.models import User
from src.refresh_token.models import RefreshToken

# Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add your model's MetaData object here
target_metadata = User.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """Run migrations in 'online' mode."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### Sample Migration (`migrations/versions/001_initial_migration.py`)

```python
"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('nama_lengkap', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

def downgrade() -> None:
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
```

### Migration Management

#### Create New Migration
```bash
alembic revision --autogenerate -m "Add new table"
```

#### Apply Migrations
```bash
alembic upgrade head
```

#### Rollback Migration
```bash
alembic downgrade -1
```

#### Migration History
```bash
alembic history --verbose
```

## 🚀 Deployment

### Docker Configuration

#### Dockerfile
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/aksara_ai
      - SECRET_KEY=your-production-secret-key
      - ENVIRONMENT=production
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=aksara_ai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Development Docker Compose (`docker-compose.dev.yml`)
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/aksara_ai
      - SECRET_KEY=development-secret-key
      - ENVIRONMENT=development
      - LOG_LEVEL=DEBUG
    depends_on:
      - db
    volumes:
      - .:/app
      - ./logs:/app/logs
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=aksara_ai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_dev_data:
```

### Deployment Scripts

#### Production Deployment (`run-prod.sh`)
```bash
#!/bin/bash

echo "Starting Aksara AI Backend in Production Mode..."

# Set environment
export ENVIRONMENT=production

# Build and start containers
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

echo "Backend is running on http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
```

#### Development Deployment (`run-dev.sh`)
```bash
#!/bin/bash

echo "Starting Aksara AI Backend in Development Mode..."

# Set environment
export ENVIRONMENT=development

# Build and start containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
docker-compose -f docker-compose.dev.yml exec backend alembic upgrade head

echo "Development server is running on http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "Database: postgresql://postgres:password@localhost:5432/aksara_ai"
```

## 📊 Monitoring & Logging

### Logging Configuration

```python
import logging
import sys
from logging.handlers import RotatingFileHandler
import os

def setup_logging():
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            RotatingFileHandler(
                'logs/aksara-ai.log',
                maxBytes=10485760,  # 10MB
                backupCount=5
            )
        ]
    )
    
    # Set specific loggers
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

# Application logger
logger = logging.getLogger("aksara-ai")
```

### Health Monitoring

#### Health Check Implementation
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.postgres import get_db
import time
import psutil

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    # Check database connection
    try:
        await db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # System metrics
    cpu_percent = psutil.cpu_percent()
    memory_percent = psutil.virtual_memory().percent
    disk_percent = psutil.disk_usage('/').percent
    
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "timestamp": time.time(),
        "database": db_status,
        "system": {
            "cpu_percent": cpu_percent,
            "memory_percent": memory_percent,
            "disk_percent": disk_percent
        },
        "version": "1.0.0"
    }
```

### Performance Monitoring

#### Request Timing Middleware
```python
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log slow requests
        if process_time > 1.0:  # Log requests taking more than 1 second
            logger.warning(f"Slow request: {request.method} {request.url} took {process_time:.2f}s")
        
        response.headers["X-Process-Time"] = str(process_time)
        return response
```

This comprehensive backend documentation covers all aspects of the Aksara AI backend architecture, from database design and API endpoints to deployment and monitoring. The FastAPI implementation with PostgreSQL provides a robust foundation for the AI chat application.
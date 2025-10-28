# Dokumentasi Proyek Aksara AI

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Arsitektur Aplikasi](#arsitektur-aplikasi)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Backend (FastAPI)](#backend-fastapi)
   - [Struktur Folder Backend](#struktur-folder-backend)
   - [Database & Models](#database--models)
   - [Repository Pattern](#repository-pattern)
   - [Controller Pattern](#controller-pattern)
   - [Routing & API Endpoints](#routing--api-endpoints)
   - [Authentication & Authorization](#authentication--authorization)
   - [Middleware](#middleware)
5. [Frontend (React)](#frontend-react)
   - [Struktur Folder Frontend](#struktur-folder-frontend)
   - [Routing & Navigation](#routing--navigation)
   - [Components](#components)
   - [State Management](#state-management)
   - [API Integration](#api-integration)
6. [Konsep Web Application Development](#konsep-web-application-development)
7. [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)

---

## Pendahuluan

**Aksara AI** adalah platform berbasis web yang mengintegrasikan kecerdasan buatan (AI) untuk mendukung komunitas literasi kampus. Aplikasi ini memungkinkan pengguna untuk berinteraksi dengan AI chatbot, mengelola riwayat percakapan, dan bagi admin untuk mengelola pengguna sistem.

### Fitur Utama:
- 🤖 **AI Chat**: Percakapan dengan AI menggunakan Gemini API
- 📝 **Chat History**: Menyimpan dan mengelola riwayat percakapan
- 👤 **User Management**: Sistem autentikasi dan manajemen profil
- 🔐 **Role-Based Access Control (RBAC)**: Pemisahan akses Admin dan User
- 📊 **Admin Dashboard**: Panel administrasi untuk mengelola pengguna

---

## Arsitektur Aplikasi

Aplikasi Aksara AI menggunakan arsitektur **Client-Server** dengan pemisahan yang jelas antara frontend dan backend:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         React Frontend (Port 5173)                    │ │
│  │  - React Router untuk navigasi                        │ │
│  │  - Axios untuk HTTP requests                          │ │
│  │  - Context API untuk state management                 │ │
│  │  - Tailwind CSS untuk styling                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         FastAPI Backend (Port 8000)                   │ │
│  │  - RESTful API Endpoints                              │ │
│  │  - JWT Authentication                                 │ │
│  │  - SQLAlchemy ORM                                     │ │
│  │  - Alembic untuk migrations                           │ │
│  └───────────────────────────────────────────────────────┘ │
│                            ↕                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         PostgreSQL Database                           │ │
│  │  - User data                                          │ │
│  │  - Chat histories                                     │ │
│  │  - Refresh tokens                                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Pola Arsitektur:
- **MVC (Model-View-Controller)**: Pemisahan logika bisnis, data, dan presentasi
- **Repository Pattern**: Abstraksi akses database
- **Layered Architecture**: Pemisahan concern menjadi layers (Router → Controller → Repository → Model)

---

## Teknologi yang Digunakan

### Backend Stack:
- **FastAPI**: Modern Python web framework untuk membangun API
- **SQLAlchemy**: ORM (Object-Relational Mapping) untuk database operations
- **Alembic**: Database migration tool
- **PostgreSQL**: Relational database
- **PyJWT**: JSON Web Token untuk authentication
- **Bcrypt**: Password hashing
- **Uvicorn**: ASGI server
- **Google Generative AI (Gemini)**: AI model untuk chatbot

### Frontend Stack:
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **React Router v7**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components
- **Shadcn/ui**: Component library
- **Vite**: Build tool dan dev server

---

## Backend (FastAPI)

### Struktur Folder Backend

```
aksara-ai-backend/
├── main.py                    # Entry point aplikasi
├── requirements.txt           # Dependencies Python
├── alembic.ini               # Konfigurasi Alembic
├── .env                      # Environment variables
├── migrations/               # Database migrations
│   └── versions/            # Migration files
├── src/
│   ├── constants.py         # Konstanta global (HTTP status codes)
│   ├── admin/               # Modul Admin
│   │   ├── router.py        # API endpoints admin
│   │   ├── controller.py    # Business logic admin
│   │   ├── repository.py    # Database operations admin
│   │   ├── config.py        # Admin panel config
│   │   └── schemas.py       # Pydantic schemas
│   ├── auth/                # Modul Authentication
│   │   ├── auth.py          # JWT Bearer middleware
│   │   └── handler.py       # JWT encoding/decoding
│   ├── chat/                # Modul Chat
│   │   ├── router.py        # API endpoints chat
│   │   ├── controller.py    # Business logic chat
│   │   ├── repository.py    # Database operations chat
│   │   ├── models.py        # Database models
│   │   └── schemas.py       # Request/Response schemas
│   ├── user/                # Modul User
│   │   ├── router.py        # API endpoints user
│   │   ├── controller.py    # Business logic user
│   │   ├── repository.py    # Database operations user
│   │   ├── models.py        # Database models (User, UserProfile)
│   │   └── schemas.py       # Request/Response schemas
│   ├── refresh_token/       # Modul Refresh Token
│   │   ├── router.py
│   │   ├── controller.py
│   │   └── models.py
│   ├── config/              # Konfigurasi
│   │   └── postgres.py      # Database connection
│   ├── middleware/          # Middleware
│   │   ├── middleware.py    # Auth middleware
│   │   └── ip_middleware.py # IP tracking
│   ├── common/              # Shared resources
│   │   ├── schemas.py       # Common schemas
│   │   └── response_examples.py  # OpenAPI examples
│   └── utils/               # Helper functions
│       ├── helper.py        # Utility functions
│       ├── date.py          # Date helpers
│       └── allowed_middleware.py  # CORS config
└── templates/               # HTML templates (admin panel)
    └── admin/
```

---

## Database & Models

### Konsep ORM (Object-Relational Mapping)

ORM adalah teknik yang memungkinkan kita berinteraksi dengan database menggunakan objek Python, bukan raw SQL. SQLAlchemy adalah ORM yang digunakan dalam project ini.

### Database Schema

```sql
-- Tabel Users
user (
    id              UUID PRIMARY KEY,
    username        VARCHAR UNIQUE NOT NULL,
    password        VARCHAR NOT NULL,
    role            UserRole NOT NULL,  -- ENUM: 'ADMIN', 'USER'
    is_active       BOOLEAN DEFAULT TRUE,
    deleted         BOOLEAN DEFAULT FALSE,
    created_date    TIMESTAMP,
    updated_date    TIMESTAMP
)

-- Tabel User Profile
user_profile (
    id              UUID PRIMARY KEY,
    user_id         UUID FOREIGN KEY REFERENCES user(id),
    nama_lengkap    VARCHAR NOT NULL,
    email           VARCHAR UNIQUE NOT NULL,
    created_date    TIMESTAMP,
    updated_date    TIMESTAMP
)

-- Tabel Chat Histories
chat_histories (
    id                      UUID PRIMARY KEY,
    conversation_id         VARCHAR UNIQUE NOT NULL,
    user_id                 UUID FOREIGN KEY REFERENCES user(id),
    title                   VARCHAR,
    last_message_preview    TEXT,
    last_sender             VARCHAR,
    last_timestamp          TIMESTAMP,
    total_messages          INTEGER,
    model                   VARCHAR,
    language                VARCHAR,
    is_active               BOOLEAN DEFAULT TRUE,
    deleted                 BOOLEAN DEFAULT FALSE,
    created_date            TIMESTAMP,
    updated_date            TIMESTAMP
)

-- Tabel Chat Messages
chat_messages (
    id                  UUID PRIMARY KEY,
    conversation_id     VARCHAR,
    user_id             UUID FOREIGN KEY REFERENCES user(id),
    sender              VARCHAR,  -- 'user' atau 'ai'
    message             TEXT,
    model               VARCHAR,
    timestamp           TIMESTAMP,
    created_date        TIMESTAMP,
    deleted             BOOLEAN DEFAULT FALSE
)

-- Tabel Refresh Tokens
refresh_tokens (
    id              UUID PRIMARY KEY,
    user_id         UUID FOREIGN KEY REFERENCES user(id),
    token           VARCHAR UNIQUE NOT NULL,
    is_revoked      BOOLEAN DEFAULT FALSE,
    created_date    TIMESTAMP,
    expires_at      TIMESTAMP
)
```

### Model Definition (User)

**File: `src/user/models.py`**

```python
from sqlalchemy import Boolean, Column, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

class UserRole(str, enum.Enum):
    """Enum untuk role user"""
    ADMIN = "ADMIN"
    USER = "USER"

class User(Base):
    """Model untuk tabel user"""
    __tablename__ = "user"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Data Authentication
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    
    # Role & Status
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    deleted = Column(Boolean, default=False)
    
    # Timestamps
    created_date = Column(DateTime, default=datetime.now)
    updated_date = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationship dengan UserProfile (One-to-One)
    profile = relationship("UserProfile", back_populates="user", uselist=False)
```

**Penjelasan:**
- `UUID`: Tipe data untuk ID unik (lebih aman dari integer)
- `Column`: Mendefinisikan kolom database
- `Enum`: Membatasi nilai yang valid (ADMIN atau USER)
- `relationship`: Mendefinisikan relasi antar tabel
- `back_populates`: Membuat bi-directional relationship

### Soft Delete Pattern

Project ini menggunakan **soft delete**, artinya data tidak benar-benar dihapus dari database, hanya ditandai dengan flag `deleted=True`. Keuntungan:
- Data recovery lebih mudah
- Audit trail terjaga
- Referential integrity tetap terjaga

---

## Repository Pattern

Repository Pattern adalah pola desain yang memisahkan logika akses data dari business logic. Semua operasi database dilakukan melalui repository.

### Struktur Repository

**File: `src/user/repository.py`**

```python
class UserRepository:
    """Repository untuk operasi database User"""
    
    def __init__(self, db: Session):
        """Constructor menerima database session"""
        self.db = db
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Mengambil user berdasarkan username"""
        return (
            self.db.query(User)
            .filter(User.username == username, User.deleted == False)
            .first()
        )
    
    def create_user(self, user_data: dict) -> User:
        """Membuat user baru"""
        new_user = User(**user_data)
        self.db.add(new_user)
        self.db.flush()  # Mendapatkan ID tanpa commit
        return new_user
    
    def update_user(self, user_id: str, update_data: dict) -> User:
        """Update data user"""
        user = self.get_user_by_id(user_id)
        if user:
            for key, value in update_data.items():
                setattr(user, key, value)
            user.updated_date = datetime.now()
            self.db.flush()
        return user
    
    def soft_delete_user(self, user_id: str) -> bool:
        """Soft delete user"""
        user = self.get_user_by_id(user_id)
        if user:
            user.deleted = True
            user.updated_date = datetime.now()
            self.db.flush()
            return True
        return False
    
    def commit(self):
        """Commit transaksi ke database"""
        self.db.commit()
    
    def rollback(self):
        """Rollback transaksi jika terjadi error"""
        self.db.rollback()
```

**Keuntungan Repository Pattern:**
1. **Separation of Concerns**: Business logic terpisah dari data access
2. **Testability**: Mudah di-mock untuk unit testing
3. **Maintainability**: Perubahan database query hanya di satu tempat
4. **Reusability**: Method bisa digunakan di berbagai controller

---

## Controller Pattern

Controller menangani business logic dan orchestration. Menerima request, memvalidasi, memanggil repository, dan mengembalikan response.

### Struktur Controller

**File: `src/user/controller.py`**

```python
class UserController:
    """Controller untuk business logic User"""
    
    @staticmethod
    async def register(
        request: UserCreate, 
        db: Session
    ) -> JSONResponse:
        """
        Business logic untuk registrasi user
        
        Flow:
        1. Validasi input
        2. Cek username/email sudah ada
        3. Hash password
        4. Create user di database
        5. Create user profile
        6. Generate JWT token
        7. Return response
        """
        try:
            # Initialize repository
            repo = UserRepository(db)
            
            # Validasi: Cek username sudah ada
            existing_user = repo.get_user_by_username(request.username)
            if existing_user:
                raise HTTPException(
                    status_code=HTTP_BAD_REQUEST,
                    detail="Username already exists"
                )
            
            # Hash password menggunakan bcrypt
            hashed_password = get_password_hash(request.password)
            
            # Prepare user data
            user_data = {
                "username": request.username,
                "password": hashed_password,
                "role": UserRole.USER,  # Default role
                "is_active": True
            }
            
            # Create user
            new_user = repo.create_user(user_data)
            
            # Create user profile
            profile_data = {
                "user_id": new_user.id,
                "nama_lengkap": request.nama_lengkap,
                "email": request.email
            }
            repo.create_user_profile(profile_data)
            
            # Commit transaction
            repo.commit()
            
            # Generate JWT token
            tokens = signJWT(str(new_user.id))
            
            # Prepare response
            user_response = {
                "id": str(new_user.id),
                "username": new_user.username,
                "role": new_user.role,
                "nama_lengkap": request.nama_lengkap,
                "email": request.email
            }
            
            response_data = {
                "access_token": tokens["access_token"],
                "refresh_token": tokens["refresh_token"],
                "user": user_response
            }
            
            return ok(
                response_data,
                "User registered successfully",
                HTTP_CREATED
            )
            
        except HTTPException as e:
            repo.rollback()
            return formatError(e.detail, e.status_code)
        except Exception as e:
            repo.rollback()
            return formatError(str(e), HTTP_BAD_REQUEST)
```

**Penjelasan Flow Controller:**

1. **Try-Catch Block**: Semua logic dibungkus untuk error handling
2. **Repository Initialization**: Create instance repository dengan db session
3. **Validation**: Validasi business rules (username unique, dll)
4. **Data Processing**: Hash password, prepare data
5. **Database Operations**: Panggil repository methods
6. **Transaction Management**: Commit jika sukses, rollback jika error
7. **Response Formatting**: Format response sesuai standard

---

## Routing & API Endpoints

### Konsep RESTful API

REST (Representational State Transfer) adalah architectural style untuk web services dengan prinsip:
- **Resource-based**: URL merepresentasikan resource
- **HTTP Methods**: GET, POST, PUT, DELETE untuk CRUD operations
- **Stateless**: Setiap request independen
- **JSON Format**: Data exchange menggunakan JSON

### Router Definition

**File: `src/user/router.py`**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Membuat router instance
routerUser = APIRouter()

# ============================================
# PUBLIC ENDPOINTS (No Authentication)
# ============================================

@routerUser.post(
    "/register",
    responses=ResponseExamples.user_register_responses(),
    summary="Register a new user",
    tags=["Authentication"]
)
async def register_user(
    request: UserCreate,  # Request body (Pydantic model)
    db: Session = Depends(get_db),  # Dependency injection
):
    """
    Endpoint untuk registrasi user baru
    
    Request Body:
    - username: string (required)
    - password: string (required, min 8 chars)
    - nama_lengkap: string (required)
    - email: string (required, valid email)
    
    Response:
    - access_token: JWT token
    - refresh_token: JWT refresh token
    - user: User object
    """
    return await UserController.register(request, db)


@routerUser.post(
    "/login",
    responses=ResponseExamples.user_login_responses(),
    summary="Login user",
    tags=["Authentication"]
)
async def login_user(
    request: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Endpoint untuk login
    
    Request Body:
    - username: string
    - password: string
    
    Response:
    - access_token: JWT token
    - refresh_token: JWT refresh token
    - user: User object dengan profile
    """
    return await UserController.login(request, db)


# ============================================
# PROTECTED ENDPOINTS (Requires Authentication)
# ============================================

@routerUser.get(
    "/profile",
    responses=ResponseExamples.user_profile_responses(),
    summary="Get user profile",
    tags=["User Management"]
)
async def get_user_profile(
    authorization: str = Depends(JWTBearer()),  # JWT verification
    db: Session = Depends(get_db),
):
    """
    Endpoint untuk mendapatkan profile user yang sedang login
    
    Headers:
    - Authorization: Bearer <token>
    
    Response:
    - User object dengan profile lengkap
    """
    return await UserController.profile(authorization, db)


@routerUser.post(
    "/logout",
    responses=ResponseExamples.user_logout_responses(),
    summary="Logout user",
    tags=["Authentication"]
)
async def logout_user(
    authorization: str = Depends(JWTBearer()),
    db: Session = Depends(get_db),
):
    """
    Endpoint untuk logout dan revoke refresh tokens
    
    Headers:
    - Authorization: Bearer <token>
    
    Response:
    - logged_out: boolean
    - tokens_revoked: number of tokens revoked
    """
    return await UserController.logout(authorization, db)
```

### Dependency Injection di FastAPI

```python
# Dependency untuk database session
def get_db():
    """Provides database session untuk setiap request"""
    db = SessionLocal()
    try:
        yield db  # Yield membuat ini menjadi generator
    finally:
        db.close()  # Cleanup setelah request selesai

# Dependency untuk JWT authentication
class JWTBearer(HTTPBearer):
    """Custom dependency untuk verifikasi JWT token"""
    async def __call__(self, request: Request):
        credentials = await super().__call__(request)
        if credentials:
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired token"
                )
            return credentials.credentials
```

**Penjelasan Depends():**
- `Depends(get_db)`: Inject database session otomatis
- `Depends(JWTBearer())`: Verifikasi JWT token sebelum masuk ke endpoint
- FastAPI menjalankan dependency sebelum endpoint function
- Jika dependency raise exception, endpoint tidak akan dieksekusi

### Complete API Endpoints

```
BASE_URL: http://localhost:8000/api/v1

┌─────────────────────────────────────────────────────────────────┐
│                      USER ENDPOINTS                             │
├─────────────────────────────────────────────────────────────────┤
│ POST   /users/register          - Register new user            │
│ POST   /users/login             - Login user                   │
│ GET    /users/profile           - Get current user profile     │
│ POST   /users/logout            - Logout user                  │
│ PUT    /users/{id}              - Update user profile          │
│ PUT    /users/update-password/{id} - Update user password      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CHAT ENDPOINTS                             │
├─────────────────────────────────────────────────────────────────┤
│ POST   /chat/send               - Send message to AI           │
│ GET    /chat/histories          - Get all chat histories       │
│ GET    /chat/histories/{id}     - Get chat by conversation_id  │
│ DELETE /chat/histories/{id}     - Delete chat history          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN ENDPOINTS                            │
├─────────────────────────────────────────────────────────────────┤
│ GET    /admin/statistics        - Get system statistics        │
│ GET    /admin/users             - Get all users                │
│ GET    /admin/users/{id}        - Get user by ID               │
│ PUT    /admin/users/{id}/toggle-active  - Activate/deactivate  │
│ PUT    /admin/users/{id}/change-role    - Change user role     │
│ DELETE /admin/users/{id}        - Delete user                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      OTHER ENDPOINTS                            │
├─────────────────────────────────────────────────────────────────┤
│ GET    /health                  - Health check                 │
│ POST   /refresh-token           - Refresh access token         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### JWT (JSON Web Token)

JWT adalah standard untuk authentication berbasis token. Token berisi:
- **Header**: Algorithm dan type
- **Payload**: Data (user_id, expiry, role)
- **Signature**: Verifikasi integritas token

```python
# Generate JWT Token
def signJWT(user_id: str) -> Dict[str, str]:
    """Generate access token dan refresh token"""
    
    # Access Token (berlaku 1 hari)
    access_token_expiration = time.time() + (24 * 60 * 60)
    access_payload = {
        "id": user_id,
        "expires": access_token_expiration,
        "type": "access"
    }
    access_token = jwt.encode(
        access_payload, 
        JWT_SECRET, 
        algorithm=JWT_ALGORITHM
    )
    
    # Refresh Token (berlaku 7 hari)
    refresh_token_expiration = time.time() + (7 * 24 * 60 * 60)
    refresh_payload = {
        "id": user_id,
        "expires": refresh_token_expiration,
        "type": "refresh"
    }
    refresh_token = jwt.encode(
        refresh_payload, 
        JWT_SECRET, 
        algorithm=JWT_ALGORITHM
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }
```

### Role-Based Access Control (RBAC)

RBAC membatasi akses berdasarkan role user:

```python
def require_admin_role(
    authorization: str, 
    db: Session
) -> User:
    """Middleware untuk endpoint yang hanya boleh diakses ADMIN"""
    
    # 1. Authenticate user (verify JWT)
    user = get_current_active_user(authorization, db)
    
    # 2. Check role
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Access denied! Admin role required."
        )
    
    return user

# Usage di endpoint
@routerAdmin.get("/users")
async def get_all_users(
    user: User = Depends(require_admin_role),  # Only ADMIN
    db: Session = Depends(get_db)
):
    return await AdminController.get_users(db)
```

### Password Hashing dengan Bcrypt

```python
import bcrypt

def get_password_hash(password: str) -> str:
    """Hash password menggunakan bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()  # Generate random salt
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password dengan hash"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)
```

**Kenapa Bcrypt?**
- One-way hashing (tidak bisa di-decrypt)
- Salt otomatis (mencegah rainbow table attacks)
- Adaptive (bisa adjust complexity)
- Industry standard untuk password hashing

---

## Middleware

Middleware adalah function yang dieksekusi sebelum/sesudah request mencapai endpoint.

### CORS Middleware

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Domain yang diizinkan
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=True  # Allow cookies/auth
)
```

**CORS (Cross-Origin Resource Sharing):**
- Security feature browser
- Mengontrol request dari domain berbeda
- Penting untuk frontend-backend yang terpisah

### Custom IP Middleware

```python
class AddClientIPMiddleware(BaseHTTPMiddleware):
    """Middleware untuk tracking client IP"""
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        
        # Store in request state
        request.state.client_ip = client_ip
        
        # Process request
        response = await call_next(request)
        
        # Add to response header
        response.headers["X-Client-IP"] = client_ip
        
        return response
```

### Authentication Middleware

```python
def get_current_active_user(
    authorization: str, 
    db: Session
) -> User:
    """Middleware untuk authenticate user dari JWT token"""
    
    # Extract token from "Bearer <token>"
    token = authorization.split("Bearer", 1)[1].strip()
    
    # Decode JWT
    user_id = get_current_user(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user from database
    user = db.query(User).filter(
        User.id == user_id,
        User.deleted == False,
        User.is_active == True
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
```

---

## Frontend (React)

### Struktur Folder Frontend

```
aksara-ai-frontend/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component
│   ├── index.css             # Global styles
│   ├── assets/               # Images, icons
│   ├── components/           # Reusable components
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── ChatHistorySidebar.tsx  # Chat history list
│   │   ├── ProtectedRoute.tsx      # Route guard
│   │   ├── LoginForm.tsx     # Login form
│   │   ├── RegisterForm.tsx  # Register form
│   │   └── ui/               # UI primitives (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       └── alert-dialog.tsx
│   ├── pages/                # Page components
│   │   ├── LandingPage.tsx   # Homepage
│   │   ├── AuthPage.tsx      # Login/Register
│   │   ├── ChatPage.tsx      # Main chat interface
│   │   ├── ProfilePage.tsx   # User profile
│   │   └── AdminPage.tsx     # Admin dashboard
│   ├── context/              # React Context
│   │   └── AuthContext.tsx   # Auth state management
│   ├── services/             # API services
│   │   ├── api.ts            # API client (axios)
│   │   ├── dummyData.ts      # Mock data
│   │   └── mockApi.ts        # Mock API
│   └── lib/                  # Utilities
│       └── utils.ts          # Helper functions
├── public/                   # Static assets
├── package.json              # Dependencies
├── vite.config.ts           # Vite configuration
└── tailwind.config.js       # Tailwind configuration
```

---

## Routing & Navigation

### React Router v7

React Router menangani client-side routing (navigasi tanpa page reload).

**File: `src/App.tsx`**

```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<AuthPage mode="login" />} />
                    <Route path="/register" element={<AuthPage mode="register" />} />
                    
                    {/* Protected Routes (Require Authentication) */}
                    <Route 
                        path="/chat" 
                        element={
                            <ProtectedRoute>
                                <ChatPage />
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/profile" 
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Admin Only Route */}
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute requiredRole="ADMIN">
                                <AdminPage />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Fallback: redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
```

### Protected Route Component

```typescript
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'ADMIN' | 'USER';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requiredRole 
}) => {
    const { user, loading } = useAuth();
    
    // Show loading state
    if (loading) {
        return <LoadingSpinner />;
    }
    
    // Not authenticated: redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
        // Not authorized: redirect based on role
        return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/chat'} replace />;
    }
    
    // Authorized: render children
    return <>{children}</>;
};
```

**Penjelasan:**
- `<Route>`: Mendefinisikan path dan component
- `<Navigate>`: Redirect ke path lain
- `<ProtectedRoute>`: Custom component untuk guard routes
- `replace`: Mengganti history (back button tidak kembali ke route sebelumnya)

---

## Components

### Component Hierarchy

```
App
├── Navbar (persistent)
├── Router
    ├── LandingPage
    │   ├── Hero Section
    │   ├── Features Section
    │   └── Footer
    ├── AuthPage
    │   ├── LoginForm
    │   └── RegisterForm
    ├── ChatPage
    │   ├── Navbar (chat variant)
    │   ├── ChatHistorySidebar
    │   │   ├── Search Input
    │   │   ├── New Chat Button
    │   │   └── Chat List Items
    │   └── Chat Container
    │       ├── Messages Area
    │       │   ├── User Messages
    │       │   └── AI Messages
    │       └── Input Area
    ├── AdminPage
    │   ├── Navbar (admin variant)
    │   ├── Statistics Cards
    │   └── Users Table
    └── ProfilePage
        └── Profile Form
```

### Example: ChatHistorySidebar Component

```typescript
interface ChatHistorySidebarProps {
    selectedChatId?: string;
    onChatSelect: (chatId: string) => void;
    onNewChat: () => void;
    className?: string;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    selectedChatId,
    onChatSelect,
    onNewChat,
    className = '',
}) => {
    // State Management
    const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Load chat histories from API
    const loadChatHistories = useCallback(async () => {
        try {
            setLoading(true);
            const histories = await chatApi.getChatHistories();
            setChatHistories(histories);
        } catch (err) {
            console.error('Failed to load chat histories:', err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Load on mount
    useEffect(() => {
        loadChatHistories();
    }, [loadChatHistories]);
    
    // Expose refresh function globally
    useEffect(() => {
        window.__refreshChatHistory = loadChatHistories;
        return () => {
            delete window.__refreshChatHistory;
        };
    }, [loadChatHistories]);
    
    // Filter chats based on search
    const filteredHistories = chatHistories.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Delete handler
    const handleDelete = async (chatId: string) => {
        try {
            await chatApi.deleteChatHistory(chatId);
            setChatHistories(prev => 
                prev.filter(chat => chat.conversation_id !== chatId)
            );
        } catch (err) {
            console.error('Failed to delete chat:', err);
        }
    };
    
    return (
        <div className={`bg-white border-r ${className}`}>
            {/* Header */}
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Chats</h2>
                <Button onClick={onNewChat}>
                    <Plus /> New Chat
                </Button>
            </div>
            
            {/* Search */}
            <div className="p-4">
                <Input
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            {/* Chat List */}
            <div className="overflow-y-auto">
                {loading ? (
                    <LoadingSpinner />
                ) : filteredHistories.length === 0 ? (
                    <EmptyState />
                ) : (
                    filteredHistories.map((chat) => (
                        <ChatItem
                            key={chat.conversation_id}
                            chat={chat}
                            isSelected={selectedChatId === chat.conversation_id}
                            onClick={() => onChatSelect(chat.conversation_id)}
                            onDelete={() => handleDelete(chat.conversation_id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
```

**Key Concepts:**
- **Props**: Data dari parent component
- **State**: Local data yang bisa berubah (`useState`)
- **Effect**: Side effects seperti API calls (`useEffect`)
- **Callback**: Memoized function (`useCallback`)
- **Conditional Rendering**: Tampilkan UI berbeda berdasarkan state

---

## State Management

### React Context API

Context API untuk global state (auth, theme, dll) tanpa prop drilling.

**File: `src/context/AuthContext.tsx`**

```typescript
interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Check if user is logged in (on mount)
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);
    
    // Login function
    const login = async (username: string, password: string) => {
        try {
            const response = await authApi.login({ username, password });
            
            // Save to localStorage
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            
            // Update state
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };
    
    // Logout function
    const logout = () => {
        // Call logout API
        authApi.logout().catch(() => {});
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        // Clear state
        setUser(null);
    };
    
    const value = {
        user,
        login,
        logout,
        loading
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook untuk menggunakan context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
```

**Usage dalam Component:**

```typescript
function ChatPage() {
    const { user, logout } = useAuth();
    
    return (
        <div>
            <h1>Welcome, {user?.nama_lengkap}</h1>
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

---

## API Integration

### Axios Configuration

**File: `src/services/api.ts`**

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Token expired or invalid
        if (error.response?.status === 401 || error.response?.status === 403) {
            if (!error.config?.url?.includes('/logout')) {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
```

### API Service Functions

```typescript
// Auth API
export const authApi = {
    login: async (data: LoginRequest) => {
        const response = await api.post('/users/login', data);
        return response.data;
    },
    
    register: async (data: RegisterRequest) => {
        const response = await api.post('/users/register', data);
        return response.data;
    },
    
    logout: async () => {
        try {
            const response = await api.post('/users/logout');
            return response.data;
        } catch (error) {
            // Graceful degradation
            console.warn('Logout API failed, clearing local data');
            return { logged_out: true };
        }
    },
    
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    }
};

// Chat API
export const chatApi = {
    sendMessage: async (data: ChatRequest) => {
        const response = await api.post('/chat/send', data);
        return response.data;
    },
    
    getChatHistories: async (): Promise<ChatHistory[]> => {
        const response = await api.get('/chat/histories');
        return response.data.data;
    },
    
    getChatById: async (conversationId: string) => {
        const response = await api.get(`/chat/histories/${conversationId}`);
        return response.data.data;
    },
    
    deleteChatHistory: async (conversationId: string) => {
        const response = await api.delete(`/chat/histories/${conversationId}`);
        return response.data;
    }
};

// Admin API
export const adminApi = {
    getStatistics: async (): Promise<AdminStatistics> => {
        const response = await api.get('/admin/statistics');
        return response.data.data;
    },
    
    getUsers: async (): Promise<AdminUser[]> => {
        const response = await api.get('/admin/users');
        return response.data.data;
    },
    
    toggleUserActive: async (userId: string, isActive: boolean) => {
        const response = await api.put(`/admin/users/${userId}/toggle-active`, {
            is_active: !isActive
        });
        return response.data;
    },
    
    changeUserRole: async (userId: string, newRole: string) => {
        const response = await api.put(`/admin/users/${userId}/change-role`, {
            role: newRole
        });
        return response.data;
    },
    
    deleteUser: async (userId: string) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    }
};
```

### Usage dalam Component

```typescript
function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    
    const sendMessage = async (input: string) => {
        try {
            setLoading(true);
            
            // Optimistic UI update
            const userMessage = {
                id: Date.now().toString(),
                content: input,
                sender: 'user',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);
            
            // API call
            const response = await chatApi.sendMessage({
                input,
                temperature: 0.7,
                max_tokens: 512
            });
            
            // Add AI response
            const aiMessage = {
                id: response.conversation_id,
                content: response.output,
                sender: 'ai',
                timestamp: new Date(response.timestamp)
            };
            setMessages(prev => [...prev, aiMessage]);
            
        } catch (error) {
            console.error('Failed to send message:', error);
            // Show error message
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <MessagesList messages={messages} />
            <MessageInput onSend={sendMessage} disabled={loading} />
        </div>
    );
}
```

---

## Konsep Web Application Development

### 1. **Separation of Concerns**

Pemisahan tanggung jawab antar komponen:
- **Frontend**: UI/UX, user interaction
- **Backend**: Business logic, data processing
- **Database**: Data persistence

**Keuntungan:**
- Maintainability lebih baik
- Parallel development (frontend & backend terpisah)
- Easier testing dan debugging

### 2. **RESTful API Design**

Prinsip REST:
- **Resource-based URLs**: `/users`, `/chat/histories`
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Stateless**: Setiap request independen
- **JSON Format**: Standard data exchange

**Example:**
```
GET    /users           -> List all users
GET    /users/123       -> Get user by ID
POST   /users           -> Create new user
PUT    /users/123       -> Update user
DELETE /users/123       -> Delete user
```

### 3. **MVC Pattern (Model-View-Controller)**

```
┌──────────────┐
│   Frontend   │  ← View (React Components)
│  (React UI)  │
└──────────────┘
       ↓
┌──────────────┐
│   Router     │  ← Routes HTTP requests
└──────────────┘
       ↓
┌──────────────┐
│  Controller  │  ← Business Logic
└──────────────┘
       ↓
┌──────────────┐
│  Repository  │  ← Data Access Layer
└──────────────┘
       ↓
┌──────────────┐
│    Model     │  ← Database Entities
└──────────────┘
```

### 4. **Repository Pattern**

Abstraksi data access:
- Controller tidak langsung query database
- Semua database operations melalui repository
- Mudah di-mock untuk testing

```python
# ❌ BAD: Direct database access in controller
def get_user(user_id):
    user = db.query(User).filter(User.id == user_id).first()
    return user

# ✅ GOOD: Through repository
class UserRepository:
    def get_user_by_id(self, user_id):
        return self.db.query(User).filter(User.id == user_id).first()

class UserController:
    def get_user(user_id, db):
        repo = UserRepository(db)
        return repo.get_user_by_id(user_id)
```

### 5. **Dependency Injection**

Passing dependencies dari luar:

```python
# FastAPI Dependency Injection
@app.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),  # Injected
    current_user: User = Depends(get_current_user)  # Injected
):
    # Use injected dependencies
    return UserController.get_user(user_id, db, current_user)
```

**Keuntungan:**
- Loose coupling
- Easier testing (mock dependencies)
- Cleaner code

### 6. **Authentication & Authorization**

**Authentication**: Verifikasi identitas (siapa Anda?)
- Username/password
- JWT token
- OAuth

**Authorization**: Verifikasi permissions (apa yang boleh Anda lakukan?)
- Role-based (ADMIN, USER)
- Permission-based
- Resource-based

### 7. **Error Handling**

**Backend:**
```python
try:
    # Business logic
    result = do_something()
    return ok(result, "Success", 200)
except HTTPException as e:
    # Expected errors
    return formatError(e.detail, e.status_code)
except Exception as e:
    # Unexpected errors
    logger.error(f"Error: {str(e)}")
    return formatError("Internal server error", 500)
```

**Frontend:**
```typescript
try {
    const data = await api.getData();
    setData(data);
} catch (error) {
    if (error.response?.status === 401) {
        // Handle unauthorized
        logout();
    } else {
        // Show error message
        showToast('Error loading data');
    }
}
```

### 8. **State Management**

**Local State** (useState):
- Component-specific data
- UI state (loading, modals)

**Global State** (Context API):
- User authentication
- Theme preference
- Application settings

**Server State** (React Query - optional):
- API data
- Caching
- Background updates

### 9. **Database Relationships**

```python
# One-to-One: User ↔ UserProfile
class User(Base):
    profile = relationship("UserProfile", back_populates="user", uselist=False)

# One-to-Many: User → ChatHistories
class User(Base):
    chat_histories = relationship("ChatHistory", back_populates="user")

# Many-to-Many (if needed): User ↔ Roles
user_roles = Table('user_roles',
    Column('user_id', ForeignKey('users.id')),
    Column('role_id', ForeignKey('roles.id'))
)
```

### 10. **Security Best Practices**

✅ **Password Hashing**: Never store plain passwords
✅ **JWT Token**: Stateless authentication
✅ **HTTPS**: Encrypt data in transit
✅ **CORS**: Control cross-origin requests
✅ **Input Validation**: Prevent SQL injection, XSS
✅ **Rate Limiting**: Prevent abuse
✅ **Soft Delete**: Data recovery possible
✅ **Environment Variables**: Hide sensitive data

---

## Cara Menjalankan Aplikasi

### Prerequisites

```bash
# System Requirements
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
```

### Setup Backend

```bash
# 1. Navigate to backend folder
cd aksara-ai-backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Setup environment variables
cp .env.example .env
# Edit .env dan isi:
# - DATABASE_URL
# - JWT_SECRET
# - GEMINI_API_KEY

# 6. Run database migrations
alembic upgrade head

# 7. (Optional) Seed database
python seeders/seed.py

# 8. Run backend server
python main.py
# Backend akan running di http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Setup Frontend

```bash
# 1. Navigate to frontend folder
cd aksara-ai-frontend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dan isi:
# VITE_API_BASE_URL=http://localhost:8000/api/v1

# 4. Run development server
npm run dev
# Frontend akan running di http://localhost:5173
```

### Setup Database

```sql
-- 1. Create database
CREATE DATABASE aksara_ai;

-- 2. Create user (optional)
CREATE USER aksara_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE aksara_ai TO aksara_user;
```

### Testing

```bash
# Backend
cd aksara-ai-backend
pytest

# Frontend
cd aksara-ai-frontend
npm run test
```

### Production Build

```bash
# Backend (using Docker)
docker-compose up -d

# Frontend
npm run build
# Output: dist/ folder (deploy ke hosting)
```

---

## Kesimpulan

Project Aksara AI mendemonstrasikan implementasi lengkap web application development dengan:

### Backend (FastAPI):
✅ RESTful API design
✅ MVC architecture pattern
✅ Repository pattern untuk data access
✅ JWT authentication & RBAC
✅ ORM dengan SQLAlchemy
✅ Database migrations dengan Alembic
✅ Middleware untuk cross-cutting concerns
✅ Error handling & logging
✅ API documentation dengan Swagger

### Frontend (React):
✅ Component-based architecture
✅ Client-side routing
✅ State management dengan Context API
✅ API integration dengan Axios
✅ Protected routes & role-based access
✅ Responsive UI dengan Tailwind CSS
✅ Reusable components
✅ Error handling & loading states

### Best Practices:
✅ Separation of concerns
✅ Code reusability
✅ Security measures (password hashing, JWT, CORS)
✅ Soft delete pattern
✅ Transaction management
✅ Environment-based configuration
✅ Comprehensive error handling
✅ Clean code principles

Project ini merupakan implementasi production-ready yang dapat dikembangkan lebih lanjut dengan fitur seperti:
- Real-time chat dengan WebSocket
- File upload untuk dokumen
- Advanced search & filtering
- Analytics & reporting
- Email notifications
- Multi-language support
- And many more...

---

**Dibuat dengan ❤️ untuk Komunitas Literasi Kampus**

_Last Updated: October 2025_

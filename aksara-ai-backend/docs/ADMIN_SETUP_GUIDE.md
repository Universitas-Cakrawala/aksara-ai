# FastAPI Admin Interface Documentation

## Overview

FastAPI Admin Interface untuk Aksara AI Backend telah berhasil dikonfigurasi dengan sistem role-based authentication. Admin interface memungkinkan admin untuk mengelola users, mengubah role, dan mengaktifkan/menonaktifkan users.

## Features Implemented

### 1. **Role-Based Authentication System**
- ✅ Added `UserRole` enum dengan `ADMIN` dan `USER`
- ✅ Added `role` column ke User model dengan default value `USER`
- ✅ Migration untuk menambahkan role column
- ✅ Admin seeder dengan credentials default

### 2. **Admin Interface Routes**
- ✅ `/admin/login` - Login page untuk admin
- ✅ `/admin/dashboard` - Dashboard dengan statistik users
- ✅ `/admin/users` - Manajemen users dengan actions
- ✅ `/admin/logout` - Logout admin

### 3. **Admin Authentication**
- ✅ Session-based authentication untuk admin
- ✅ Middleware untuk proteksi admin routes
- ✅ Role validation middleware

### 4. **User Management Features**
- ✅ View all users dengan pagination
- ✅ Toggle user active/inactive status
- ✅ Change user role (USER ↔ ADMIN)
- ✅ Soft delete users
- ✅ Dashboard dengan user statistics

## Access Information

### Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ IMPORTANT**: Ubah password ini setelah login pertama!

### Admin URLs
- **Login**: http://127.0.0.1:8000/admin/login
- **Dashboard**: http://127.0.0.1:8000/admin/dashboard
- **User Management**: http://127.0.0.1:8000/admin/users

## Database Schema Changes

### New Column Added
```sql
ALTER TABLE "user" ADD COLUMN role VARCHAR NOT NULL DEFAULT 'USER';
CREATE INDEX ix_user_role ON "user" (role);
```

### User Roles
- `USER` - Regular user (default)
- `ADMIN` - Administrator with full access

## API Changes

### Updated Login Response
Login API sekarang mengembalikan role information:
```json
{
  "data": {
    "id": "user-id",
    "username": "username",
    "role": "USER", // NEW: Role information
    "nama_lengkap": "Full Name",
    "email": "email@example.com",
    "access_token": "jwt-token",
    "refresh_token": "jwt-refresh-token"
  },
  "message": "Successfully Login!",
  "status_code": 202
}
```

## Security Features

### Admin Role Middleware
```python
from src.middleware.admin_middleware import require_admin_role

# Usage in controllers
@router.get("/admin-only-endpoint")
async def admin_endpoint(admin_user: User = Depends(require_admin_role)):
    # Only accessible by admin users
    pass
```

### Session Security
- Session middleware dengan secret key
- Auto logout pada session expiry
- CSRF protection melalui form-based authentication

## File Structure

```
src/
├── admin/
│   └── config.py              # Admin routes dan authentication logic
├── middleware/
│   └── admin_middleware.py    # Admin role validation middleware
├── user/
│   ├── models.py              # Updated with UserRole enum
│   └── schemas.py             # Updated with role fields
templates/
└── admin/
    ├── base.html              # Base template with Bootstrap
    ├── login.html             # Admin login page
    ├── dashboard.html         # Admin dashboard
    └── users.html             # User management page
seeders/
└── admin_user_seeder.py       # Script untuk membuat admin user
migrations/
└── versions/
    └── 003_add_role_column.py # Migration untuk role column
```

## Usage Instructions

### 1. **Accessing Admin Interface**
1. Start the server: `uvicorn main:app --reload`
2. Navigate to: http://127.0.0.1:8000/admin/login
3. Login dengan: `admin` / `admin123`
4. Anda akan diarahkan ke dashboard

### 2. **Managing Users**
1. Dari dashboard, klik "Users" di sidebar
2. Anda dapat:
   - **Activate/Deactivate**: Toggle user login access
   - **Change Role**: Promote user ke admin atau sebaliknya
   - **Delete**: Soft delete user (data preserved)

### 3. **Creating Additional Admin Users**
```bash
# Method 1: Melalui interface admin
# Login as admin → Users → Change Role → Select ADMIN

# Method 2: Melalui API (dengan admin token)
POST /api/v1/users/register
{
  "username": "new_admin",
  "password": "password123",
  "nama_lengkap": "New Admin",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

### 4. **Re-running Admin Seeder**
```bash
# Jika perlu membuat ulang admin user
python seeders/admin_user_seeder.py
```

## Security Considerations

### Production Deployment
1. **Change Secret Key**: Update session secret key di `main.py`
2. **Change Admin Password**: Login dan ganti password default
3. **Environment Variables**: 
   ```env
   ADMIN_SECRET_KEY=your-production-secret-key
   ADMIN_DEFAULT_PASSWORD=your-secure-password
   ```

### Role-Based Access Control
- Admin routes protected by session authentication
- API endpoints dapat menggunakan `require_admin_role` dependency
- Regular JWT authentication tetap berlaku untuk mobile/web apps

## Troubleshooting

### Common Issues

1. **Can't Access Admin Login**
   - Pastikan server running di port yang benar
   - Check URL: http://127.0.0.1:8000/admin/login

2. **Invalid Admin Credentials**
   - Pastikan admin user sudah dibuat: `python seeders/admin_user_seeder.py`
   - Credentials: `admin` / `admin123`

3. **Session Expired**
   - Login ulang di `/admin/login`
   - Check browser cookies enabled

4. **Database Migration Issues**
   - Run migration: `alembic upgrade head`
   - Check role column exists di database

## API Integration

### Checking User Role in API
```python
# In any controller
from src.middleware.admin_middleware import is_admin_user

async def some_endpoint(authorization: str = Depends(JWTBearer())):
    if is_admin_user(authorization):
        # User is admin
        pass
    else:
        # Regular user
        pass
```

### Admin-Only API Endpoints
```python
from src.middleware.admin_middleware import require_admin_role

@router.delete("/admin/users/{user_id}")
async def admin_delete_user(
    user_id: str,
    admin_user: User = Depends(require_admin_role)
):
    # Only admins can access this endpoint
    pass
```

## Next Steps

### Recommended Enhancements
1. **Password Policy**: Implement strong password requirements
2. **Activity Logging**: Log admin actions for audit trail
3. **Bulk Operations**: Add bulk user management features
4. **Email Notifications**: Notify users on role changes
5. **Advanced Permissions**: Implement granular permissions beyond USER/ADMIN

### Integration with Frontend
- Use role information dari login response untuk conditional UI
- Implement admin panel di frontend app
- Use admin APIs untuk user management

---

**✅ FastAPI Admin berhasil dikonfigurasi dan siap digunakan!**

**Default Admin Access:**
- URL: http://127.0.0.1:8000/admin/login
- Username: `admin`
- Password: `admin123`

**Remember to change the default password after first login!**
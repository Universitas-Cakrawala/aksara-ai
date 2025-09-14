# Standardized API Response Format

## Overview

All API endpoints in Aksara AI Backend now return responses in a standardized format to ensure consistency across the application and improve the Swagger documentation experience.

## Response Formats

### Success Responses

All successful API responses follow this structure:

```json
{
  "message": "Success message describing the operation",
  "data": {
    // Response data goes here (can be object, array, or simple values)
  }
}
```

**Examples:**

- User Registration Success:
```json
{
  "message": "Successfully Create User!",
  "data": {
    "username": "testuser",
    "nama_lengkap": "Test User",
    "email": "test@example.com",
    "created_by": "admin",
    "created_date": "2024-01-01T00:00:00"
  }
}
```

- Profile Retrieval Success:
```json
{
  "message": "Successfully Get user Profile!",
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "admin",
      "is_active": true
    },
    "profile": {
      "nama_lengkap": "Administrator",
      "email": "admin@aksara.ai",
      "tipe_akun": "ADMIN"
    }
  }
}
```

- Simple Operation Success:
```json
{
  "message": "Update password successfully!",
  "data": {}
}
```

### Error Responses

All error responses follow this structure:

```json
{
  "message": "Error message describing what went wrong",
  "error": {
    "error_code": 400
  }
}
```

**Examples:**

- Validation Error:
```json
{
  "message": "Username already exists!",
  "error": {
    "error_code": 400
  }
}
```

- Authentication Error:
```json
{
  "message": "You are not logged in!",
  "error": {
    "error_code": 401
  }
}
```

- Not Found Error:
```json
{
  "message": "User not found!",
  "error": {
    "error_code": 404
  }
}
```

- Server Error:
```json
{
  "message": "Internal server error",
  "error": {
    "error_code": 500
  }
}
```

## HTTP Status Codes

The API uses standard HTTP status codes:

- **200 OK** - Successful GET, PUT, DELETE operations
- **201 Created** - Successful POST operations (resource creation)
- **202 Accepted** - Successful login operations
- **400 Bad Request** - Client errors (validation failures, invalid input)
- **401 Unauthorized** - Authentication required or failed
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server errors

## Implementation

### Using the Standardized Response Functions

```python
from src.common.schemas import create_success_response, create_error_response

# Success response
return create_success_response(
    message="Operation successful",
    data={"key": "value"},
    status_code=200
)

# Error response  
return create_error_response(
    message="Something went wrong",
    error_code=400,
    status_code=400
)
```

### Swagger Documentation

All endpoints now include proper response documentation with examples:

```python
@router.post(
    "/endpoint",
    responses={
        200: {
            "description": "Success",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Operation successful",
                        "data": {}
                    }
                }
            }
        },
        400: {
            "description": "Bad Request",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Validation failed",
                        "error": {
                            "error_code": 400
                        }
                    }
                }
            }
        }
    }
)
```

## Backward Compatibility

The old response functions (`ok()` and `formatError()`) have been updated to use the new format while maintaining backward compatibility:

```python
# Old usage still works
return ok(data, "Success message", 200)

# Now returns new format:
# {
#   "message": "Success message",
#   "data": data
# }
```

## Benefits

1. **Consistency** - All endpoints return responses in the same format
2. **Better Documentation** - Swagger UI shows clear, consistent examples
3. **Client-Friendly** - Frontend developers can expect the same response structure
4. **Error Handling** - Standardized error format makes error handling easier
5. **Maintainability** - Centralized response creation reduces code duplication

## Migration Notes

- All existing endpoints have been updated to use the new format
- Legacy response functions have been maintained for backward compatibility
- New development should use `create_success_response()` and `create_error_response()` functions
- Swagger documentation automatically reflects the new response format
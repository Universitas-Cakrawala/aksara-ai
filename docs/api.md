# API Reference - Aksara AI

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL & Authentication](#base-url--authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Chat Endpoints](#chat-endpoints)
- [Health Check Endpoints](#health-check-endpoints)
- [Rate Limiting](#rate-limiting)
- [SDK Examples](#sdk-examples)

## 🎯 Overview

The Aksara AI API is a RESTful API built with FastAPI that provides secure authentication, user management, and AI-powered chat functionality. All endpoints return JSON responses and use standard HTTP status codes.

### API Features

- 🔐 **JWT Authentication**: Secure token-based authentication
- 📝 **Request Validation**: Comprehensive input validation with Pydantic
- 📊 **Auto Documentation**: Interactive OpenAPI/Swagger documentation
- 🔄 **Async Support**: High-performance async operations
- 🛡️ **Security**: CORS, rate limiting, and input sanitization
- 📱 **RESTful Design**: Standard REST conventions

## 🌐 Base URL & Authentication

### Base URL
```
Development: http://localhost:8000
Production: https://api.aksara-ai.com
```

### Authentication

Most endpoints require authentication using JWT Bearer tokens.

#### Header Format
```http
Authorization: Bearer <access_token>
```

#### Token Types
- **Access Token**: Short-lived (1 hour) for API access
- **Refresh Token**: Long-lived (30 days) for token renewal

## 📋 Response Format

### Standard Response Structure

#### Success Response
```json
{
  "data": {
    // Response data
  },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Paginated Response
```json
{
  "data": [
    // Array of items
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## ⚠️ Error Handling

### HTTP Status Codes

| Status Code | Description | Usage |
|-------------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `AUTHENTICATION_FAILED` | 401 | Invalid credentials |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `RESOURCE_ALREADY_EXISTS` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Example Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🔐 Authentication Endpoints

### Register User

Register a new user account.

```http
POST /users/register
```

#### Request Body
```json
{
  "username": "string",
  "email": "string",
  "nama_lengkap": "string",
  "password": "string"
}
```

#### Request Schema
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `username` | string | ✅ | 3-50 chars, alphanumeric + underscore |
| `email` | string | ✅ | Valid email format |
| `nama_lengkap` | string | ✅ | 1-100 chars |
| `password` | string | ✅ | Min 6 chars |

#### Success Response (201)
```json
{
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "nama_lengkap": "John Doe",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true
  },
  "message": "User registered successfully"
}
```

#### Error Responses
```json
// 409 Conflict - Username already exists
{
  "error": {
    "code": "RESOURCE_ALREADY_EXISTS",
    "message": "Username already registered"
  }
}

// 409 Conflict - Email already exists  
{
  "error": {
    "code": "RESOURCE_ALREADY_EXISTS",
    "message": "Email already registered"
  }
}

// 422 Validation Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "password",
        "message": "Password must be at least 6 characters"
      }
    ]
  }
}
```

### Login User

Authenticate user and receive access tokens.

```http
POST /users/login
```

#### Request Body
```json
{
  "username": "string",
  "password": "string"
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Username or email |
| `password` | string | ✅ | User password |

#### Success Response (200)
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "nama_lengkap": "John Doe"
    }
  },
  "message": "Login successful"
}
```

#### Error Responses
```json
// 401 Unauthorized - Invalid credentials
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Incorrect username or password"
  }
}

// 422 Validation Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "username",
        "message": "Username is required"
      }
    ]
  }
}
```

### Refresh Token

Refresh access token using refresh token.

```http
POST /users/refresh
```

#### Request Body
```json
{
  "refresh_token": "string"
}
```

#### Success Response (200)
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "message": "Token refreshed successfully"
}
```

#### Error Responses
```json
// 401 Unauthorized - Invalid refresh token
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Refresh token expired or invalid"
  }
}
```

### Logout

Logout user and revoke refresh token.

```http
POST /users/logout
```

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "refresh_token": "string"
}
```

#### Success Response (204)
```
No content
```

## 👤 User Management Endpoints

### Get User Profile

Get current user's profile information.

```http
GET /users/profile
```

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Success Response (200)
```json
{
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "nama_lengkap": "John Doe",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "is_active": true
  }
}
```

### Update User Profile

Update current user's profile information.

```http
PUT /users/profile
```

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "nama_lengkap": "string",
  "email": "string"
}
```

#### Request Schema
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `nama_lengkap` | string | ❌ | 1-100 chars |
| `email` | string | ❌ | Valid email format |

#### Success Response (200)
```json
{
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john.doe@example.com",
    "nama_lengkap": "John Doe Updated",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "is_active": true
  },
  "message": "Profile updated successfully"
}
```

### Change Password

Change user's password.

```http
POST /users/change-password
```

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "current_password": "string",
  "new_password": "string"
}
```

#### Success Response (200)
```json
{
  "message": "Password changed successfully"
}
```

#### Error Responses
```json
// 401 Unauthorized - Wrong current password
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Current password is incorrect"
  }
}
```

## 💬 Chat Endpoints

### Send Message

Send a message to AI and get response.

```http
POST /chat/message
```

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "message": "string",
  "conversation_id": "string" // optional
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | ✅ | User message (1-4000 chars) |
| `conversation_id` | string | ❌ | Existing conversation ID |

#### Success Response (200)
```json
{
  "data": {
    "response": "AI response to your message",
    "conversation_id": "conv_12345",
    "message_id": "msg_67890",
    "user_message": {
      "id": "msg_67889",
      "content": "User's original message",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    "ai_message": {
      "id": "msg_67890",
      "content": "AI response to your message",
      "timestamp": "2024-01-01T12:00:01Z"
    }
  },
  "message": "Message sent successfully"
}
```

#### Error Responses
```json
// 400 Bad Request - Empty message
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Message cannot be empty"
  }
}

// 404 Not Found - Invalid conversation ID
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Conversation not found"
  }
}
```

### Get Chat Histories

Get user's chat conversation histories.

```http
GET /chat/histories
```

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of histories per page (1-100) |
| `offset` | integer | 0 | Number of histories to skip |
| `search` | string | - | Search in conversation titles |
| `sort` | string | "created_at" | Sort field (created_at, updated_at) |
| `order` | string | "desc" | Sort order (asc, desc) |

#### Success Response (200)
```json
{
  "data": [
    {
      "id": "conv_12345",
      "title": "Discussion about AI",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "message_count": 5,
      "last_message": {
        "content": "Last message in conversation",
        "sender": "ai",
        "timestamp": "2024-01-01T12:00:00Z"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "has_next": true,
    "has_prev": false
  }
}
```

### Get Chat History Details

Get detailed conversation history with all messages.

```http
GET /chat/histories/{conversation_id}
```

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversation_id` | string | ✅ | Conversation identifier |

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Number of messages per page |
| `offset` | integer | 0 | Number of messages to skip |

#### Success Response (200)
```json
{
  "data": {
    "id": "conv_12345",
    "title": "Discussion about AI",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "messages": [
      {
        "id": "msg_67889",
        "content": "Hello, what is AI?",
        "sender": "user",
        "timestamp": "2024-01-01T10:00:00Z"
      },
      {
        "id": "msg_67890",
        "content": "AI stands for Artificial Intelligence...",
        "sender": "ai",
        "timestamp": "2024-01-01T10:00:01Z"
      }
    ],
    "message_count": 5
  }
}
```

#### Error Responses
```json
// 404 Not Found - Conversation doesn't exist
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Conversation not found"
  }
}

// 403 Forbidden - Not conversation owner
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Access denied to this conversation"
  }
}
```

### Update Conversation Title

Update conversation title.

```http
PUT /chat/histories/{conversation_id}/title
```

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "title": "string"
}
```

#### Success Response (200)
```json
{
  "data": {
    "id": "conv_12345",
    "title": "Updated conversation title",
    "updated_at": "2024-01-01T13:00:00Z"
  },
  "message": "Conversation title updated successfully"
}
```

### Delete Conversation

Delete a conversation and all its messages.

```http
DELETE /chat/histories/{conversation_id}
```

#### Headers
```http
Authorization: Bearer <access_token>
```

#### Success Response (204)
```
No content
```

## 🏥 Health Check Endpoints

### Basic Health Check

Basic API health status.

```http
GET /health
```

#### Success Response (200)
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

### Detailed Health Check

Comprehensive health check including dependencies.

```http
GET /health/detailed
```

#### Success Response (200)
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "dependencies": {
    "database": {
      "status": "connected",
      "response_time": "5ms"
    },
    "ai_service": {
      "status": "available",
      "response_time": "150ms"
    }
  },
  "system": {
    "cpu_usage": "15%",
    "memory_usage": "45%",
    "disk_usage": "60%"
  }
}
```

## 🚦 Rate Limiting

### Rate Limit Headers

All responses include rate limiting information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limits by Endpoint

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/users/login` | 5 requests | 15 minutes |
| `/users/register` | 3 requests | 60 minutes |
| `/chat/message` | 30 requests | 1 minute |
| Other endpoints | 100 requests | 1 minute |

### Rate Limit Exceeded Response
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 300
  }
}
```

## 🛠️ SDK Examples

### JavaScript/TypeScript

#### API Client Setup
```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class AksaraAIClient {
  private client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private accessToken: string | null = null;

  constructor() {
    // Add request interceptor for auth
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.accessToken = null;
          // Redirect to login or refresh token
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(username: string, password: string) {
    const response = await this.client.post('/users/login', {
      username,
      password,
    });
    
    this.accessToken = response.data.data.access_token;
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    nama_lengkap: string;
    password: string;
  }) {
    const response = await this.client.post('/users/register', userData);
    return response.data;
  }

  // Chat methods
  async sendMessage(message: string, conversationId?: string) {
    const response = await this.client.post('/chat/message', {
      message,
      conversation_id: conversationId,
    });
    return response.data;
  }

  async getChatHistories(params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const response = await this.client.get('/chat/histories', { params });
    return response.data;
  }

  async getChatHistory(conversationId: string) {
    const response = await this.client.get(`/chat/histories/${conversationId}`);
    return response.data;
  }

  // User methods
  async getProfile() {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async updateProfile(profileData: {
    nama_lengkap?: string;
    email?: string;
  }) {
    const response = await this.client.put('/users/profile', profileData);
    return response.data;
  }
}

export default AksaraAIClient;
```

#### Usage Examples
```typescript
const client = new AksaraAIClient();

// Login
try {
  const loginResult = await client.login('john_doe', 'password123');
  console.log('Logged in:', loginResult.data.user);
} catch (error) {
  console.error('Login failed:', error.response.data);
}

// Send message
try {
  const messageResult = await client.sendMessage('Hello, what is AI?');
  console.log('AI Response:', messageResult.data.response);
} catch (error) {
  console.error('Message failed:', error.response.data);
}

// Get chat histories
try {
  const histories = await client.getChatHistories({ limit: 10 });
  console.log('Chat histories:', histories.data);
} catch (error) {
  console.error('Failed to get histories:', error.response.data);
}
```

### Python

#### API Client Setup
```python
import requests
from typing import Optional, Dict, Any
import json

class AksaraAIClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.access_token: Optional[str] = None
        
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[Any, Any]:
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.access_token:
            headers = kwargs.get('headers', {})
            headers['Authorization'] = f"Bearer {self.access_token}"
            kwargs['headers'] = headers
            
        response = self.session.request(method, url, **kwargs)
        
        # Handle 401 errors
        if response.status_code == 401:
            self.access_token = None
            
        response.raise_for_status()
        return response.json()
    
    # Authentication methods
    def login(self, username: str, password: str) -> Dict[Any, Any]:
        data = {"username": username, "password": password}
        result = self._make_request('POST', '/users/login', json=data)
        self.access_token = result['data']['access_token']
        return result
    
    def register(self, username: str, email: str, nama_lengkap: str, password: str) -> Dict[Any, Any]:
        data = {
            "username": username,
            "email": email,
            "nama_lengkap": nama_lengkap,
            "password": password
        }
        return self._make_request('POST', '/users/register', json=data)
    
    # Chat methods
    def send_message(self, message: str, conversation_id: Optional[str] = None) -> Dict[Any, Any]:
        data = {"message": message}
        if conversation_id:
            data["conversation_id"] = conversation_id
        return self._make_request('POST', '/chat/message', json=data)
    
    def get_chat_histories(self, limit: int = 20, offset: int = 0, search: Optional[str] = None) -> Dict[Any, Any]:
        params = {"limit": limit, "offset": offset}
        if search:
            params["search"] = search
        return self._make_request('GET', '/chat/histories', params=params)
    
    def get_chat_history(self, conversation_id: str) -> Dict[Any, Any]:
        return self._make_request('GET', f'/chat/histories/{conversation_id}')
    
    # User methods
    def get_profile(self) -> Dict[Any, Any]:
        return self._make_request('GET', '/users/profile')
    
    def update_profile(self, nama_lengkap: Optional[str] = None, email: Optional[str] = None) -> Dict[Any, Any]:
        data = {}
        if nama_lengkap:
            data["nama_lengkap"] = nama_lengkap
        if email:
            data["email"] = email
        return self._make_request('PUT', '/users/profile', json=data)
```

#### Usage Examples
```python
client = AksaraAIClient()

# Login
try:
    login_result = client.login('john_doe', 'password123')
    print(f"Logged in as: {login_result['data']['user']['username']}")
except requests.exceptions.HTTPError as e:
    print(f"Login failed: {e.response.json()}")

# Send message
try:
    message_result = client.send_message('Hello, what is AI?')
    print(f"AI Response: {message_result['data']['response']}")
except requests.exceptions.HTTPError as e:
    print(f"Message failed: {e.response.json()}")

# Get chat histories
try:
    histories = client.get_chat_histories(limit=10)
    print(f"Found {len(histories['data'])} conversations")
except requests.exceptions.HTTPError as e:
    print(f"Failed to get histories: {e.response.json()}")
```

### cURL Examples

#### Login
```bash
curl -X POST "http://localhost:8000/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

#### Send Message
```bash
curl -X POST "http://localhost:8000/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "message": "Hello, what is AI?"
  }'
```

#### Get Chat Histories
```bash
curl -X GET "http://localhost:8000/chat/histories?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

This comprehensive API reference provides all the information needed to integrate with the Aksara AI backend, including detailed request/response examples, error handling, and SDK implementations for multiple programming languages.
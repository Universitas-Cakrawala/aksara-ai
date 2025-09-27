"""
Centralized response examples for all API endpoints.
This file contains all response formats that can be imported and used in routers.
"""

from typing import Dict, Any


class ResponseExamples:
    """Centralized class containing all API response examples"""

    # ==================== SUCCESS RESPONSES ====================

    @staticmethod
    def success_response(message: str, data_example: Any = None) -> Dict:
        """Generate a standard success response example"""
        return {
            "description": "Successful operation",
            "content": {
                "application/json": {
                    "example": {
                        "message": message,
                        "data": data_example if data_example is not None else {},
                    }
                }
            },
        }

    @staticmethod
    def error_response(
        message: str, error_code: int, description: str = "Error occurred"
    ) -> Dict:
        """Generate a standard error response example"""
        return {
            "description": description,
            "content": {
                "application/json": {
                    "example": {"message": message, "error": {"error_code": error_code}}
                }
            },
        }

    # ==================== USER ENDPOINT RESPONSES ====================

    @staticmethod
    def user_register_responses() -> Dict:
        """Response examples for user registration endpoint"""
        return {
            201: ResponseExamples.success_response(
                "Successfully Create User!",
                {
                    "username": "testuser",
                    "nama_lengkap": "Test User",
                    "email": "test@example.com",
                    "created_by": "admin",
                    "created_date": "2024-01-01T00:00:00",
                },
            ),
            400: ResponseExamples.error_response(
                "Username already exists!", 400, "Bad Request"
            ),
            422: ResponseExamples.error_response(
                "Validation failed", 422, "Validation Error"
            ),
        }

    @staticmethod
    def user_login_responses() -> Dict:
        """Response examples for user login endpoint"""
        return {
            202: ResponseExamples.success_response(
                "Successfully Login!",
                {"id": "uuid-string", "password": "hashed_password"},
            ),
            400: ResponseExamples.error_response(
                "password yang di input salah!", 400, "Bad Request"
            ),
            404: ResponseExamples.error_response(
                "user not found!", 404, "User not found"
            ),
        }

    @staticmethod
    def user_profile_responses() -> Dict:
        """Response examples for get user profile endpoint"""
        return {
            200: ResponseExamples.success_response(
                "Successfully Get user Profile!",
                {
                    "user": {
                        "id": "uuid-string",
                        "is_active": True,
                        "username": "admin",
                        "created_by": "system",
                        "updated_by": "system",
                        "deleted": False,
                        "created_date": "2024-01-01",
                        "updated_date": "2024-01-01",
                    },
                    "profile": {
                        "id_user": "uuid-string",
                        "nama_lengkap": "Administrator",
                        "email": "admin@aksara.ai",
                        "created_by": "system",
                        "updated_by": "system",
                        "created_date": "2024-01-01",
                        "updated_date": "2024-01-01",
                    },
                },
            ),
            401: ResponseExamples.error_response(
                "You are not logged in!", 401, "Unauthorized"
            ),
            404: ResponseExamples.error_response(
                "User profile not found!", 404, "User profile not found"
            ),
        }

    @staticmethod
    def user_update_responses() -> Dict:
        """Response examples for update user endpoint"""
        return {
            200: ResponseExamples.success_response(
                "User with name John Doe update successfully!"
            ),
            400: ResponseExamples.error_response(
                "Email : john@example.com already exists!", 400, "Bad Request"
            ),
            401: ResponseExamples.error_response(
                "You are not logged in!", 401, "Unauthorized"
            ),
            404: ResponseExamples.error_response(
                "User with id {id} not found!", 404, "User not found"
            ),
        }

    @staticmethod
    def user_password_update_responses() -> Dict:
        """Response examples for update password endpoint"""
        return {
            200: ResponseExamples.success_response("Update password successfully!"),
            400: {
                "description": "Bad Request",
                "content": {
                    "application/json": {
                        "examples": {
                            "password_mismatch": {
                                "summary": "Password mismatch",
                                "value": {
                                    "message": "New password and Confirm new password do not match!",
                                    "error": {"error_code": 400},
                                },
                            },
                            "incorrect_old_password": {
                                "summary": "Incorrect old password",
                                "value": {
                                    "message": "Old password is incorrect!",
                                    "error": {"error_code": 400},
                                },
                            },
                            "password_too_short": {
                                "summary": "Password too short",
                                "value": {
                                    "message": "Password must be at least 8 characters long!",
                                    "error": {"error_code": 400},
                                },
                            },
                        }
                    }
                },
            },
            401: ResponseExamples.error_response(
                "You are not logged in!", 401, "Unauthorized"
            ),
            404: ResponseExamples.error_response(
                "User not found!", 404, "User not found"
            ),
        }

    # ==================== HEALTH ENDPOINT RESPONSES ====================

    @staticmethod
    def health_check_responses() -> Dict:
        """Response examples for health check endpoint"""
        return {
            200: ResponseExamples.success_response(
                "Server running successfully!", {"success": True}
            ),
            500: ResponseExamples.error_response(
                "Server error occurred", 500, "Server error"
            ),
        }

    # ==================== REFRESH TOKEN RESPONSES ====================

    @staticmethod
    def refresh_token_responses() -> Dict:
        """Response examples for refresh token endpoint"""
        return {
            200: ResponseExamples.success_response(
                "Successfully refreshed access token!",
                {
                    "access_token": "new_jwt_access_token",
                    "refresh_token": "existing_refresh_token",
                },
            ),
            401: ResponseExamples.error_response(
                "Invalid or expired refresh token",
                401,
                "Invalid or expired refresh token",
            ),
        }

    # ==================== Chat ENDPOINT RESPONSES ====================
    @staticmethod
    def chat_responses() -> Dict:
        """Response examples for chat endpoint"""
        return {
            200: ResponseExamples.success_response(
                "Successfully generated chat response",
                {
                    "id": "uuid-string",
                    "model": "gemini-2.5-flash-preview-05-20",
                    "input": "Hello, how are you?",
                    "output": [
                        {
                            "role": "assistant",
                            "content": "This is a sample response from the AI model.",
                        }
                    ],
                    "metadata": {
                        "temperature": "0.0",
                        "max_tokens": "512",
                    },
                },
            ),
            400: ResponseExamples.error_response(
                "Invalid request payload", 400, "Bad Request"
            ),
            401: ResponseExamples.error_response(
                "Authentication required", 401, "Unauthorized"
            ),
            500: ResponseExamples.error_response(
                "Internal server error", 500, "Internal Server Error"
            ),
        }

    # ==================== CHAT HISTORIES ENDPOINT RESPONSES ====================

    @staticmethod
    def chat_histories_responses() -> Dict:
        """Response examples for chat histories endpoint"""
        return {
            200: ResponseExamples.success_response(
                "Successfully retrieved chat histories",
                {
                    "items": [
                        {
                            "conversation_id": "c0a80154-7c2b-4f6d-9a2b-1a2b3c4d5e6f",
                            "title": "Diskusi tentang arsitektur Transformer",
                            "last_message_preview": "Terima kasih, itu sangat jelas.",
                            "last_sender": "user",
                            "last_timestamp": "2025-09-27T12:36:45Z",
                            "total_messages": 4,
                            "model": "gemini-2.5-flash",
                            "language": "id",
                            "is_active": True,
                            "created_date": "2025-09-27T12:34:56Z",
                        },
                        {
                            "conversation_id": "d4f5a6b7-c8d9-40e1-9f2a-0b1c2d3e4f50",
                            "title": "Catatan harian prompt",
                            "last_message_preview": "Bisa tolong ringkas poin-poin utamanya?",
                            "last_sender": "model",
                            "last_timestamp": "2025-09-26T09:15:10Z",
                            "total_messages": 2,
                            "model": "gemini-2.5-flash",
                            "language": "id",
                            "is_active": False,
                            "created_date": "2025-09-26T09:10:00Z",
                        },
                        {
                            "conversation_id": "e1f2a3b4-c5d6-47e8-9a0b-1c2d3e4f5g6h",
                            "title": "Rencana perjalanan liburan",
                            "last_message_preview": "Apa rekomendasi tempat makan di sana?",
                            "last_sender": "user",
                            "last_timestamp": "2025-09-25T18:45:30Z",
                            "total_messages": 5,
                            "model": "gemini-2.5-flash",
                            "language": "id",
                            "is_active": True,
                            "created_date": "2025-09-25T18:30:00Z",
                        },
                    ],
                    "pagination": {"page": 1, "per_page": 10, "total": 42},
                },
            ),
            401: ResponseExamples.error_response(
                "Authentication required", 401, "Unauthorized"
            ),
            500: ResponseExamples.error_response(
                "Internal server error", 500, "Internal Server Error"
            ),
        }

    # ==================== CHAT HISTORY BY ID ENDPOINT RESPONSES ====================
    @staticmethod
    def chat_history_responses() -> Dict:
        """Response examples for chat history by ID endpoint"""
        return {
            200: ResponseExamples.success_response(
                "Successfully retrieved chat history",
                {
                    "conversation_id": "c0a80154-7c2b-4f6d-9a2b-1a2b3c4d5e6f",
                    "title": "Diskusi tentang arsitektur Transformer",
                    "model": "gemini-2.5-flash",
                    "language": "id",
                    "is_active": True,
                    "created_date": "2025-09-27T12:34:56Z",
                    "messages": [
                        {
                            "message_id": "m1",
                            "sender": "user",
                            "text": "Halo, bisakah kamu menjelaskan bagaimana arsitektur Transformer bekerja?",
                            "timestamp": "2025-09-27T12:34:56Z",
                        },
                        {
                            "message_id": "m2",
                            "sender": "model",
                            "text": (
                                "Tentu! Arsitektur Transformer adalah model deep learning yang "
                                "menggunakan mekanisme attention untuk memproses data sekuensial..."
                            ),
                            "timestamp": "2025-09-27T12:35:30Z",
                        },
                        {
                            "message_id": "m3",
                            "sender": "user",
                            "text": "Bisakah kamu memberikan contoh aplikasinya?",
                            "timestamp": "2025-09-27T12:36:10Z",
                        },
                        {
                            "message_id": "m4",
                            "sender": "model",
                            "text": (
                                "Tentu! Transformer banyak digunakan dalam pemrosesan bahasa alami, "
                                "seperti dalam model GPT dan BERT..."
                            ),
                            "timestamp": "2025-09-27T12:36:45Z",
                        },
                    ],
                },
            ),
            401: ResponseExamples.error_response(
                "Authentication required", 401, "Unauthorized"
            ),
            404: ResponseExamples.error_response(
                "Chat history not found", 404, "Not Found"
            ),
            500: ResponseExamples.error_response(
                "Internal server error", 500, "Internal Server Error"
            ),
        }

    # ==================== COMMON ERROR RESPONSES ====================

    @staticmethod
    def common_error_responses() -> Dict:
        """Common error responses that can be added to any endpoint"""
        return {
            "validation_error": {
                422: ResponseExamples.error_response(
                    "Validation failed", 422, "Validation Error"
                )
            },
            "unauthorized": {
                401: ResponseExamples.error_response(
                    "Authentication required", 401, "Unauthorized"
                )
            },
            "forbidden": {
                403: ResponseExamples.error_response(
                    "Access forbidden", 403, "Forbidden"
                )
            },
            "not_found": {
                404: ResponseExamples.error_response(
                    "Resource not found", 404, "Not Found"
                )
            },
            "server_error": {
                500: ResponseExamples.error_response(
                    "Internal server error", 500, "Internal Server Error"
                )
            },
        }

    # ==================== UTILITY METHODS ====================

    @staticmethod
    def combine_responses(*response_dicts) -> Dict:
        """Combine multiple response dictionaries"""
        combined = {}
        for response_dict in response_dicts:
            combined.update(response_dict)
        return combined

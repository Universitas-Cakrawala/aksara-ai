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
                        "tipe_akun": "ADMIN",
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
    def user_delete_responses() -> Dict:
        """Response examples for delete user endpoint"""
        return {
            200: ResponseExamples.success_response(
                "Profile soft deleted successfully!"
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

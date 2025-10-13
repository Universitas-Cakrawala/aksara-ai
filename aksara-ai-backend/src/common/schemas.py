"""
Common response sch    message    err    message: str = Field(..., description="Error message")r_code: int = Field(..., description="HTTP error code") str = Field(
        ..., description="Success message"
    )s for consistent API responses across the application.
These schemas define the standardized format for success and error responses.
"""

from typing import Any, Generic, Optional, TypeVar

from fastapi import status
from pydantic import BaseModel as BaseModelV2, Field
from starlette.responses import JSONResponse

T = TypeVar("T")


# Base response models
class BaseResponse(BaseModelV2, Generic[T]):
    """Base response model for all API responses"""

    message: str = Field(..., description="Response message")


class SuccessResponse(BaseResponse[T]):
    """Standard success response format"""

    message: str = Field(..., description="Success message")
    data: Optional[T] = Field(default=None, description="Response data")


class ErrorDetail(BaseModelV2):
    """Error detail structure"""

    error_code: int = Field(..., description="HTTP error code")
    details: Optional[str] = Field(default=None, description="Additional error details")


class ErrorResponse(BaseResponse):
    """Standard error response format"""

    message: str = Field(..., description="Error message")
    error: ErrorDetail = Field(..., description="Error details")


# Utility functions for creating standardized responses
def create_success_response(
    message: str, data: Any = None, status_code: int = status.HTTP_200_OK
) -> JSONResponse:
    """
    Create a standardized success response

    Args:
        message: Success message
        data: Response data (optional)
        status_code: HTTP status code

    Returns:
        JSONResponse with standardized format
    """
    content = {"message": message, "data": data if data is not None else {}}
    return JSONResponse(status_code=status_code, content=content)


def create_error_response(
    message: str,
    error_code: int = status.HTTP_400_BAD_REQUEST,
    details: Optional[str] = None,
    status_code: Optional[int] = None,
) -> JSONResponse:
    """
    Create a standardized error response

    Args:
        message: Error message
        error_code: Error code (defaults to status code)
        details: Additional error details (optional)
        status_code: HTTP status code (defaults to error_code)

    Returns:
        JSONResponse with standardized format
    """
    if status_code is None:
        status_code = error_code

    content = {
        "message": message,
        "error": {
            "error_code": error_code,
        },
    }

    if details:
        content["error"]["details"] = details

    return JSONResponse(status_code=status_code, content=content)


# Common response examples for Swagger documentation
def get_success_response_examples():
    """Get success response examples for Swagger documentation"""
    return {
        "application/json": {
            "examples": {
                "success": {
                    "summary": "Successful Response",
                    "value": {
                        "message": "Operation completed successfully",
                        "data": {},
                    },
                }
            }
        }
    }


def get_error_response_examples():
    """Get error response examples for Swagger documentation"""
    return {
        "application/json": {
            "examples": {
                "validation_error": {
                    "summary": "Validation Error",
                    "value": {
                        "message": "Validation failed",
                        "error": {"error_code": 422},
                    },
                },
                "not_found": {
                    "summary": "Not Found",
                    "value": {
                        "message": "Resource not found",
                        "error": {"error_code": 404},
                    },
                },
                "unauthorized": {
                    "summary": "Unauthorized",
                    "value": {
                        "message": "Authentication required",
                        "error": {"error_code": 401},
                    },
                },
                "server_error": {
                    "summary": "Server Error",
                    "value": {
                        "message": "Internal server error",
                        "error": {"error_code": 500},
                    },
                },
            }
        }
    }

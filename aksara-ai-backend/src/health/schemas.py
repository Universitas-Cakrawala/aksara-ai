from starlette import status
from src.common.schemas import create_success_response, create_error_response


def ok(values, message):
    """Legacy function - use create_success_response instead"""
    return create_success_response(
        message=message, data=values, status_code=status.HTTP_200_OK
    )


def formatError(message, status_code):
    """Legacy function - use create_error_response instead"""
    return create_error_response(
        message=message,
        error_code=status_code,
    )

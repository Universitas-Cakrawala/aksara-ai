import re
import logging

from src.common.schemas import create_error_response, create_success_response


def safe_float(value, default=0.0):
    return float(value) if value is not None else default


def safe_convert_to_int(value):
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return 0


def clean_and_upper(value):
    if value is None or value == "":
        return ""
    value = str(value)
    return value.strip().upper()


# Make a regular expression
# for validating an Email
regex = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"


# Define a function for
# for validating an Email
def validateEmail(email):

    # pass the regular expression
    # and the string into the fullmatch() method
    if re.fullmatch(regex, email):
        return True
    else:
        return False


def ok(values, message, status_code):
    """Legacy function - use create_success_response instead"""
    return create_success_response(
        message=message, data=values, status_code=status_code
    )


def formatError(message, status_code):
    """Legacy function - use create_error_response instead"""
    return create_error_response(
        message=message, error_code=status_code, status_code=status_code
    )


# function logging errors, info, debug
def log(message, log_level="info"):
    log_level = log_level.lower()
    if log_level == "error":
        logging.error(message)
    elif log_level == "info":
        logging.info(message)
    elif log_level == "debug":
        logging.debug(message)
    elif log_level == "warning":
        logging.warning(message)
    else:
        logging.info(message)  # Default to info if invalid level provided

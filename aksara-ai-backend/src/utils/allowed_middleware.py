# List of allowed origins (domains)
ALLOWED_ORIGINS = [
    "*",  # Allow all origins
]

# List of HTTP methods that are allowed
# Include PATCH, OPTIONS and HEAD to support preflight and partial updates
ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]

# List of HTTP headers that are allowed
ALLOWED_HEADERS = [
    "Authorization",
    "Content-Type",
    "X-Requested-With",
    "Accept",
    "Origin",
    "User-Agent",
    "DNT",
    "Cache-Control",
    "Keep-Alive",
    "X-CustomHeader",
    "ip_address",
    "Ip-Address",
    "ip-address",
]

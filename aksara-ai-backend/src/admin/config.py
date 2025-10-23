"""
FastAPI Admin Configuration
This module provides imports for the admin module.

The admin functionality has been separated into:
- AdminRepository: Database operations (src/admin/repository.py)
- AdminController: Business logic (src/admin/controller.py)
- AdminRouter: Route definitions (src/admin/router.py)
"""

# Module imports
from .controller import AdminController
from .repository import AdminRepository
from .router import admin_router, setup_admin_routes

__all__ = [
    "AdminController",
    "AdminRepository",
    "admin_router",
    "setup_admin_routes",
]

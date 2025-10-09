"""
FastAPI Admin Configuration
This module provides backward compatibility imports for the refactored admin module.

The admin functionality has been separated into:
- AdminRepository: Database operations (src/admin/repository.py)
- AdminController: Business logic (src/admin/controller.py)
- AdminRouter: Route definitions (src/admin/router.py)
"""

# Backward compatibility imports
from .controller import AdminController
from .repository import AdminRepository
from .router import admin_router, setup_admin_routes

# Legacy compatibility - maintain existing interface
require_admin = AdminController.require_admin

__all__ = [
    "AdminController",
    "AdminRepository",
    "admin_router",
    "setup_admin_routes",
    "require_admin",  # Legacy compatibility
]

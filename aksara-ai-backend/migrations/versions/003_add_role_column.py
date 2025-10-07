"""add role column to user table

Revision ID: 003_add_role_column
Revises: 002_refresh_tokens
Create Date: 2025-10-07 06:25:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "003_add_role_column"
down_revision = "001_initial_migrate"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add role column with default value 'user'
    op.add_column(
        "user", sa.Column("role", sa.String(), nullable=False, server_default="user")
    )
    op.create_index("ix_user_role", "user", ["role"])


def downgrade() -> None:
    op.drop_index("ix_user_role", table_name="user")
    op.drop_column("user", "role")

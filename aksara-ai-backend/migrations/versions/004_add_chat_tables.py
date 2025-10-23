"""add chat tables

Revision ID: 004_add_chat_tables
Revises: 003_add_role_column
Create Date: 2025-10-23 21:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "004_add_chat_tables"
down_revision = "003_add_role_column"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create chat_histories table
    op.create_table(
        "chat_histories",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column(
            "model", sa.String(), nullable=True, server_default="gemini-2.5-flash"
        ),
        sa.Column("language", sa.String(), nullable=True, server_default="id"),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default="true"),
        sa.Column("deleted", sa.Boolean(), nullable=True, server_default="false"),
        sa.Column("created_by", sa.String(), nullable=True),
        sa.Column(
            "created_date",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("updated_by", sa.String(), nullable=True),
        sa.Column(
            "updated_date",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
    )

    # Create index on user_id for faster queries
    op.create_index("ix_chat_histories_user_id", "chat_histories", ["user_id"])
    op.create_index("ix_chat_histories_deleted", "chat_histories", ["deleted"])
    op.create_index("ix_chat_histories_is_active", "chat_histories", ["is_active"])

    # Create chat_messages table
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("chat_history_id", sa.String(), nullable=False),
        sa.Column("sender", sa.String(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("deleted", sa.Boolean(), nullable=True, server_default="false"),
        sa.Column(
            "created_date",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_date",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["chat_history_id"], ["chat_histories.id"], ondelete="CASCADE"
        ),
    )

    # Create indexes on chat_messages
    op.create_index(
        "ix_chat_messages_chat_history_id", "chat_messages", ["chat_history_id"]
    )
    op.create_index("ix_chat_messages_deleted", "chat_messages", ["deleted"])
    op.create_index("ix_chat_messages_created_date", "chat_messages", ["created_date"])


def downgrade() -> None:
    # Drop indexes first
    op.drop_index("ix_chat_messages_created_date", table_name="chat_messages")
    op.drop_index("ix_chat_messages_deleted", table_name="chat_messages")
    op.drop_index("ix_chat_messages_chat_history_id", table_name="chat_messages")

    # Drop chat_messages table
    op.drop_table("chat_messages")

    # Drop indexes for chat_histories
    op.drop_index("ix_chat_histories_is_active", table_name="chat_histories")
    op.drop_index("ix_chat_histories_deleted", table_name="chat_histories")
    op.drop_index("ix_chat_histories_user_id", table_name="chat_histories")

    # Drop chat_histories table
    op.drop_table("chat_histories")

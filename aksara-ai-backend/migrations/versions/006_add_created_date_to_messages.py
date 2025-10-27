"""add created_date to chat_messages

Revision ID: 006_add_created_date_to_messages
Revises: 005_update_chat_tables
Create Date: 2025-10-27 09:19:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '006_add_created_date_to_messages'
down_revision = '005_update_chat_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add created_date column to chat_messages if it doesn't exist
    op.add_column('chat_messages', sa.Column('created_date', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')))
    
    # Add index for created_date for better query performance
    op.create_index('ix_chat_messages_created_date', 'chat_messages', ['created_date'])


def downgrade() -> None:
    # Drop index
    op.drop_index('ix_chat_messages_created_date', 'chat_messages')
    
    # Drop column
    op.drop_column('chat_messages', 'created_date')

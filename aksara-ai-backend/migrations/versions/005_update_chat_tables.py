"""update_chat_tables

Revision ID: 005_update_chat_tables
Revises: 004_add_chat_tables
Create Date: 2025-10-27 10:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '005_update_chat_tables'
down_revision = '004_add_chat_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add missing columns to chat_histories table
    op.add_column('chat_histories', sa.Column('deleted', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('chat_histories', sa.Column('created_by', sa.String(), nullable=True))
    op.add_column('chat_histories', sa.Column('updated_by', sa.String(), nullable=True))
    op.add_column('chat_histories', sa.Column('updated_date', sa.DateTime(), nullable=True))
    
    # Add missing columns to chat_messages table
    op.add_column('chat_messages', sa.Column('deleted', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('chat_messages', sa.Column('updated_date', sa.DateTime(), nullable=True))
    
    # Create indexes for better query performance
    op.create_index('ix_chat_histories_user_id', 'chat_histories', ['user_id'])
    op.create_index('ix_chat_messages_chat_history_id', 'chat_messages', ['chat_history_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_chat_messages_chat_history_id', 'chat_messages')
    op.drop_index('ix_chat_histories_user_id', 'chat_histories')
    
    # Drop columns from chat_messages
    op.drop_column('chat_messages', 'updated_date')
    op.drop_column('chat_messages', 'deleted')
    
    # Drop columns from chat_histories
    op.drop_column('chat_histories', 'updated_date')
    op.drop_column('chat_histories', 'updated_by')
    op.drop_column('chat_histories', 'created_by')
    op.drop_column('chat_histories', 'deleted')

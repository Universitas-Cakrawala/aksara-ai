"""add_chat_tables

Revision ID: 004_add_chat_tables
Revises: 003_add_role_column
Create Date: 2025-10-14 10:37:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004_add_chat_tables'
down_revision = '003_add_role_column'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create chat_histories table
    op.create_table(
        'chat_histories',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('model', sa.String(), nullable=True),
        sa.Column('language', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_date', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create chat_messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('chat_history_id', sa.String(), nullable=True),
        sa.Column('sender', sa.String(), nullable=True),
        sa.Column('text', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['chat_history_id'], ['chat_histories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('chat_messages')
    op.drop_table('chat_histories')
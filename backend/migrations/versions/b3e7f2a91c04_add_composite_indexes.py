"""add composite indexes for session queries

Revision ID: b3e7f2a91c04
Revises: a2f9c1d4e8b3
Create Date: 2026-03-31

"""
from alembic import op

revision = 'b3e7f2a91c04'
down_revision = 'a2f9c1d4e8b3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Consultas más frecuentes: filtrar por user_id + ordenar/filtrar por started_at
    op.create_index(
        'ix_focus_sessions_user_started',
        'focus_sessions',
        ['user_id', 'started_at'],
    )


def downgrade() -> None:
    op.drop_index('ix_focus_sessions_user_started', table_name='focus_sessions')

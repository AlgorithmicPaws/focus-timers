"""add_user_settings_presets

Revision ID: 76a1b31a6395
Revises: a2f9c1d4e8b3
Create Date: 2026-03-31 10:18:22.587095

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '76a1b31a6395'
down_revision: Union[str, None] = 'a2f9c1d4e8b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE presets (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            technique technique NOT NULL,
            config JSON NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT now()
        )
    """)
    op.create_index('ix_presets_id', 'presets', ['id'], unique=False)
    op.create_index('ix_presets_user_id', 'presets', ['user_id'], unique=False)

    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('theme', sa.String(length=10), nullable=False, server_default='dark'),
        sa.Column('sound_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('ambient_sound', sa.String(length=50), nullable=True),
        sa.Column('tick_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('daily_goal_min', sa.Integer(), nullable=False, server_default='120'),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_user_settings_id', 'user_settings', ['id'], unique=False)
    op.create_index('ix_user_settings_user_id', 'user_settings', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_user_settings_user_id', table_name='user_settings')
    op.drop_index('ix_user_settings_id', table_name='user_settings')
    op.drop_table('user_settings')
    op.drop_index('ix_presets_user_id', table_name='presets')
    op.drop_index('ix_presets_id', table_name='presets')
    op.drop_table('presets')
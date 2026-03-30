"""add_flowtime_bolsa_details

Revision ID: a2f9c1d4e8b3
Revises: 1bc760c13d7b
Create Date: 2026-03-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2f9c1d4e8b3'
down_revision: Union[str, None] = '1bc760c13d7b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'flowtime_details',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('break_model', sa.String(length=20), nullable=False),
        sa.Column('break_ratio', sa.Integer(), nullable=False),
        sa.Column('break_recommended_sec', sa.Integer(), nullable=False),
        sa.Column('break_actual_sec', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['focus_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_flowtime_details_id', 'flowtime_details', ['id'], unique=False)
    op.create_index('ix_flowtime_details_session_id', 'flowtime_details', ['session_id'], unique=True)

    op.create_table(
        'bolsa_details',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('budget_total_sec', sa.Integer(), nullable=False),
        sa.Column('budget_work_sec', sa.Integer(), nullable=False),
        sa.Column('budget_break_sec', sa.Integer(), nullable=False),
        sa.Column('budget_used_sec', sa.Integer(), nullable=False),
        sa.Column('breaks_taken', sa.JSON(), nullable=True),
        sa.Column('budget_exhausted', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['focus_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_bolsa_details_id', 'bolsa_details', ['id'], unique=False)
    op.create_index('ix_bolsa_details_session_id', 'bolsa_details', ['session_id'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_bolsa_details_session_id', table_name='bolsa_details')
    op.drop_index('ix_bolsa_details_id', table_name='bolsa_details')
    op.drop_table('bolsa_details')

    op.drop_index('ix_flowtime_details_session_id', table_name='flowtime_details')
    op.drop_index('ix_flowtime_details_id', table_name='flowtime_details')
    op.drop_table('flowtime_details')

"""merge heads: user_settings_presets + composite_indexes

Une las dos cabezas que partían de a2f9c1d4e8b3 (76a1b31a6395 y
b3e7f2a91c04) en una sola, para que `alembic upgrade head` resuelva a una
única revisión. Sin operaciones de esquema: solo reconcilia el grafo.

Revision ID: e7f1a9c2b8d4
Revises: 76a1b31a6395, b3e7f2a91c04
Create Date: 2026-06-14 00:00:00.000000

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = 'e7f1a9c2b8d4'
down_revision: Union[str, Sequence[str], None] = ('76a1b31a6395', 'b3e7f2a91c04')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

"""add_is_archived_to_boards

Revision ID: a1b2c3d4e5f6
Revises: 167323b801ec
Create Date: 2026-07-20 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '167323b801ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add is_archived column to boards table."""
    op.add_column('boards', sa.Column('is_archived', sa.Integer(), nullable=True, server_default='0'))


def downgrade() -> None:
    """Remove is_archived column from boards table."""
    op.drop_column('boards', 'is_archived')

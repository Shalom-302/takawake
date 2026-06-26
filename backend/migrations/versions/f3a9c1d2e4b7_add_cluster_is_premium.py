"""Add cluster.is_premium (gating lecteur connecté)

Ajoute sur `clusters` la colonne `is_premium` : un article premium n'expose son
contenu complet (synthèse + slides) qu'aux utilisateurs connectés ; le visiteur
anonyme reçoit un teaser + un mur d'inscription (cf. routers/cluster.py).

server_default=false → l'existant reste public (non premium) après migration.

Revision ID: f3a9c1d2e4b7
Revises: e7c9a2b4f1d8
Create Date: 2026-06-25 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3a9c1d2e4b7'
down_revision: Union[str, None] = 'e7c9a2b4f1d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('clusters', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('is_premium', sa.Boolean(), nullable=False, server_default=sa.false())
        )
        batch_op.create_index(batch_op.f('ix_clusters_is_premium'), ['is_premium'], unique=False)


def downgrade() -> None:
    with op.batch_alter_table('clusters', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_clusters_is_premium'))
        batch_op.drop_column('is_premium')

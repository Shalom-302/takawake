"""Add veille_id to Cluster

Le clustering est mono-veille (cf. services/clustering.py) : un cluster
appartient toujours à exactement une veille. On matérialise ce lien par une
FK `veille_id` sur `clusters`, ce qui permet de filtrer GET /api/clusters/
par veille au lieu de passer par les articles.

Revision ID: a7f3c2e1b9d4
Revises: b1a33ebdefe9
Create Date: 2026-06-02 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a7f3c2e1b9d4'
down_revision: Union[str, None] = 'b1a33ebdefe9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Colonne ajoutée d'abord en nullable pour pouvoir backfiller l'existant.
    with op.batch_alter_table('clusters', schema=None) as batch_op:
        batch_op.add_column(sa.Column('veille_id', sa.Integer(), nullable=True))

    # 2. Backfill : chaque cluster hérite de la veille de ses articles. Comme un
    #    cluster est mono-veille, MIN(veille_id) est non ambigu.
    op.execute(
        """
        UPDATE clusters AS c
        SET veille_id = sub.veille_id
        FROM (
            SELECT cluster_id, MIN(veille_id) AS veille_id
            FROM articles
            WHERE cluster_id IS NOT NULL
            GROUP BY cluster_id
        ) AS sub
        WHERE c.id = sub.cluster_id
        """
    )

    # 3. Clusters orphelins (aucun article rattaché) : indéterminables, donc
    #    supprimés. En pratique delete_empty_clusters() les purge déjà après
    #    chaque run de clustering → cette ligne ne touche normalement aucune ligne.
    op.execute("DELETE FROM clusters WHERE veille_id IS NULL")

    # 4. Contrainte définitive : NOT NULL + index + FK.
    with op.batch_alter_table('clusters', schema=None) as batch_op:
        batch_op.alter_column('veille_id', existing_type=sa.Integer(), nullable=False)
        batch_op.create_index(batch_op.f('ix_clusters_veille_id'), ['veille_id'], unique=False)
        batch_op.create_foreign_key(
            'fk_clusters_veille_id_veilles', 'veilles', ['veille_id'], ['id']
        )


def downgrade() -> None:
    with op.batch_alter_table('clusters', schema=None) as batch_op:
        batch_op.drop_constraint('fk_clusters_veille_id_veilles', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_clusters_veille_id'))
        batch_op.drop_column('veille_id')

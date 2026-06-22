"""Add cluster cover image + AI-original snapshots (human-in-the-loop)

Ajoute sur `clusters` :
- `cover_image_url`      : image de couverture validée (éditable).
- `summary_article_ai`   : snapshot figé de la synthèse IA (référence revert).
- `slides_ai`            : snapshot figé des slides IA.
- `cover_image_url_ai`   : snapshot figé de la couverture proposée par l'IA.

Les colonnes `*_ai` permettent de "revenir à l'original IA" après édition
humaine (POST /clusters/{id}/revert). Backfill : pour l'existant, la version de
travail EST la version IA (l'édition avec snapshot n'existait pas avant), donc on
recopie summary_article/slides dans leurs snapshots respectifs.

Revision ID: e7c9a2b4f1d8
Revises: d2f1a4c7b8e3
Create Date: 2026-06-22 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7c9a2b4f1d8'
down_revision: Union[str, None] = 'd2f1a4c7b8e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('clusters', schema=None) as batch_op:
        batch_op.add_column(sa.Column('cover_image_url', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('summary_article_ai', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('slides_ai', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('cover_image_url_ai', sa.Text(), nullable=True))

    # Backfill : l'existant n'a jamais été édité avec snapshot → la synthèse et
    # les slides actuels sont la version IA de référence.
    op.execute("UPDATE clusters SET summary_article_ai = summary_article WHERE summary_article IS NOT NULL")
    op.execute("UPDATE clusters SET slides_ai = slides WHERE slides IS NOT NULL")


def downgrade() -> None:
    with op.batch_alter_table('clusters', schema=None) as batch_op:
        batch_op.drop_column('cover_image_url_ai')
        batch_op.drop_column('slides_ai')
        batch_op.drop_column('summary_article_ai')
        batch_op.drop_column('cover_image_url')

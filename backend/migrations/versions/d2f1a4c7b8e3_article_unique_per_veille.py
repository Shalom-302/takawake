"""Article: unicité par veille (veille_id, source_url) au lieu de globale

Avant : `source_url` était globalement unique (index unique ix_articles_source_url),
ce qui faisait que `create_or_update` (basé sur l'URL seule) ÉCRASAIT/volait un
article appartenant à une autre veille quand deux veilles se recoupaient
(corruption silencieuse : l'article changeait de veille_id, le cluster se vidait).

Après : unicité portée par le couple (veille_id, source_url). Un même article peut
coexister dans plusieurs veilles ; la dédup du coût LLM se fait par réutilisation
de l'analyse existante (cf. analyze_articles_node), pas par l'unicité de l'URL.

Sûr : tant que l'URL était globalement unique, il n'existe aucun doublon
(veille_id, source_url) → la nouvelle contrainte ne peut pas être violée.

Revision ID: d2f1a4c7b8e3
Revises: a7f3c2e1b9d4
Create Date: 2026-06-16 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2f1a4c7b8e3'
down_revision: Union[str, None] = 'a7f3c2e1b9d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('articles', schema=None) as batch_op:
        # 1. L'ancien index unique sur source_url seul → index non unique
        #    (on garde l'index pour les lookups par URL).
        batch_op.drop_index(batch_op.f('ix_articles_source_url'))
        batch_op.create_index(batch_op.f('ix_articles_source_url'), ['source_url'], unique=False)
        # 2. Unicité composite (veille_id, source_url).
        batch_op.create_unique_constraint('uq_article_veille_url', ['veille_id', 'source_url'])


def downgrade() -> None:
    with op.batch_alter_table('articles', schema=None) as batch_op:
        batch_op.drop_constraint('uq_article_veille_url', type_='unique')
        batch_op.drop_index(batch_op.f('ix_articles_source_url'))
        batch_op.create_index(batch_op.f('ix_articles_source_url'), ['source_url'], unique=True)

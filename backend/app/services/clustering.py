"""
Clustering v2 — regroupement des articles d'une veille par similarité vectorielle.

Pipeline (cf. décision d'archi du 2026-05-20), exécuté **par veille** :
  1. Récupère les vecteurs des articles depuis Qdrant (`scroll_by_veille`).
  2. `AgglomerativeClustering` (distance cosine, average linkage, seuil) → une
     partition stricte : chaque article appartient à exactement un groupe.
  3. Cap `CLUSTER_MAX_SIZE` : si un groupe dépasse, on garde le top-N par
     `score_pertinence`, le surplus repasse non-clusterisé.
  4. Le LLM **nomme** chaque cluster (1 question-titre, 1 appel/cluster). Il ne
     regroupe plus rien — c'est ce qui rend le résultat déterministe et
     supprime les doublons / hallucinations de l'ancienne approche.
  5. Persiste `cluster_id` dans Postgres ET dans Qdrant, puis nettoie les
     clusters vides.

Re-run : `purge_unpublished_for_veille` repart d'une ardoise propre côté
clusters non publiés ; les clusters publiés (validés par un humain) sont
préservés et leurs articles exclus du recalcul.
"""

from __future__ import annotations

import asyncio
import json
import re
from collections import defaultdict
from typing import Any, Dict, List, Optional

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.crud.crud_article import crud_article
from app.crud.crud_cluster import crud_cluster
from app.models.veille import Article
from app.schemas.veille import ClusterCreate
from app.services.llm_factory import get_llm
from app.services.qdrant_service import (
    clear_cluster_for_articles,
    scroll_by_veille,
    set_cluster_for_articles,
)

# Nombre d'articles représentatifs (les mieux scorés) montrés au LLM par groupe.
_NAMING_SAMPLE_SIZE = 4

# Nommage de TOUS les clusters en un seul appel : le LLM voit tous les groupes
# d'un coup, ce qui force des titres différenciés. Un nommage cluster-par-cluster
# produit des questions stratégiques génériques quasi identiques.
_NAMING_PROMPT = """Tu es un expert en stratégie numérique africaine.
On a regroupé des articles en {n} groupes thématiques DISTINCTS. Pour chaque
groupe, voici un échantillon d'articles (titre + problématique) :

{groupes}

Pour CHAQUE groupe, génère une question-titre :
- percutante et synthétique, qui pousse à la réflexion stratégique pour l'Afrique ;
- fidèle au thème SPÉCIFIQUE du groupe (fintech, cybersécurité, IA, énergie...) ;
- nettement DIFFÉRENCIÉE des autres — chaque groupe traite d'un sujet distinct,
  les titres ne doivent surtout pas se ressembler.

Réponds UNIQUEMENT par un tableau JSON de {n} chaînes, dans l'ordre des groupes,
sans clé ni texte autour. Exemple : ["Question du groupe 1 ?", "Question du groupe 2 ?"]"""


# --- Helpers ----------------------------------------------------------------

def _article_score(article: Article) -> int:
    """Score de pertinence (1-10) extrait du JSON `analysis`. 0 si absent."""
    analysis = article.analysis or {}
    score = analysis.get("score_pertinence")
    return int(score) if isinstance(score, (int, float)) else 0


def _problematique_of(article: Article) -> str:
    """Problématique africaine de l'article (fallback : titre). Tronquée."""
    analysis = article.analysis or {}
    text = analysis.get("problematique_africaine") or article.title or ""
    return str(text).strip()[:400]


def _clean_title(raw: str) -> str:
    """Nettoie la sortie LLM : trim, retrait des guillemets, une seule ligne."""
    title = (raw or "").strip().strip('"').strip("'").strip()
    title = " ".join(title.split())
    return title[:300]


def _fallback_title(articles: List[Article]) -> str:
    """Titre de repli si le LLM échoue : sujet/titre de l'article le plus pertinent."""
    top = max(articles, key=_article_score)
    analysis = top.analysis or {}
    sujet = analysis.get("sujet_cluster")
    return _clean_title(str(sujet)) if sujet else _clean_title(top.title)


def _agglomerative_labels(vectors: List[List[float]], sim_threshold: float) -> List[int]:
    """
    Clustering agglomératif (cosine / average linkage) sans nombre de clusters
    fixé : on coupe le dendrogramme au seuil de distance `1 - sim_threshold`.
    Synchrone (sklearn/numpy) — à appeler via `asyncio.to_thread`.
    """
    n = len(vectors)
    if n == 0:
        return []
    if n == 1:
        return [0]

    import numpy as np
    from sklearn.cluster import AgglomerativeClustering

    matrix = np.asarray(vectors, dtype=np.float32)
    model = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=1.0 - sim_threshold,
        metric="cosine",
        linkage="average",
    )
    return model.fit_predict(matrix).tolist()


def _format_group(index: int, articles: List[Article]) -> str:
    """Bloc texte d'un groupe pour le prompt de nommage (articles représentatifs)."""
    sample = sorted(articles, key=_article_score, reverse=True)[:_NAMING_SAMPLE_SIZE]
    lignes = "\n".join(
        f"  - [{(a.title or '').strip()[:120]}] {_problematique_of(a)}"
        for a in sample
    )
    return f"Groupe {index} ({len(articles)} articles) :\n{lignes}"


def _parse_title_list(raw: str, expected: int) -> Optional[List[str]]:
    """Extrait de la réponse LLM un tableau JSON d'exactement `expected` titres."""
    match = re.search(r"\[.*\]", raw or "", re.DOTALL)
    if not match:
        return None
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None
    if not isinstance(data, list) or len(data) != expected:
        return None
    titles = [_clean_title(str(t)) for t in data]
    return titles if all(titles) else None


async def _name_all_clusters(groups: List[List[Article]], llm_provider: str) -> List[str]:
    """
    Nomme tous les clusters en UN SEUL appel LLM : le modèle voit tous les
    groupes à la fois, ce qui garantit des titres différenciés. Repli sur un
    titre par défaut (sujet/titre de l'article le plus pertinent) si échec.
    """
    groupes_str = "\n\n".join(_format_group(i, g) for i, g in enumerate(groups, start=1))
    chain = ChatPromptTemplate.from_template(_NAMING_PROMPT) | get_llm(llm_provider) | StrOutputParser()
    try:
        raw = await chain.ainvoke({"n": len(groups), "groupes": groupes_str})
        titles = _parse_title_list(raw, len(groups))
        if titles:
            return titles
        print("  [WARN] réponse de nommage inexploitable → titres de repli.")
    except Exception as e:  # noqa: BLE001 — le nommage ne doit pas casser le clustering
        print(f"  [WARN] nommage groupé échoué ({e}) → titres de repli.")
    return [_fallback_title(g) for g in groups]


# --- Orchestrateur ----------------------------------------------------------

async def cluster_articles_for_veille(
    db: AsyncSession,
    veille_id: int,
    llm_provider: str = "deepseek",
) -> Dict[str, Any]:
    """
    Clusterise les articles d'une veille. Idempotent : un re-run purge les
    clusters non publiés de la veille avant de recalculer.

    Retourne un résumé : clusters créés, articles clusterisés / isolés.
    """
    print(f"--- Clustering v2 : veille {veille_id} (LLM: {llm_provider}) ---")

    # 1. Ardoise propre : purge des clusters non publiés de cette veille.
    purged = await crud_cluster.purge_unpublished_for_veille(db, veille_id)
    if purged:
        print(f"  {purged} cluster(s) non publié(s) purgé(s) avant recalcul.")

    def _empty(reason: str, isoles: int = 0) -> Dict[str, Any]:
        print(f"  {reason}")
        return {
            "veille_id": veille_id,
            "clusters_crees": 0,
            "articles_clusterises": 0,
            "articles_isoles": isoles,
        }

    # 2. Articles éligibles (PROCESSED, analysés, sans cluster).
    articles = await crud_article.get_clusterable_articles(db, veille_id)
    if len(articles) < settings.MIN_CLUSTER_SIZE:
        return _empty(f"{len(articles)} article(s) à clusteriser — insuffisant.", len(articles))

    # 3. Vecteurs depuis Qdrant, appariés aux articles par id.
    vec_rows = await scroll_by_veille(veille_id)
    vec_by_id = {aid: vec for aid, vec, _ in vec_rows if vec}
    pairs = [(a, vec_by_id[a.id]) for a in articles if a.id in vec_by_id]
    missing = len(articles) - len(pairs)
    if missing:
        print(f"  [WARN] {missing} article(s) sans vecteur Qdrant — ignorés.")
    if len(pairs) < settings.MIN_CLUSTER_SIZE:
        return _empty(f"Trop peu d'articles vectorisés ({len(pairs)}).", len(pairs))

    # Re-clustering : on remet à zéro le cluster_id Qdrant de tous les candidats.
    # Les clusters assignés ci-dessous le repositionnent ; les articles qui
    # restent isolés conservent ainsi un cluster_id nul (pas de valeur obsolète).
    try:
        await clear_cluster_for_articles([a.id for a, _ in pairs])
    except Exception as e:  # noqa: BLE001 — Qdrant down ne doit pas casser le clustering
        print(f"  [WARN] reset des cluster_id Qdrant échoué : {e}")

    # 4. Regroupement agglomératif sur les vecteurs.
    labels = await asyncio.to_thread(
        _agglomerative_labels,
        [vec for _, vec in pairs],
        settings.CLUSTER_SIM_THRESHOLD,
    )
    groups: Dict[int, List[Article]] = defaultdict(list)
    for (article, _), label in zip(pairs, labels):
        groups[label].append(article)

    # 5. Filtre MIN_CLUSTER_SIZE + cap CLUSTER_MAX_SIZE (top-N par pertinence).
    final_groups: List[List[Article]] = []
    isoles = 0
    for arts in groups.values():
        if len(arts) < settings.MIN_CLUSTER_SIZE:
            isoles += len(arts)  # article isolé → reste cluster_id NULL
            continue
        ranked = sorted(arts, key=lambda a: (_article_score(a), a.id), reverse=True)
        kept = ranked[: settings.CLUSTER_MAX_SIZE]
        isoles += len(ranked) - len(kept)  # surplus au-delà du cap
        final_groups.append(kept)

    if not final_groups:
        return _empty("Aucun groupe n'atteint MIN_CLUSTER_SIZE.", isoles)

    print(f"  {len(final_groups)} cluster(s) détecté(s), {isoles} article(s) isolé(s).")

    # 6. Nommage LLM (parallèle).
    titles = await _name_all_clusters(final_groups, llm_provider)

    # 7. Persistance Postgres + Qdrant.
    clusters_crees = 0
    articles_clusterises = 0
    for arts, title in zip(final_groups, titles):
        cluster = await crud_cluster.create(db, ClusterCreate(title=title))
        ids = [a.id for a in arts]
        await crud_article.assign_cluster(db, ids, cluster.id)
        try:
            await set_cluster_for_articles(ids, cluster.id)
        except Exception as e:  # noqa: BLE001 — Qdrant down ne doit pas casser le clustering DB
            print(f"  [WARN] sync Qdrant du cluster {cluster.id} échouée : {e}")
        clusters_crees += 1
        articles_clusterises += len(ids)
        print(f"  Cluster #{cluster.id} « {title[:60]} » — {len(ids)} articles")

    # 8. Nettoyage des clusters devenus vides.
    await crud_cluster.delete_empty_clusters(db)

    summary = {
        "veille_id": veille_id,
        "clusters_crees": clusters_crees,
        "articles_clusterises": articles_clusterises,
        "articles_isoles": isoles,
    }
    print(f"--- Clustering v2 terminé : {summary} ---")
    return summary

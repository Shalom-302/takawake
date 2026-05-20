# Tekawake — Suivi du projet & versions

> Journal des évolutions, décisions techniques et feuille de route.
>
> Pour **comment le projet fonctionne** (architecture, pipeline, fichiers) → voir **`DESCRIPTION.md`**.
>
> Projet démarré le 2026-05-17.

---

## Journal des versions

### 2026-05-20 — Phase 2 backend : clustering v2, catégories, site public

**Scraping & embeddings**
- Scraping asynchrone (`httpx` + `asyncio.gather`), concurrence listings / fetch / LLM.
  Workflow passé de ~30 min à quelques minutes.
- Embeddings basculés sur `sentence-transformers/multilingual-e5-base` (768 dim, CPU, gratuit).
- Qdrant : instance distante partagée (`qdrant-client.kortexai.dev`), collection
  `tekawake_articles`. Les vecteurs sont écrits en fin de veille (étape `index`).

**Clustering v2** — nouveau `app/services/clustering.py`
- Regroupement `AgglomerativeClustering` (distance cosinus) sur les vecteurs —
  déterministe, par veille.
- Cap 10 articles/cluster (top par `score_pertinence`), partition stricte.
- Nommage + catégorisation par le LLM en **un seul appel** pour tous les clusters.
- Re-run idempotent : purge des clusters non publiés, les publiés sont préservés.
- Endpoint `POST /clusters/backfill-assign?veille_id=N` (rétro-compatible).

**Catégories**
- Modèle « taxonomie fixe + suggestion LLM » : l'éditeur gère ~6-10 catégories ;
  le LLM range chaque cluster dans la meilleure (même appel que le nommage) ;
  corrigeable via `PATCH /clusters/{id}`.
- Backend câblé ; 6 catégories de départ semées.

**Qdrant & robustesse**
- Suppression de veille → purge aussi les vecteurs Qdrant (`delete_vectors_for_veille`).
- Router d'inspection `GET /qdrant/collections[/{nom}]` (visible dans Swagger).

**Frontend**
- Dashboard admin revu et aligné sur le backend (types `veille.service.ts`,
  affichage catégorie + LLM provider).
- Site public confirmé branché (hero, content, topic, article — vraies données).
- Bouton Publier / Dépublier sur le détail cluster du dashboard.

**Bugs corrigés**
- `MissingGreenlet` (HTTP 500 sur `GET /clusters/{id}`) — `selectinload` manquant.
- Clusters orphelins vides jamais nettoyés.
- `cluster_id` Qdrant obsolètes après un re-clustering.

**Décisions techniques**
- Agglomératif plutôt que HDBSCAN (HDBSCAN génère trop de « bruit » sur petit volume).
- Clustering par veille ; catégories globales et stables.
- `CLUSTER_SIM_THRESHOLD = 0.86`, calé empiriquement (38 articles → 8 clusters,
  33 clusterisés, 5 isolés). À re-vérifier si le volume change beaucoup.
- Nommage groupé en 1 appel (le nommage cluster-par-cluster produisait des titres
  génériques quasi identiques).

### 2026-05-18 — Phase 1 : stabilisation

- Désalignement client / backend résolu ; `veille.service.ts` réécrit (types miroir
  des schémas Pydantic, hooks SWR, mutations).
- Dashboard admin (`/dashboard`) entièrement branché sur les vraies données + KPIs.
- 5 endpoints destructifs sécurisés `require_superuser`.
- Endpoints `/count` ajoutés. Dead-code supprimé (`veille_service.py`, `crud/veille.py`).

### 2026-05-17 — Audit initial

- Audit fullstack (backend FastAPI/Celery + client Next.js) : état des lieux,
  identification des écarts client/backend, plan d'action en 3 phases.

---

## Roadmap

### Court terme — avant la démo
- Dashboard : sélecteur de catégorie sur le détail cluster (corriger la suggestion LLM).
- Site public : alimenter les sections *Vidéos / Étoiles / Tendances* (aujourd'hui
  masquées tant qu'il y a peu de clusters publiés).
- Nettoyage repo + Dockerfile prod (voir « Dette technique »).

### Phase 2 — Optimisation du scraping (partiellement faite)

Fait : async, Qdrant + embeddings, clustering v2. Reste :
- **Fan-out Celery par article** — `chord(group(...))`, retry granulaire, observabilité (Flower).
- **RSS / sitemaps comme source primaire** — plus stable que parser le HTML.
- **Déduplication avant LLM** — normaliser l'URL, écarter les doublons avant l'analyse.
- **Cache HTTP + cache LLM** — ETag par source ; `llm_cache(content_hash, analysis)`.
- **Celery beat** — scraping continu, recluster incrémental.
- **Score domaine + fraîcheur** ; **Playwright** pour les sites en JS.

### Phase 3 — Idées « version boss »

À piocher (3-4 max) :
1. Dashboard temps réel (WebSocket, progression de veille).
2. Image de slide auto-générée (DALL-E / SDXL).
3. Recherche sémantique (réutilise les vecteurs Qdrant).
4. Newsletter PDF auto (Celery beat).
5. Partage social one-click.
6. Carte d'Afrique heatmap (`impact_afrique` par pays).
7. Mode présentation plein-écran + TTS.
8. Comparateur de tendances (volume par cluster sur 30 j).
9. Score d'intégrité source.
10. Annotations collaboratives sur un cluster.

---

## Dette technique / à régler avant prod

- Sortir `.env`, `dev.db`, `tests.db` du dépôt (`git rm --cached`, ajouter à `.gitignore`).
- **Révoquer le token LangSmith** exposé en clair dans `.env`.
- Retirer `--reload` du `CMD` du Dockerfile de prod.

### Dockerfile prod recommandé

```dockerfile
# syntax=docker/dockerfile:1.7
FROM python:3.11-slim AS builder
WORKDIR /app
RUN pip install --upgrade pip
COPY requirements.txt install_plugin_requirements.py ./
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    PYTHONPATH=/install/lib/python3.11/site-packages \
    python install_plugin_requirements.py

FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONPATH=/app
COPY --from=builder /install /usr/local
COPY . .
EXPOSE 8001
# PROD : pas de --reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

Notes : `--reload` retiré · pas de `build-essential` (toutes les deps ont des wheels) ·
cache mount BuildKit · pour le compose dev, override la commande avec `--reload`.

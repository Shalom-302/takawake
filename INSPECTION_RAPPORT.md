# Rapport d'inspection — Tekawake Plateforme

> Audit fullstack (backend FastAPI/Celery + client Next.js) avec focus cohérence client↔backend, scalabilité du scraping, et roadmap "version boss".
>
> Date initiale : 2026-05-17
> Mise à jour : 2026-05-18 (Phase 1 stabilisation terminée)
> Mise à jour : 2026-05-20 (Phase 2 — async + Qdrant + clustering v2 livrés)

---

## 0. Statut actuel — TL;DR

✅ **Phase 1 (Stabilisation) — TERMINÉE**
- Désalignement client/backend résolu, types miroirs stricts
- Dashboard admin (`/dashboard`) entièrement branché sur les vraies données
- 5 endpoints destructifs sécurisés `require_superuser`
- Dead-code supprimé
- Endpoints `/count` ajoutés pour KPIs

⚠️ **Reste pour la démo boss**
- **Site public (`/`, `/topic/*`) encore 100% mock** — c'est ce que verra l'utilisateur final
- Mécanisme de publication des clusters (toggle `is_published` depuis le dashboard)
- Catégories : design décidé (taxonomie fixe + suggestion LLM, cf. §3.C) — reste à câbler
- Dockerfile prod (`--reload` à retirer)

🚀 **Phase 2 (Optimisation scraping) — EN COURS**
- ✅ Async + concurrence scraping/LLM (cf. §C1)
- ✅ Qdrant + embeddings e5-base + clustering v2 agglomératif (cf. §C0)
- ⏳ RSS source primaire, fan-out Celery, dédup, cache — non démarrés

---

## 1. Architecture observée

### Backend (`/backend`)
- **Stack** : FastAPI + Celery + LangGraph + DeepSeek + SQLAlchemy async + Alembic
- **Routers business** (montés sous `/api`) :
  - `app/routers/veille.py` → `POST /veille/run` (🔒 superuser), `GET /veille/`, `GET /veille/count`, `GET /veille/{id}`, `DELETE /veille/{id}`
  - `app/routers/cluster.py` → `GET /clusters/`, `GET /clusters/count`, `GET /clusters/all-with-pertinences`, `GET /clusters/{id}`, `PATCH /clusters/{id}`, `DELETE /clusters/{id}`, `GET /clusters/{id}/summary`, `GET /clusters/{id}/slides`, `GET /clusters/{id}/image[s]`, `POST /clusters/backfill-assign` (🔒), `POST /clusters/{id}/generate-content` (🔒)
  - `app/routers/article.py` → CRUD complet + `GET /articles/count` + `DELETE /articles/all` (🔒)
  - `app/routers/category.py` → CRUD catégories
  - `app/routers/qdrant.py` → `GET /qdrant/collections`, `GET /qdrant/collections/{name}` (inspection vectorielle depuis Swagger)
  - `app/routers/migrations.py` → `GET /changes` (🔒), `POST /apply` (🔒)
- **Modèles** : `Veille` 1-N `Article`, `Cluster` 1-N `Article`, `Category` 1-N `Cluster`
- **Tâches Celery** : `run_veille_workflow_task`, `run_full_backfill_task`, `generate_cluster_content_task`
- **Scrapers** (`app/services/tekawake.py`) : Techmeme, TechCabal, TechPoint Africa, Disrupt Africa, WeeTracker
- **LLM** : DeepSeek-chat (température 0)

### Client (`/client`)
- **Stack** : Next.js 15 + SWR + axios + Tailwind + react-hook-form + zod
- **Service API** : `lib/api/veille.service.ts` (réécrit, types miroir stricts)
- **baseURL** : `process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"` (dev local) — pour prod : poser `NEXT_PUBLIC_API_URL=https://scrapy.kaanari.com/api`

#### Routes Next.js

| Route | Statut | Description |
|---|---|---|
| `/` | ❌ Mock | Landing publique (HeroSection + ContentSection) |
| `/topic/one/[topic_id]` | ❌ Mock | Page catégorie/sujet (Topic) |
| `/topic/article/[article_id]` | ❌ Mock | Page article public (Article) |
| `/dashboard` | ✅ Branché | Home admin avec KPIs + listes récentes |
| `/dashboard/topics` | ✅ Branché | Sidebar liste clusters + "Sélectionnez un sujet" |
| `/dashboard/topics/[topic_id]` | ✅ Branché | Détail cluster (summary + slides + articles sources) |
| `/dashboard/scraping-articles` | ✅ Branché | Liste articles avec filtre statut |
| `/dashboard/scraping-articles/one/[article_id]` | ✅ Branché | Détail article + analyse LLM |
| `/dashboard/tech-monitoring` | ✅ Branché | Liste veilles + dialog "Nouvelle veille" |
| `/dashboard/tech-monitoring/one/[tech_id]` | ✅ Branché | Détail veille + articles + KPIs |
| `/dashboard/categories` | ✅ Branché | Liste + création + suppression catégories |

---

## 2. Phase 1 — Stabilisation ✅ TERMINÉE (2026-05-18)

### Backend
- ✅ `require_superuser` (`Depends`) sur 5 endpoints destructifs : `DELETE /articles/all`, `POST /veille/run`, `POST /clusters/backfill-assign`, `POST /clusters/{id}/generate-content`, `GET /migrations/changes`
- ✅ Dead-code supprimé : `app/services/veille_service.py` + `app/crud/veille.py`
- ✅ `GET /veille/count`, `GET /clusters/count`, `GET /articles/count` ajoutés (filtres `is_published`, `status`, `score_min`, etc.) avec `select(func.count())` direct
- ✅ `crud_veille.get_all` trie maintenant par `created_at DESC` (avant : ordre indéfini)

### Frontend — service
- ✅ `lib/api/veille.service.ts` réécrit intégralement (types Pydantic miroir, hooks SWR, mutations axios)
- ✅ `lib/api/axios-client.ts` : `baseURL` via `NEXT_PUBLIC_API_URL`
- ✅ Hooks ajoutés : `useClusters`, `useClusterDetail`, `useClusterSummary`, `useClusterSlides`, `useClusterImage(s)`, `useArticles`, `useArticle`, `useVeilles`, `useVeille`, `useCategories`, `useCategory`
- ✅ Hooks counts : `useVeillesCount`, `useClustersCount(opts)`, `useArticlesCount(opts)`
- ✅ Mutations : `runVeille`, `runBackfill`, `generateClusterContent`, `updateCluster`, `deleteCluster`, `updateArticle`, `deleteArticle`, `deleteAllArticles`, `deleteVeille`, `createCategory`, `updateCategory`, `deleteCategory`

### Frontend — pages admin
- ✅ `topics/layout.tsx` réécrit (sidebar avec `cluster.title` + `cluster.id` + badge brouillon, fix des liens `/undefined`)
- ✅ `topics/page.tsx` simplifié (placeholder "Sélectionnez un sujet")
- ✅ `topic-content.tsx` : `useClusterDetail` + `useClusterImage` (hero + summary + slides + sources réelles)
- ✅ `all-scraping-articles.tsx` : `useArticles` + filtres statut (Complets par défaut)
- ✅ `one-article.tsx` : `useArticle(id)` + grille analyse LLM (impact / problématique / opportunité / leçon)
- ✅ `all-monitoring.tsx` : `useVeilles` + Dialog contrôlé branché sur `runVeille()`
- ✅ `one-monitoring.tsx` : `useVeille(id)` + `useArticles({veille_id})` + KPIs calculés
- ✅ `all-categories.tsx` : `useCategories` + create dialog + delete
- ✅ `dashboard-home.tsx` (nouveau) : 4 KPIs (vrais counts) + 3 listes récentes

### Sécurité / infra (encore à faire — voir §3)
- ❌ `.env`, `dev.db`, `tests.db` toujours dans le repo
- ❌ Token LangSmith committé dans `.env` (`lsv2_pt_...`) — à révoquer
- ❌ `--reload` toujours dans le CMD du Dockerfile

---

## 3. Reste pour la démo boss (priorité 🔴)

### A. Brancher le site public — **bloquant pour la démo**

**Le boss verra `localhost:3000/` (ou `tekawake.com`), pas `/dashboard`.** Aujourd'hui :
- `client/src/components/sections/landing/hero.tsx` — Lorem ipsum, "Il y 28 minutes", liens hardcodés vers `lorem-ipsum-lodor-sit-amet`
- `client/src/components/sections/landing/content.tsx` — 4 sections mock (Chroniques, Tribune, Vidéos, Étoiles d'Afrique, En tendance) → `Array.from({length: N})` partout
- `client/src/components/sections/topic/topic.tsx` — "Robotique" en dur, 5 articles mock
- `client/src/components/sections/topic/article.tsx` — "content here" en dur, badges Lorem

**Actions** :
1. Réécrire `hero.tsx` :
   - Article hero à droite = dernier cluster publié (`useClusters({is_published: true, limit: 1})`)
   - Liste "Les récents sujets" à gauche = 2 clusters publiés suivants
2. Réécrire `content.tsx` :
   - Section "Chroniques" = clusters publiés récents (1 grand + 4 secondaires)
   - Section "Tribune" = 4 clusters publiés filtrés par catégorie spécifique (ex: "Opinion")
   - Sections "Vidéos" + "Étoiles d'Afrique" + "En tendance" = clusters publiés (groupés autrement) OU à masquer/marquer "coming soon" si pas de donnée correspondante
3. Réécrire `topic.tsx` (`/topic/one/[topic_id]`) :
   - `[topic_id]` représente une **catégorie** (slug ou id) → `useCategories` + cluster filter `category_id`
   - OU on transforme cette page en alias de `/cluster/[id]` (un sujet = un cluster)
   - **Décision à prendre** : `/topic/one/{cat_id}` agrège des clusters par catégorie, OU `/topic/one/{cluster_id}` montre le contenu d'un cluster (= ce que fait `/dashboard/topics/[id]` mais en version publique sans sidebar admin)
4. Réécrire `article.tsx` (`/topic/article/[article_id]`) :
   - `useArticle(id)` pour le contenu
   - OU on supprime ce niveau (un "article public" = un cluster) — à clarifier vu la structure backend (cluster = sujet, article = source)
5. Composant `LikeCommentSaveBar` actuellement décoratif (`like={123}` en dur) → soit on construit un système like/comment (lourd), soit on masque le composant pour la démo

**Question structurelle** : qu'est-ce qu'un "article" pour l'utilisateur public ?
- (A) **Un cluster** (sujet généré : titre = question, summary_article + slides + sources). C'est ce qui a du contenu narratif éditorialisé. → `/topic/article/[cluster_id]` afficherait le cluster.
- (B) **Un article source** (Article DB : titre brut + URL externe). Pas adapté à un "média" public — c'est plutôt une bibliothèque de sources.

Recommandation : **option A**. Le site public ne sert que des clusters (`is_published=true`). Le terme "article" côté URL devient un cluster. Côté backend rien ne change.

### B. Mécanisme de publication

Aujourd'hui un cluster est créé `is_published=False`. Personne ne peut le faire passer à `True` depuis l'UI.

**Actions** :
1. Sur `/dashboard/topics/[id]` : ajouter un bouton "Publier" / "Dépublier" qui appelle `updateCluster(id, {is_published: !current})` (mutation déjà existante dans le service)
2. Sur `/dashboard/topics` (sidebar) : déjà un badge "Brouillon"/"Publié" — ajouter un click handler ou un menu contextuel pour toggle rapide
3. Sur `/dashboard/topics/[id]` : pouvoir éditer le titre du cluster et l'assigner à une catégorie (`category_id`) via le même `updateCluster`

### C. Catégorisation — design décidé (2026-05-20)

Les catégories (`Category 1-N Cluster`) sont un niveau **au-dessus** des clusters : thème éditorial large, **stable**, **transverse aux veilles** (sert la navigation du site public). Les clusters sont par-veille et recalculés ; les catégories ne doivent pas dériver — ce qui écarte les "catégories émergentes recalculées".

**Approche retenue : taxonomie fixe + suggestion LLM.**
1. L'éditeur définit une fois ~6-10 catégories via le CRUD existant (`/dashboard/categories`). Globales, stables.
2. Au clustering, le LLM range chaque nouveau cluster dans la meilleure catégorie existante — **dans le même appel LLM que le nommage** (le prompt liste les catégories disponibles). Le résultat est posé comme `category_id` (une suggestion).
3. L'éditeur peut corriger `category_id` dans le dashboard avant publication (`PATCH /clusters/{id}`).
4. Si aucune catégorie n'existe → `category_id = NULL`, assignation 100% manuelle.
5. Re-clustering : la suggestion est refaite à chaque backfill ; un cluster publié garde sa catégorie validée par l'humain.

**Reste à câbler** :
1. Backend : `clustering.py` charge les catégories existantes et le prompt de nommage renvoie aussi la catégorie ; `category_id` posé à la création du cluster. (Option : sync `category_id` vers le payload Qdrant — l'index payload existe déjà.)
2. UI dashboard `/dashboard/topics/[id]` : sélecteur de catégorie (override de la suggestion).
3. Site public : navigation top par catégorie (ex: `Fintech / IA / Cybersécurité`).

### D. Nettoyage repo (avant push public)
- `.env` à retirer du tracking : `git rm --cached backend/.env` + ajouter `.env` à `.gitignore`
- `dev.db`, `tests.db` idem
- **Révoquer le token LangSmith** sur smith.langchain.com (key `lsv2_pt_479ad9d1be514b7f98bf190c02b3a5fc_...` exposée)
- Si déjà push : BFG ou `git filter-repo` pour nettoyer l'historique

### E. Dockerfile prod
- Retirer `--reload` du `CMD` (encore présent) → cher en RAM et instable en prod
- Dockerfile actuel ré-installe `build-essential` inutilement (toutes les deps ont des wheels) → cf. §6 pour la version slim recommandée

---

## 4. Phase 2 — Optimiser le scraping (1-2 semaines)

### §C0. Qdrant + embeddings + clustering v2 — ✅ LIVRÉ (2026-05-20)

**Qdrant** : finalement **instance distante partagée** (`https://qdrant-client.kortexai.dev`, collection `tekawake_articles`) plutôt que self-hosted — réutilise l'infra interne existante. Workaround port HTTPS dans `qdrant_service.py` (qdrant-client 1.18 ignore le scheme dans `url=`).

**Embeddings** : choix (c) retenu — `sentence-transformers/multilingual-e5-base` (768-dim, local CPU, gratuit, multilingue FR/EN). Modèle ~1 Go en cache `HF_HOME` (volume monté). Texte embeddé = `titre + resume_neutre + problematique_africaine`.

**Pipeline réel** :
1. **Workflow de veille** (LangGraph) : `scrape → fetch → analyze → index`. L'étape `index` embed les articles PROCESSED et upsert les vecteurs dans Qdrant (payload : `veille_id`, `cluster_id`, `title`, `source_*`, `score_pertinence`, `created_at`). → Qdrant est **rempli pendant la veille**, pas au backfill.
2. **Backfill clustering** (`app/services/clustering.py`, **par veille**) : lit les vecteurs (`scroll_by_veille`) → `AgglomerativeClustering` (cosine, average linkage, seuil `CLUSTER_SIM_THRESHOLD=0.86`) → cap 10 articles/cluster (top par `score_pertinence`) → le LLM nomme **tous les clusters en un seul appel** (titres différenciés) → persistance Postgres + sync Qdrant.
3. **Re-run idempotent** : purge des clusters non publiés de la veille ; les clusters publiés (validés humain) sont préservés.

**Décisions** : agglomératif (pas HDBSCAN — trop de "bruit" sur petit volume) ; clustering par veille ; 1 article = 1 cluster (partition stricte) ; nommage en 1 appel LLM groupé (le nommage cluster-par-cluster produisait des titres génériques quasi identiques).

**Endpoint** : `POST /clusters/backfill-assign?veille_id=N` — rétro-compatible (sans `veille_id` → toutes les veilles).

**Bugs corrigés au passage** : `MissingGreenlet` (HTTP 500 sur `GET /clusters/{id}` — `selectinload` manquant sur `Article.veille`/`Cluster.category`) ; clusters orphelins vides jamais nettoyés ; `cluster_id` Qdrant obsolètes après re-clustering.

**Suppression de veille** : `DELETE /veille/{id}` nettoie désormais Postgres (articles via cascade + clusters devenus vides) **et** les vecteurs Qdrant de la veille (`delete_vectors_for_veille`, filtre sur `veille_id`) — plus de points orphelins.

**Tuning** : seuil 0.86 calé empiriquement sur la veille 15 (38 articles → 8 clusters, 33 clusterisés, 5 isolés). À re-vérifier si le volume d'articles change beaucoup.

**Bénéfices constatés** : coût LLM clustering réduit (1 appel groupé au lieu d'un méga-prompt) ; clusters déterministes et reproductibles ; plus de JSON fragile à parser ; base prête pour la recherche sémantique (Phase 3).

### §C1. Asynchronisation — ✅ LIVRÉ
- `requests.get` remplacé par `httpx.AsyncClient` + `asyncio.gather`
- Concurrence scraping (`LISTING_CONCURRENCY=5`, `FETCH_CONCURRENCY=20`) et LLM (`LLM_CONCURRENCY=8`)
- Workflow passé de ~30 min à quelques minutes

### §C3. Fan-out Celery par article
- `chord(group(analyze_article_task.s(id) for id in ids))(consolidate.s(veille_id))`
- Retry granulaire + scaling horizontal + observabilité par article (Flower)

### §C4. RSS / sitemaps comme source primaire
- Plus stable que parser HTML (qui change tous les mois)
- Node `rss_dispatcher` avant `scraper_dispatcher`, fallback HTML
- Élimine -90% des échecs silencieux lors d'un refonte de template

### §C5. Déduplication AVANT LLM
- Normaliser URL (strip `utm_*`, fragments, lower-case) puis `SELECT ... WHERE source_url IN (...)` avant la boucle LLM
- Économie 30-70% selon chevauchement

### §C6. Cache HTTP + Cache LLM
- ETag / Last-Modified par source
- `llm_cache (content_hash, analysis_json)` pour éviter de re-payer une analyse identique

### §C7. Celery beat (scraping continu)
- Tâche `run_continuous_scraping` toutes les heures
- Ne stocke que les nouveautés, recluster incrémental

### §C8. Score domaine + freshness
- Score `score_pertinence` LLM + bonus domaine + bonus fraîcheur + bonus mots-clés Afrique

### §C9. Playwright pour les sites JS
- Déjà dans `requirements.txt` mais inutilisé
- Fallback ciblé (Disrupt Africa notamment)

---

## 5. Phase 3 — Version "boss" (2-3 semaines)

Idées qui font la différence en démo. Piocher 3-4 max.

1. **Dashboard temps réel** — WebSocket pour suivre une veille en cours (progress bar par site, par article). Backend a déjà `ws_server.py` + `messaging_service` à réutiliser.
2. **Image de slide auto-générée** — DALL-E / SDXL ou fond Lottie animé. Aujourd'hui `bg-black`.
3. **Recherche sémantique** — réutilise les embeddings Qdrant de §C0 (recherche full-text + similarité vectorielle dans une seule UI).
4. **Newsletter PDF auto** — Cron Celery beat → résumé hebdo des 3 top clusters par email.
5. **Partage social one-click** — "Publier les 10 slides sur LinkedIn / X" (plugin `social_subscriptions` déjà en place).
6. **Carte d'Afrique heatmap** — visualise `impact_afrique` par pays mentionné.
7. **Mode présentation plein-écran** — défilement automatique top 5 clusters + TTS narration.
8. **Comparateur de tendances** — graph volume articles par cluster sur 30 jours.
9. **Score d'intégrité source** — badge fiabilité par domaine (table `source_trust`).
10. **Annotations collaboratives** — commentaires/notes internes sur un cluster.

---

## 6. Dockerfile prod (à appliquer)

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

Notes :
- `--reload` retiré
- Pas de `build-essential` (toutes les deps ont des wheels)
- Cache mount BuildKit
- Pour le compose dev, override la commande avec `--reload` si besoin

---

## 7. Récapitulatif visuel — Roadmap

```
PHASE 1 ✅ DONE              RESTE POUR BOSS              PHASE 2 (en cours)            PHASE 3
─────────────                ────────────────             ──────────────────            ──────────
✅ Aligner API/types         🔴 Brancher site public      ✅ Qdrant + embeddings        🎯 WebSocket temps réel
✅ Brancher dashboard SWR    🔴 Mécanisme publication     ✅ Clustering v2 agglo.       🎯 Image slide IA
✅ Supprimer mort-code       🔴 Catégorisation UI         ✅ Async + gather             🎯 Recherche sémantique
✅ Auth admin (5 endpoints)  🟠 Nettoyer .env / .db       ✅ Concurrence LLM            🎯 Newsletter PDF
✅ Endpoints /count          🟠 Révoquer LangSmith        ⏳ Fan-out Celery             🎯 Carte Afrique heatmap
✅ Sidebar topics fix        🟠 Dockerfile prod           ⏳ RSS / sitemaps             🎯 Mode présentation TTS
✅ Filtre statut articles                                 ⏳ Dédup avant LLM            🎯 Annotations cluster
✅ KPIs dashboard                                         ⏳ Celery beat + Cache
```

**Ordre recommandé avant démo boss** :
1. Brancher site public (1-2 j) — §3.A
2. Bouton "Publier" sur cluster (2 h) — §3.B
3. Nettoyage repo + token (1 h) — §3.D
4. Dockerfile prod (30 min) — §3.E
5. Déployer

Phase 2 (Qdrant + async) peut attendre la post-démo si nécessaire — le boss verra déjà un produit fonctionnel.

# Tekawake — Description du projet

> Documentation d'architecture. Décrit **ce que fait la plateforme**, **étape par étape**,
> et **les fichiers impliqués** à chaque étape. Destinée à toute personne qui reprend
> ou maintient le projet.
>
> Dernière mise à jour : 2026-05-20

---

## 1. Le projet en deux phrases

Tekawake est une **plateforme média de veille tech sur l'Afrique**. Elle scrape
automatiquement l'actualité tech, l'analyse avec un LLM, regroupe les articles par
thème, génère du contenu éditorial (résumé + slides), et le publie sur un site public.

Deux faces :
- **Dashboard admin** (`/dashboard`) — piloter les veilles, relire, catégoriser, publier.
- **Site public** (`/`) — le média que voit le visiteur, alimenté par les clusters publiés.

---

## 2. Stack technique

**Backend** — FastAPI · Celery (tâches de fond) · LangGraph (workflow de veille) ·
SQLAlchemy async + PostgreSQL · Qdrant (base vectorielle distante) ·
sentence-transformers (embeddings) · LLM au choix (DeepSeek / OpenAI / Anthropic).

**Frontend** — Next.js 15 (App Router) · SWR · axios · Tailwind.

---

## 3. Les 3 entités — à comprendre en premier

```
Catégorie   →  regroupe des CLUSTERS    (thème large, STABLE : « Cybersécurité »)
   └─ Cluster   →  regroupe des ARTICLES   (sujet précis = une question)
        └─ Article  →  une source scrapée   (1 URL)
```

- **Article** — une source brute scrapée + son analyse LLM (12 champs : impact, score,
  résumé, problématique…).
- **Cluster** — un groupe d'articles qui parlent du même sujet. Son titre est une
  question. **Recalculé** à chaque backfill.
- **Catégorie** — un thème éditorial large qui regroupe plusieurs clusters.
  **Stable**, géré à la main (taxonomie fixe). Sert la navigation du site public.

---

## 4. Le pipeline — 3 tâches Celery + la publication

### Étape 1 — La veille (scraping → analyse → vectorisation)

**Ce qu'elle fait** : un workflow LangGraph en 4 nœuds : `scrape → fetch → analyze → index`.
- `scrape` — trouve les listes d'articles (Techmeme, TechCabal, TechPoint…).
- `fetch` — télécharge le contenu de chaque article (httpx + trafilatura).
- `analyze` — le LLM analyse chaque article → JSON `analysis` → **écrit dans PostgreSQL**.
- `index` — fabrique le vecteur (titre + résumé + problématique) → **écrit dans Qdrant**.

**Déclenchement** : `POST /veille/run?query=...` → tâche Celery `run_veille_workflow_task`.

**Fichiers** :
| Fichier | Rôle |
|---|---|
| `app/services/tekawake.py` | Scrapers + définition du workflow LangGraph |
| `app/services/embeddings.py` | Vectorisation via sentence-transformers (`multilingual-e5-base`) |
| `app/services/qdrant_service.py` | Upsert des vecteurs dans Qdrant |
| `app/services/llm_factory.py` | Fabrique le ChatModel LLM (deepseek/openai/anthropic) |
| `app/tasks/veille_tasks.py` | Tâche Celery `run_veille_workflow_task` |
| `app/routers/veille.py` | Endpoint `POST /veille/run` |

**Sortie** : PostgreSQL (articles + `analysis`) **et** Qdrant (1 vecteur 768-dim par article).

### Étape 2 — Le backfill (clustering)

**Ce qu'elle fait** : regroupe les articles d'une veille par similarité, puis nomme
et catégorise chaque groupe.
1. Sort les vecteurs de Qdrant (`scroll_by_veille`).
2. **scikit-learn** : `AgglomerativeClustering` (distance cosinus, seuil
   `CLUSTER_SIM_THRESHOLD`) → partition stricte (1 article = 1 groupe).
3. Cap de 10 articles/cluster (on garde le top par `score_pertinence`).
4. Le **LLM nomme + catégorise** tous les clusters en **un seul appel** (il reçoit un
   échantillon de titres + problématiques par groupe, pas les vecteurs).
5. Écrit `cluster_id` + `category_id` dans PostgreSQL et synchronise Qdrant.
6. Sous-étape « pertinence » : le LLM génère une justification par article.

**Déclenchement** : `POST /clusters/backfill-assign?veille_id=N` → `run_full_backfill_task`.

**Fichiers** :
| Fichier | Rôle |
|---|---|
| `app/services/clustering.py` | Cœur du clustering v2 : regroupement + nommage + catégorisation |
| `app/services/qdrant_service.py` | `scroll_by_veille`, `set_cluster_for_articles` |
| `app/services/tekawake.py` | `backfill_clusters_service`, `backfill_pertinence_service` |
| `app/crud/crud_cluster.py` | Création des clusters, purge, nettoyage des vides |
| `app/crud/crud_article.py` | Sélection des articles à clusteriser, rattachement |
| `app/crud/crud_category.py` | Lecture de la taxonomie de catégories |
| `app/tasks/veille_tasks.py` | Tâche Celery `run_full_backfill_task` |
| `app/routers/cluster.py` | Endpoint `POST /clusters/backfill-assign` |

**Sortie** : PostgreSQL (`cluster_id`, `category_id`, `pertinence_cluster`).

### Étape 3 — Génération de contenu

**Ce qu'elle fait** : pour un cluster donné, le LLM génère l'**article de synthèse**
(`summary_article`) puis le **carrousel de slides**.

**Déclenchement** : `POST /clusters/{id}/generate-content` → `generate_cluster_content_task`.

**Fichiers** :
| Fichier | Rôle |
|---|---|
| `app/services/tekawake.py` | `generate_cluster_content_service` + génération article & slides |
| `app/tasks/veille_tasks.py` | Tâche Celery `generate_cluster_content_task` |
| `app/routers/cluster.py` | Endpoint `POST /clusters/{id}/generate-content` |

**Sortie** : PostgreSQL (`summary_article`, `slides`).

### Étape 4 — Publication

**Ce qu'elle fait** : l'éditeur relit un cluster et le passe à `is_published = true`.
Le site public n'affiche **que** les clusters publiés.

**Fichiers** :
| Fichier | Rôle |
|---|---|
| `app/routers/cluster.py` | `PATCH /clusters/{id}` (toggle `is_published`, `category_id`) |
| `client/.../dashboard/topics/topic-content.tsx` | Bouton Publier/Dépublier (dashboard) |
| `client/.../sections/landing/` + `sections/topic/` | Affichage côté site public |

---

## 5. Notions clés

**Vecteur vs texte.** Chaque article a deux représentations. Le **vecteur** (768
nombres) sert à la *machine* pour mesurer la ressemblance → regrouper. Le **texte**
(titre + problématique) sert au *LLM* pour comprendre le sens → nommer. Le LLM ne voit
jamais les vecteurs.

**Ce qui est vectorisé.** Pas l'article entier : seulement `titre + resume_neutre +
problematique_africaine` concaténés, puis encodés par `multilingual-e5-base`.

**Le pont Postgres ↔ Qdrant.** Le même `article_id` existe des deux côtés. Après le
clustering, on a des groupes d'IDs ; on récupère le texte correspondant dans Postgres
par jointure sur cet ID. On ne « dé-vectorise » jamais (transformation à sens unique).

**Pourquoi scikit-learn et pas le LLM pour regrouper.** Le regroupement (comparer tous
les articles) est fait par des maths (gratuit, instantané, **déterministe**). Le LLM
n'intervient que pour poser une étiquette lisible sur des groupes déjà constitués —
en un seul appel, sur un échantillon. Résultat : moins cher, plus rapide, reproductible.

**Re-run.** Relancer le backfill purge les clusters **non publiés** de la veille et
recalcule ; les clusters **publiés** (validés par un humain) sont préservés.

---

## 6. Carte des fichiers

### Backend (`backend/app/`)

| Fichier | Rôle |
|---|---|
| `main.py` | Montage des routers FastAPI |
| `core/config.py` | Tous les réglages (DB, Qdrant, embeddings, clustering, LLM) |
| `core/db.py` · `core/celery.py` | Session SQLAlchemy async · config Celery |
| `models/veille.py` | Modèles ORM : `Veille`, `Article`, `Cluster`, `Category` |
| `schemas/veille.py` | Schémas Pydantic (validation + réponses API) |
| `services/tekawake.py` | Scrapers + workflow LangGraph + services backfill + génération |
| `services/embeddings.py` | Embeddings sentence-transformers e5-base |
| `services/qdrant_service.py` | Client Qdrant + opérations vecteurs |
| `services/clustering.py` | Clustering v2 (agglomératif + nommage + catégorisation) |
| `services/llm_factory.py` | Fabrique de ChatModel LLM |
| `tasks/veille_tasks.py` | Les 3 tâches Celery |
| `crud/crud_*.py` | Accès DB par entité (veille, article, cluster, category) |
| `routers/*.py` | Endpoints : `veille`, `cluster`, `article`, `category`, `qdrant` |

### Frontend (`client/src/`)

| Fichier / dossier | Rôle |
|---|---|
| `lib/api/veille.service.ts` | Couche API — hooks SWR + mutations, miroir des schémas backend |
| `lib/format-date.ts` | Helpers de formatage de dates |
| `app/page.tsx` | Accueil public `/` |
| `app/topic/one/[topic_id]/` | Page **catégorie** publique (`topic_id` = `category_id`) |
| `app/topic/article/[article_id]/` | Page **sujet** publique (`article_id` = `cluster_id`) |
| `app/dashboard/**` | Pages de l'admin |
| `components/sections/landing/` | `hero` + `content` — accueil public |
| `components/sections/topic/` | `topic` + `article` — pages publiques |
| `components/sections/dashboard/` | Composants du dashboard admin |

---

## 7. Modèle de données

```
Veille  1 ─── N  Article  N ─── 1  Cluster  N ─── 1  Category
```

- `Veille` — une session de veille (prompt, statut, `llm_provider`).
- `Article` — `veille_id`, `cluster_id` (nullable), `analysis` (JSON), `status`.
- `Cluster` — `title`, `category_id` (nullable), `summary_article`, `slides`, `is_published`.
- `Category` — `name` (taxonomie fixe, éditée à la main).

Suppression d'une veille → cascade sur ses articles + nettoyage des clusters devenus
vides + purge des vecteurs Qdrant correspondants.

---

## 8. Réglages (`core/config.py`)

| Réglage | Rôle |
|---|---|
| `EMBED_MODEL` / `EMBED_DIM` | Modèle d'embeddings (`multilingual-e5-base`, 768 dim) |
| `QDRANT_URL` / `QDRANT_COLLECTION` | Instance Qdrant distante, collection `tekawake_articles` |
| `CLUSTER_SIM_THRESHOLD` | Seuil de similarité cosinus pour regrouper (0.86, calé empiriquement) |
| `CLUSTER_MAX_SIZE` | Cap d'articles par cluster (10) |
| `MIN_CLUSTER_SIZE` | Taille mini d'un groupe pour devenir un cluster (2) |
| `DEEPSEEK/OPENAI/ANTHROPIC_*` | Clés et modèles des 3 providers LLM |

---

## 9. Outils & endpoints utiles

- **Swagger** : `http://localhost:8000/docs` — toute l'API.
- **Inspection Qdrant** : `GET /qdrant/collections` et `GET /qdrant/collections/{nom}`
  — voir les collections, le nombre de points, la répartition par veille / cluster,
  sans ouvrir le dashboard Qdrant.
- **Cache du modèle** : le modèle e5-base (~1 Go) est mis en cache dans `HF_HOME`
  (`/app/.hf_cache`, monté en volume). Téléchargé une seule fois, persistant.

---

## 10. Suivi & roadmap

Ce document décrit **comment le projet fonctionne** ; il grandit au fur et à mesure
que de nouvelles fonctionnalités sont ajoutées.

Pour le **journal des versions, les décisions techniques et la feuille de route**
(ce qui a été livré, quand, et ce qui reste à faire) → voir **`INSPECTION_RAPPORT.md`**.

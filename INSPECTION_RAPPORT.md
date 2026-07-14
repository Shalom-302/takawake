# Tekawake — Suivi du projet & versions

> Journal des évolutions, décisions techniques et feuille de route.
>
> Pour **comment le projet fonctionne** (architecture, pipeline, fichiers) → voir **`DESCRIPTION.md`**.
>
> Projet démarré le 2026-05-17.

---

## Journal des versions

### 2026-06-26 — Page « À la Une » : date d'actu, graphe réactif, slides au clic, cohérence UI

**Pourquoi**
- Aligner la page lecteur sur le modèle Entropie : onglets **Aujourd'hui / Hier /
  Cette semaine** qui affichent les clusters **publiés par l'admin**, et au clic un
  panneau qui « sort » le résumé **et** les slides proprement, avec des indicateurs
  de fraîcheur (« il y a 4 heures », « 12 articles »).

**Date de l'actu (et non plus date de clustering)**
- Le filtre temporel + l'indicateur « il y a X heures » se basaient sur
  `cluster.created_at` (= moment du clustering) → un cluster publié aujourd'hui mais
  *créé* hier n'apparaissait pas dans « Aujourd'hui ».
- Nouveau champ **calculé** `published_date` = `MAX(articles.publication_date)` du
  cluster, repli `created_at`. Exposé sur `ClusterResponse` (sous-requête scalaire
  corrélée dans `get_all`, dérivation des articles eager-loadés dans `get`). **Aucune
  colonne / migration** — champ non persisté. Le front filtre/classe dessus.

**Graphe réactif (panneau d'accueil)**
- Le sparkline était un tracé SVG **codé en dur**. Remplacé par un rendu **piloté par
  les données** : nouvel endpoint `GET /articles/timeseries?days=14` (`count_by_day`,
  volume d'articles traités/jour sur fenêtre glissante, jours vides remplis à 0) +
  hook SWR `useArticlesTimeseries`.

**Slides au clic + bouton réparé**
- Le panneau de droite n'affichait qu'un teaser : ajout du **carrousel de slides
  inline** (même rendu que la page article). Au clic sur un cluster, résumé + slides
  sortent directement.
- Bouton « Lire l'article complet » non cliquable → cause racine identifiée (cf.
  ci-dessous).

**Cohérence UI — shell partagé**
- La page article complète (`/topic/article/[id]`) était enveloppée dans
  `MainLayout` (Navbar/Footer marketing) → rupture visuelle avec le feed. Extraction
  d'un **`FeedShell`** (sidebar + barre/drawer mobile) partagé par l'accueil **et** la
  page article. La sidebar de la page article renvoie à l'accueil sur la vue choisie
  (deep-link `?view=`, lu via `useSearchParams` + `Suspense`).

**Boutons-liens cassés — fix racine**
- Le composant `Button` en mode `asChild` enveloppait les enfants dans un `<span>`
  stylé : Slot fusionnait les classes sur le span et le vrai `<a>` se retrouvait
  **imbriqué** → seule la zone du texte était cliquable. Corrigé **une fois** dans
  `Button` (`asChild` → `<Slottable>{children}</Slottable>`, styles sur l'enfant).
  Répare d'un coup navbar, public-navbar, topic, hero, document-list, account, le
  wrapper `LinkButton` et la page article.

**Rendu markdown des résumés**
- Le LLM émet du markdown irrégulier (`##`, `**`, `*`, puces) affiché en clair.
  Nouveau module **`lib/markdown.tsx`** : `renderMarkdown` (titres, gras, italique,
  code, listes, paragraphes ; marqueurs orphelins retirés) + `stripMarkdown`
  (texte nu pour les teasers). Les deux rendus dupliqués (`renderRichText`,
  `FormatText`) supprimés → une seule source. Branché sur le lecteur, le dashboard
  et tous les aperçus (topic, landing, all-articles, feed).

**Migrations**
- Suppression de la migration auto-générée **fautive** `023f96dfc305_is_premium` :
  l'autogenerate, ne voyant plus les modèles `faith_*` dans le code (mais les tables
  encore en base), proposait des `DROP TABLE faith_*` non voulus (échec sur FK
  `faith_answers`). La colonne `clusters.is_premium` est déjà ajoutée par
  `f3a9c1d2e4b7`. **Tables `faith_*` orphelines** en base (modèles absents) : à
  purger volontairement un jour, ou à ignorer dans l'autogenerate.

**À l'exécution**
- `published_date` et `/articles/timeseries` sont **calculés** (pas de migration) →
  un **redémarrage backend** suffit. Tant qu'il n'est pas à jour, le sparkline reste
  vide (dégradé propre) et le filtre retombe sur `created_at`.

### 2026-06-16 — Sourcing Firecrawl (piloté par le prompt) + dédup par veille + tuning clustering

**Pourquoi**
- Le sourcing RSS fixe (8 flux) ramenait le **même pool panafricain** pour toutes
  les veilles → fort recoupement, et une veille pays (« Bénin ») restait noyée dans
  du généraliste (~88 % d'articles écartés au gate de pertinence). Constat boss :
  « il prend les mêmes articles quand le sujet est proche ».

**Sourcing Firecrawl (Phase 1)** — découverte pilotée par le prompt
- Firecrawl self-hosté (fork `ghcr.io/shalom-302/firecrawl`) déployé sur Dokploy,
  **interne** (alias réseau `firecrawl-api:3002`, pas d'expo publique), empreinte
  plafonnée (mem_limit, workers min).
- Nouveau `app/services/firecrawl_client.py` : `search()` = `/v1/search` (recherche
  web + scrape markdown en 1 appel, fallback DuckDuckGo gratuit) ; `scrape()` =
  fallback musclé pour sites JS « squelette » (waitFor + onlyMainContent=false).
- Nœud `firecrawl_search_node` + graphe LangGraph **conditionnel** via flag
  `SOURCING_PROVIDER` (`rss` | `firecrawl`, défaut `rss` = rollback instantané).
  `relevance → analyze → index → cluster` inchangés.
- **Résultat prod** : veille « tech Bénin » → 9 URLs **ultra-ciblées** (gouv.bj,
  devbenin.bj, techies.ga…), **relevance 9 gardés / 0 écartés** (vs ~88 % de bruit
  en RSS). Remplace aussi trafilatura (extraction markdown propre).

**Phase 2 — fin du vol d'articles + dédup du coût LLM**
- Bug : `source_url` **unique global** + `create_or_update` par URL → une veille
  proche **volait** les articles d'une autre (réécriture du `veille_id`, cluster
  vidé). Corruption silencieuse.
- Fix : unicité **`(veille_id, source_url)`** (migration `d2f1a4c7b8e3`) +
  `create_or_update` scopé par veille → plus de vol, chaque veille est autonome.
- `analyze_articles_node` **réutilise** l'analyse d'une URL déjà traitée (toute
  veille) → **0 appel LLM redondant** quand des veilles se recoupent. (Choix
  pragmatique vs split de table N-N complet : même résultat, 1/10e du risque,
  Qdrant/clustering/front intacts.)

**Clustering réglable par env**
- `CLUSTER_SIM_THRESHOLD` / `CLUSTER_MAX_SIZE` / `MIN_CLUSTER_SIZE` exposés en env
  (sans rebuild). Effet de bord du sourcing ciblé : les articles d'une veille étant
  désormais homogènes, ils fusionnent souvent en **1 cluster** au seuil 0.86. Pour
  un grain plus fin **sans perdre d'articles** : monter le seuil (~0.90) + passer
  `MIN_CLUSTER_SIZE=1`. **Décision finale en attente du point boss** (1 synthèse par
  veille vs sous-thèmes).

**Image backend allégée** (en cours)
- `Dockerfile` : torch **CPU-only** pré-installé (`--index-url .../whl/cpu`) avant
  requirements → image ~3 Go → ~1,3 Go (la couche CUDA inutile en CPU disparaît).
  *Modif faite, à pousser pour que le prochain build en profite.*

**Déploiement — pièges résolus (Dokploy)**
- Compose prod `backend/docker-compose.image.yml` : il faut **lister explicitement**
  chaque var dans `environment:` (Dokploy ne fait que la substitution `${}`, pas
  d'injection complète du `.env`). Manquaient `DEEPSEEK_API_KEY`, `SOURCING_PROVIDER`,
  `FIRECRAWL_*`, `GEMINI`, `LANGSMITH_*` → symptômes `provider=rss`, « DEEPSEEK non
  configuré », spam LangSmith 401. Ajoutés à `api` **et** `celery`.
- `celery` doit être sur **`dokploy-network`** (pas que `kaapi-network`) pour
  résoudre `firecrawl-api` (sinon `EAI_AGAIN`).
- `FIRECRAWL_BASE_URL` prod = `http://firecrawl-api:3002` (PAS `host.docker.internal`
  qui est la valeur **locale** Docker Desktop).
- Compose Path Dokploy = `backend/docker-compose.image.yml` (monorepo) ; pull image
  ~3 Go figeait sur le VPS (IPv6/MTU → `disable_ipv6` + `daemon.json {"mtu":1400}`).

### 2026-05-28 — Ajout du provider LLM Ollama (self-hosted)

**Pourquoi**
- Quatrième provider à côté de deepseek / openai / anthropic, pour absorber les
  veilles sans coût d'API et garder les données chez nous (endpoint distant
  `https://ollama.traaf.app`). Les 3 providers commerciaux restent intacts.

**Intégration**
- Nouveau builder `_build_ollama()` dans `app/services/llm_factory.py` —
  utilise `langchain_ollama.ChatOllama(base_url=..., model=...)` qui tape
  `/api/chat` en httpx async sous le capot. Compat directe avec les chains
  existantes (`prompt | llm | parser`, `with_structured_output`, `ainvoke`).
- Sous-classe locale `_OllamaJsonSchema(ChatOllama)` qui override
  `with_structured_output` pour forcer `method="json_schema"` (contrainte JSON
  native côté serveur Ollama) au lieu de `function_calling`. Encapsulé dans le
  factory → `tekawake.py` et `clustering.py` non touchés.
- `OllamaModel = Literal["qwen3:8b", "mistral:7b", "gemma3:4b", "llama3.1:8b"]`
  exposé en dropdown Swagger sur 3 routes (`/veille/run`,
  `/cluster/backfill-assign`, `/cluster/{id}/generate-content`).
- `OLLAMA_MODEL_OVERRIDE: ContextVar` propage la sélection request-scoped à
  travers Celery → `_build_ollama()`. Zéro signature touchée dans les services
  profonds. Isolation garantie par `asyncio.run` (le `set()` est scopé à la
  coroutine).

**Bench interne** (40 articles, "Tendances Fintech")

| Modèle      | Processed | Wall time | Erreurs LLM |
|-------------|-----------|-----------|-------------|
| llama3.1:8b | 36/40     | 909s      | 0           |
| mistral:7b  | 36/40     | 814s (-10%) | 0         |
| **gemma3:4b** | **38/40** | **675s (-26%)** | **0** |

- **gemma3:4b retenu comme défaut Ollama** (`OLLAMA_LLM_MODEL`). Contre-intuitif
  (4B params bat 8B), expliqué par : tâche étroite (résumé + classif structurée),
  vitesse d'inférence ∝ 1/taille, et surtout la **contrainte JSON-schema** qui
  fait le gros du travail — peu importe la "réflexion" du modèle, la sortie
  est forcée au format `ArticleAnalysis`.
- Les modèles peuvent toujours être changés au cas par cas via le dropdown
  Swagger sans rebuild ni restart.

**Décisions techniques**
- Refus du chemin "ajouter `method` paramétré dans tekawake.py" — Ollama
  encapsule sa stratégie chez lui (factory), la logique veille reste agnostique.
- ContextVar plutôt que threading d'un kwarg à travers 5+ signatures.
- Tool-calling natif Ollama écarté : les modèles 7B/8B locaux y sont peu
  fiables (qwen3 hallucine la structure, llama3.1 n'émet pas le tool-call,
  gemma3 ne le supporte pas du tout) → json_schema = commun dénominateur.

### 2026-05-20 — Phase 2 backend : clustering v2, catégories, site public

**Scraping & embeddings**
- Scraping asynchrone (`httpx` + `asyncio.gather`), concurrence listings / fetch / LLM.
  Workflow passé de ~30 min à quelques minutes.
- Embeddings basculés sur `sentence-transformers/multilingual-e5-base` (768 dim, CPU, gratuit).
- Qdrant : conteneur `qdrant` du VPS (`http://qdrant:6333`), collection
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

### Phase 2 — Optimisation du scraping (largement faite)

Fait : async, Qdrant + embeddings, clustering v2, **sourcing Firecrawl piloté par le
prompt** (2026-06-16), **dédup par veille + réutilisation analyse** (fin du vol
d'articles + 0 LLM redondant), **rendu JS** (Firecrawl/Playwright intégré). Reste :
- **Fan-out Celery par article** — `chord(group(...))`, retry granulaire, observabilité (Flower).
- **Cache HTTP + cache LLM** — ETag par source ; le `llm_cache(content_hash, analysis)`
  est partiellement couvert par la réutilisation d'analyse par URL.
- **Celery beat** — scraping continu, recluster incrémental.
- **SearXNG** — moteur de recherche self-host pour Firecrawl si DuckDuckGo rate-limite.
- **Score domaine + fraîcheur**.
- (Optionnel) modèle N-N complet (article canonique + table de liaison) si on veut
  zéro duplication de contenu/vecteur — non nécessaire fonctionnellement.

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
- **`backend/dokploy.env.txt`** (template env prod, contient des secrets) → à gitignorer.
- **Rotationner les clés exposées** (DeepSeek, OpenAI, Anthropic, Gemini, Qdrant,
  LangSmith, secrets OAuth) — divulguées en clair pendant le déploiement.
- Retirer `--reload` du `CMD` du Dockerfile de prod (le compose prod override déjà
  la commande, mais à nettoyer).
- **Pousser le Dockerfile torch-CPU** (image ~1,3 Go) — fait en local, pas encore buildé.
- LangSmith : `LANGSMITH_TRACING_V2=false` en prod (clé 401, spammait les logs).

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

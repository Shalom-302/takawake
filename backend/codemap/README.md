# codemap — mémoire persistante du backend kaapi

Système de **mémoire projet** : analyse le backend, construit un graphe de
dépendances et une cartographie d'architecture, découpe le code en chunks
sémantiques, les vectorise (sentence-transformers local) et les indexe dans
Qdrant pour une **recherche sémantique** du code.

Objectif : éviter aux agents IA de rescanner tout le dépôt à chaque session.

> ⚠️ **Lecture seule sur le métier.** Ce module n'importe ni ne modifie aucune
> logique de `app/`. Il se contente de lire les fichiers `.py` et d'écrire ses
> propres livrables dans `codemap/output/`. La collection Qdrant utilisée est
> **dédiée** (`kaapi_backend_memory`) et ne touche jamais `tekawake_articles`.

## Prérequis

Les libs ML (`sentence-transformers`, `qdrant-client`, `numpy`) et le modèle
`intfloat/multilingual-e5-base` (cache `.hf_cache/`) vivent dans l'image
`kaapi-app`. Tout s'exécute donc **dans le container** `kaapi-api`, qui monte le
backend en `/app` et fournit `QDRANT_URL` / `QDRANT_API_KEY` via l'env.

## Pipeline

| Étape | Script | Sortie |
|------:|--------|--------|
| 1 | `analyze_ast.py` | `analysis.json`, `analysis_report.md` |
| 2 | `dependency_graph.py` | `dependency_graph.{json,md}` |
| 3 | `project_map.py` | `PROJECT_MAP.md` |
| 4-5 | `chunk.py` | `chunks.jsonl` |
| 6 | `vectorize.py` | `embeddings.npy`, `embeddings_meta.json`, `embedding_cache.npz` |
| 7 | `index_qdrant.py` | collection Qdrant `kaapi_backend_memory` |
| 8 | `search.py` | recherche sémantique CLI |
| 9 | `final_report.py` | `FINAL_REPORT.md` |

## Lancer tout le pipeline

```bash
# (re)construit tout : AST → graphe → map → chunks → embeddings → Qdrant
docker exec -w /app kaapi-api python codemap/scripts/run_all.py

# pour repartir d'une collection vierge :
docker exec -w /app kaapi-api python codemap/scripts/run_all.py --recreate
```

## Recherche sémantique

```bash
docker exec -w /app kaapi-api python codemap/scripts/search.py "modifier le login"
docker exec -w /app kaapi-api python codemap/scripts/search.py "permissions utilisateur" --top 8
docker exec -w /app kaapi-api python codemap/scripts/search.py "paiement" --layer service
docker exec -w /app kaapi-api python codemap/scripts/search.py --json "notifications"
```

Filtres disponibles : `--layer`, `--module`, `--type` (module/class/method/function/endpoint).

Chaque résultat indique : fichier, symbole, type, couche, module, dépendances,
plage de lignes et score de similarité cosine.

## Serveur MCP (Claude Code interroge la mémoire)

`mcp/server.py` est un serveur **MCP stdio autonome** (JSON-RPC pur, sans le SDK
`mcp`) qui tourne *dans* le container `kaapi-api` — là où vivent le modèle e5 et
l'accès Qdrant. Claude Code le lance via `.mcp.json` (à la racine `backend/`) :

```json
{ "mcpServers": { "kaapi-codemap": {
  "command": "docker",
  "args": ["exec","-i","-w","/app","kaapi-api","python","-u","codemap/mcp/server.py"]
}}}
```

Outils exposés :

| Outil | Rôle |
|-------|------|
| `search_code` | recherche sémantique (query, top, filtres layer/module/type) |
| `architecture_overview` | renvoie `PROJECT_MAP.md` pour s'orienter sans rescan |

Le modèle e5 est chargé **une seule fois** (au 1er appel) puis reste chaud. Le
serveur est **lecture seule** : il n'écrit ni dans Qdrant ni dans le code.

> Activation : le container `kaapi-api` doit tourner. Au démarrage Claude Code
> détecte `.mcp.json` et demande l'autorisation d'utiliser le serveur projet
> `kaapi-codemap` (sinon `/mcp` pour vérifier l'état / réautoriser).

### Variante distante (HTTP, partageable)

`mcp/server.py` est **local** (stdio, ta machine). Pour exposer la mémoire à
d'autres personnes (leur Claude, via URL + token Bearer), voir le service
déployable **`mcp_remote/`** (Streamable HTTP, Dockerfile + Dokploy) et son
`mcp_remote/README.md`.

## Rafraîchir après une évolution du code

Le pipeline est **idempotent**. Relancer `run_all.py` régénère analyse + graphe
+ map, ré-encode **uniquement les chunks modifiés** (cache, voir ci-dessous) et
ré-indexe. Pour une remise à zéro complète de la collection, ajouter
`--recreate`.
```bash
docker exec -w /app kaapi-api python codemap/scripts/run_all.py
```

### Cache d'embeddings (DRY — ne ré-encode que le nouveau)

`vectorize.py` garde `output/embedding_cache.npz` = `{hash(texte) → vecteur}`.
À chaque run, un chunk au **contenu inchangé** réutilise son vecteur ; seuls les
chunks **nouveaux ou modifiés** sont ré-encodés. Si rien n'a changé, le modèle
n'est même pas chargé → rebuild en **quelques secondes** au lieu de ~30 min.

- Clé = hash du contenu embarqué → robuste à la renumérotation des `id`.
- Cache **invalidé** automatiquement si `EMBED_MODEL` change.
- `index_qdrant.py` **purge** les points obsolètes (id ≥ N) si le code rétrécit,
  pour rester synchro avec Qdrant.
- Forcer un ré-encodage complet : `python codemap/scripts/vectorize.py --no-cache`.

# kaapi-codemap — serveur MCP **distant** (HTTP)

Service réseau qui expose la recherche sémantique du backend kaapi
(collection Qdrant `kaapi_backend_memory`) à **n'importe quel client MCP**
(Claude Code, Claude Desktop, claude.ai) via une **URL + un token Bearer**.

But : permettre à d'autres personnes d'ajouter le MCP kaapi dans leur Claude
pour comprendre le projet **sans rescanner le dépôt** → moins de tokens, plus
de vitesse.

> Différence avec `codemap/mcp/` : celui-ci est le **stdio local** (uniquement
> ta machine, via `docker exec`). Ici c'est la version **déployable** en HTTP.

## Contenu

| Fichier | Rôle |
|--------|------|
| `server_http.py` | serveur MCP Streamable HTTP (FastMCP) + auth Bearer + `/health` |
| `requirements.txt` | deps Python (hors torch CPU, installé dans le Dockerfile) |
| `Dockerfile` | image self-contained (modèle e5 pré-téléchargé) |
| `docker-compose.yml` | run local / déploiement Dokploy type *Compose* |
| `.env.example` | variables à renseigner |
| `PROJECT_MAP.md` | carte d'archi embarquée (outil `architecture_overview`) |

Outils MCP exposés : `search_code(query, top, layer, module, type)` et
`architecture_overview()`.

## 1) Tester en local (Docker)

```bash
cd backend/codemap/mcp_remote
cp .env.example .env            # renseigne MCP_API_TOKEN + QDRANT_API_KEY
docker compose --env-file .env up --build
# 1er build : télécharge torch CPU + le modèle e5 (~quelques minutes, image ~2-3 Go)

# vérifs
curl http://localhost:8000/health
# -> {"status":"ok","collection":"kaapi_backend_memory",...}
```

## 2) Déployer sur Dokploy

### Option A — Application (Dockerfile)
1. **Create → Application**, source = ce dépôt Git, branche voulue.
2. **Build Type : Dockerfile**.
   - *Docker Context Path* : `backend/codemap/mcp_remote`
   - *Dockerfile Path* : `Dockerfile` (relatif au context)
3. **Environment** :
   ```
   MCP_API_TOKEN=<token long et aléatoire>
   QDRANT_URL=http://qdrant:6333
   QDRANT_API_KEY=<clé Qdrant>
   CODEMAP_COLLECTION=kaapi_backend_memory
   ```
4. **Domains / Ports** : container port **8000**, génère un domaine
   (ex. `mcp-kaapi.tekawake.com`), active **HTTPS** (Let's Encrypt).
   *Health check path* : `/health`.
5. **Deploy.**

### Option B — Compose
*Build Type : Docker Compose*, chemin `backend/codemap/mcp_remote/docker-compose.yml`,
renseigne les mêmes variables d'env. Dokploy gère le domaine + TLS via Traefik.

> ⚠️ Le 1er build est lourd (torch + modèle e5 ≈ 1,1 Go). Prévois sur l'hôte
> Dokploy assez de **disque** et **≥ 2 Go de RAM** (le modèle est chargé en
> mémoire au 1er appel).

### Vérifier après déploiement
```bash
curl https://mcp-kaapi.tekawake.com/health
# initialize MCP (doit répondre, sinon 401 si mauvais token)
curl -s https://mcp-kaapi.tekawake.com/mcp \
  -H "Authorization: Bearer $MCP_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

## 3) Intégration côté client (ce que tu partages)

Donne à chaque personne **l'URL + le token**. Puis :

### Claude Code (CLI)
```bash
claude mcp add --transport http kaapi-codemap \
  https://mcp-kaapi.tekawake.com/mcp \
  --header "Authorization: Bearer LE_TOKEN"
```
ou, en projet partagé, un `.mcp.json` :
```json
{
  "mcpServers": {
    "kaapi-codemap": {
      "type": "http",
      "url": "https://mcp-kaapi.tekawake.com/mcp",
      "headers": { "Authorization": "Bearer LE_TOKEN" }
    }
  }
}
```

### Claude Desktop / claude.ai
Ajouter un **connecteur personnalisé** (Custom connector / MCP) :
- URL : `https://mcp-kaapi.tekawake.com/mcp`
- En-tête : `Authorization: Bearer LE_TOKEN`

Une fois ajouté, l'agent dispose de `search_code` et `architecture_overview`.

## Sécurité & maintenance

- **Lecture seule** : le service n'écrit jamais dans Qdrant ni dans le code.
- **Token** : un seul token partagé (`MCP_API_TOKEN`). Pour révoquer, change la
  variable et redéploie ; pour des accès distincts par personne, prévoir
  plusieurs tokens (évolution possible du middleware).
- **Index figé au build** : `search_code` interroge Qdrant en direct (toujours à
  jour si tu réindexes), mais `PROJECT_MAP.md` est **embarqué dans l'image**.
  Après une grosse évolution : relancer le pipeline
  (`docker exec -w /app kaapi-api python codemap/scripts/run_all.py`),
  recopier `output/PROJECT_MAP.md` ici, puis redéployer.

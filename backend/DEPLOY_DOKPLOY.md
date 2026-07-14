# Déploiement Dokploy — backend kaapi + serveur MCP codemap + client Next.js

Branche dédiée : **`deploy/dokploy-mcp-backend`**.
Deux services à déployer, tous deux exposés **par domaine via Traefik** (zéro port
publié sur l'hôte → aucun conflit avec l'existant).

## Ports de l'hôte (VPS) — état

Seuls les ports publiés `0.0.0.0->` peuvent entrer en collision. Déjà pris :

| Port | Service |
|------|---------|
| 80 / 443 | dokploy-traefik |
| 3000 | dokploy |
| 3001 | sevoil-web |
| 3004 | sevoil-app |
| 32822 | shalom-gowa |
| 33107 | kortex-frontend |

➡️ **Nos deux déploiements ne publient aucun port hôte.** Traefik route par
domaine sur 443 via le réseau overlay `dokploy-network`. Donc rien à réserver.

---

## 1) Serveur MCP codemap (`backend/codemap/mcp_remote`)

Service réseau qui expose `search_code` + `architecture_overview` à n'importe
quel client MCP (Claude Code / Desktop / claude.ai) via une URL + token Bearer.

**Dokploy → Create → Compose**
- Repository : ce dépôt · Branch : `deploy/dokploy-mcp-backend`
- Compose path : `backend/codemap/mcp_remote/docker-compose.yml`
- Environment :
  ```
  MCP_API_TOKEN=<token long et aléatoire>
  QDRANT_URL=http://qdrant:6333
  QDRANT_API_KEY=<clé Qdrant>
  CODEMAP_COLLECTION=kaapi_backend_memory
  ```
- Onglet **Domains** : service `mcp-kaapi-codemap`, port `8000`,
  domaine ex. `mcp-kaapi.tekawake.com`, HTTPS activé, health check `/health`.
- **Deploy** (1er build lourd : torch CPU + modèle e5 ≈ 1,1 Go, prévoir ≥ 2 Go RAM).

Vérif :
```bash
curl https://mcp-kaapi.tekawake.com/health
```

Partage aux autres (client Claude Code) :
```bash
claude mcp add --transport http kaapi-codemap \
  https://mcp-kaapi.tekawake.com/mcp \
  --header "Authorization: Bearer LE_TOKEN"
```

---

## 2) Backend kaapi (`backend/`)

> ⚠️ Un backend kaapi tourne déjà sur le VPS (projet `petroapi`). Déploie ceci
> dans un **projet/domaine distinct** ou remplace l'ancien, selon ton intention.

**Dokploy → Create → Compose**
- Repository : ce dépôt · Branch : `deploy/dokploy-mcp-backend`
- Compose path : `backend/docker-compose.dokploy.yml`
- Environment : copier `backend/.env.dokploy.example` et renseigner les secrets.
  **Obligatoire** : `KAAPI_AES_KEY` (base64 32 octets) + `KAAPI_FERNET_KEY` —
  sans clé AES valide, l'API crashe au boot (chiffrement paiement). Générer :
  `python -c "import os,base64;print(base64.b64encode(os.urandom(32)).decode())"`.
  ⚠️ Garder ces clés **stables** (sinon données chiffrées illisibles).
- Onglet **Domains** : service `api`, port `8000`, domaine `tekawake.com`,
  HTTPS activé, health check `/`. **Paths** : `/api`, `/docs`, `/openapi.json`
  (domaine unique, partagé avec le front — ces routes doivent être **prioritaires**
  sur la route `/` du client, sinon Next.js répond 404 sur `/docs`).
- **Deploy.**

Topologie : `api` + `celery` + `metrics` partagent l'image `kaapi-app:latest` ;
`vault-seed` (init one-shot) écrit les clés dans Vault au boot et `api`/`celery`
attendent sa complétion. `kaapi-db` (+ backup), `redis`, `vault`, `minio` restent
internes au réseau `kaapi-network`. Seul `api` est joignable par Traefik
(`dokploy-network`).

Vérif : `curl https://tekawake.com/api/` → `{"message":"Hello from Kaapi backend!"}`.
Docs : `https://tekawake.com/docs`.

---

## 3) Client Next.js (`client/`)

Frontend qui consomme l'API. Exposé par domaine via Traefik, zéro port hôte.

**Dokploy → Create → Compose**
- Repository : ce dépôt · Branch : `deploy/dokploy-mcp-backend`
- Compose path : `client/docker-compose.dokploy.yml`
- Onglet **Domains** : service `web`, port `3000`,
  domaine `tekawake.com`, HTTPS activé, Path `/`.
- Environment / build-args : cf. `client/.env.dokploy.example`
  (seuls `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` sont requis).
- **Deploy.**

> ⚠️ Les variables `NEXT_PUBLIC_*` sont **inlinées au build** (pas au runtime).
> L'URL de l'API est passée en **build-arg** (défaut `https://tekawake.com/api`
> dans le compose). Pour changer d'API → modifier `NEXT_PUBLIC_API_URL` et
> **rebuild**. L'onglet Environment runtime ne suffit pas pour ces variables.

---

## Notes

- **Réindexer la mémoire** après une grosse évolution du code, puis recopier
  `codemap/output/PROJECT_MAP.md` dans `mcp_remote/` et redéployer le MCP
  (le `PROJECT_MAP.md` est embarqué dans l'image ; `search_code` interroge
  Qdrant en direct et reste à jour).
- **Secrets** : ne jamais committer les `.env` réels — tout passe par l'onglet
  Environment de Dokploy.

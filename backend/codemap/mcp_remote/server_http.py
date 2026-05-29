"""
Serveur MCP **distant** (HTTP / Streamable HTTP) — version déployable.

Expose la même recherche sémantique que `codemap/mcp/server.py` (stdio local),
mais en service réseau pour que d'autres personnes ajoutent le MCP kaapi dans
LEUR client (Claude Code, Claude Desktop, claude.ai) via une URL + un token.

Différences avec la version stdio :
  - transport Streamable HTTP (SDK `mcp` / FastMCP) au lieu de stdio ;
  - auth par **Bearer token** (env `MCP_API_TOKEN`) — refus de démarrer si absent ;
  - self-contained : aucune dépendance sur `app/` ni sur `codemap/scripts`.

LECTURE SEULE : n'écrit jamais dans Qdrant ni dans le code. L'embedding de la
requête se fait côté serveur ; la collection Qdrant doit déjà être indexée
(pipeline `codemap/scripts/run_all.py`).

Config (env) :
  MCP_API_TOKEN      (obligatoire) token Bearer attendu des clients
  QDRANT_URL         défaut https://qdrant-client.kortexai.dev
  QDRANT_API_KEY     clé Qdrant
  CODEMAP_COLLECTION défaut kaapi_backend_memory
  EMBED_MODEL        défaut intfloat/multilingual-e5-base
  HOST / PORT        défaut 0.0.0.0 / 8000

Lancement : python server_http.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import List, Optional
from urllib.parse import urlparse

# Modèle en cache local dans l'image — pas d'accès réseau HF au runtime.
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

EMBED_MODEL = os.environ.get("EMBED_MODEL", "intfloat/multilingual-e5-base")
QDRANT_URL = os.environ.get("QDRANT_URL", "https://qdrant-client.kortexai.dev")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY") or None
COLLECTION = os.environ.get("CODEMAP_COLLECTION", "kaapi_backend_memory")
API_TOKEN = os.environ.get("MCP_API_TOKEN")
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8000"))
MAP_PATH = Path(__file__).resolve().parent / "PROJECT_MAP.md"

if not API_TOKEN:
    print("FATAL: MCP_API_TOKEN non défini — refus de démarrer.", file=sys.stderr)
    sys.exit(1)

from mcp.server.fastmcp import FastMCP  # noqa: E402
from starlette.middleware.base import BaseHTTPMiddleware  # noqa: E402
from starlette.requests import Request  # noqa: E402
from starlette.responses import JSONResponse  # noqa: E402

_model = None  # SentenceTransformer (chargé à la demande)
_client = None  # QdrantClient (créé à la demande)


def _log(*a) -> None:
    print("[mcp-http]", *a, file=sys.stderr, flush=True)


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _log("chargement du modèle", EMBED_MODEL, "...")
        _model = SentenceTransformer(EMBED_MODEL, device="cpu")
        _log("modèle prêt")
    return _model


def _get_client():
    global _client
    if _client is None:
        from qdrant_client import QdrantClient
        p = urlparse(QDRANT_URL)
        https = p.scheme == "https"
        port = p.port or (443 if https else 6333)
        _client = QdrantClient(host=p.hostname, port=port, https=https,
                               api_key=QDRANT_API_KEY, prefer_grpc=False, timeout=60)
    return _client


def _run_search(query: str, top: int, layer: Optional[str],
                module: Optional[str], type_: Optional[str]) -> List[dict]:
    from qdrant_client.http import models as qm

    must = []
    if layer:
        must.append(qm.FieldCondition(key="layer", match=qm.MatchValue(value=layer)))
    if module:
        must.append(qm.FieldCondition(key="module", match=qm.MatchValue(value=module)))
    if type_:
        must.append(qm.FieldCondition(key="type", match=qm.MatchValue(value=type_)))
    flt = qm.Filter(must=must) if must else None

    vec = _get_model().encode(
        ["query: " + query], normalize_embeddings=True, convert_to_numpy=True
    )[0].tolist()
    hits = _get_client().query_points(
        collection_name=COLLECTION, query=vec,
        query_filter=flt, limit=top, with_payload=True,
    ).points

    out = []
    for h in hits:
        p = h.payload or {}
        out.append({
            "score": round(float(h.score), 4),
            "file": p.get("file"),
            "symbol": p.get("symbol"),
            "type": p.get("type"),
            "layer": p.get("layer"),
            "module": p.get("module"),
            "route": p.get("route"),
            "lines": f"{p.get('lineno')}-{p.get('end_lineno')}",
            "dependencies": p.get("dependencies", []),
            "summary": p.get("summary", ""),
        })
    return out


def _format(query: str, res: List[dict]) -> str:
    if not res:
        return f'Aucun résultat pour « {query} ».'
    lines = [f'{len(res)} résultats pour « {query} » :', ""]
    for i, r in enumerate(res, 1):
        route = ""
        if r.get("route"):
            route = f"  [{r['route'].get('method')} {r['route'].get('path')}]"
        lines.append(f"{i}. ({r['score']:.3f}) {r['type']} {r['symbol']}{route}")
        lines.append(f"   {r['file']}:{r['lines']}  ·  couche={r['layer']}  module={r['module']}")
        if r["dependencies"]:
            lines.append(f"   deps: {', '.join(r['dependencies'][:8])}")
        if r["summary"]:
            lines.append(f"   ↳ {r['summary'][:240]}")
        lines.append("")
    return "\n".join(lines)


# --- Serveur MCP -------------------------------------------------------------
# stateless + json_response : robuste derrière un reverse proxy (Traefik/Dokploy),
# pas de session collante à maintenir.
mcp = FastMCP(name="kaapi-codemap", host=HOST, port=PORT,
              stateless_http=True, json_response=True)


@mcp.tool(
    name="search_code",
    description=(
        "Recherche sémantique dans la mémoire vectorielle du backend kaapi "
        "(collection Qdrant kaapi_backend_memory). Retrouve fichier:lignes, "
        "symbole, type, couche, module, dépendances et score cosine pour une "
        "intention en langage naturel (ex: 'modifier le login', 'permissions "
        "utilisateur'). À utiliser AVANT de scanner le dépôt."
    ),
)
def search_code(query: str, top: int = 8, layer: Optional[str] = None,
                module: Optional[str] = None, type: Optional[str] = None) -> str:
    res = _run_search(query, int(top or 8), layer, module, type)
    return _format(query, res)


@mcp.tool(
    name="architecture_overview",
    description=(
        "Renvoie la cartographie d'architecture du backend (PROJECT_MAP) : "
        "modules, couches, dépendances, flux métier et points d'entrée API. "
        "À lire en premier pour s'orienter sans rescanner le code."
    ),
)
def architecture_overview() -> str:
    if MAP_PATH.exists():
        return MAP_PATH.read_text(encoding="utf-8")
    return "PROJECT_MAP.md non embarqué dans cette image."


@mcp.custom_route("/health", methods=["GET"])
async def health(_request: Request) -> JSONResponse:
    return JSONResponse({"status": "ok", "collection": COLLECTION, "model": EMBED_MODEL})


class BearerAuth(BaseHTTPMiddleware):
    """Exige `Authorization: Bearer <MCP_API_TOKEN>` sauf sur /health."""

    async def dispatch(self, request: Request, call_next):
        if request.url.path.rstrip("/") == "/health":
            return await call_next(request)
        if request.headers.get("authorization", "") != f"Bearer {API_TOKEN}":
            return JSONResponse({"error": "unauthorized"}, status_code=401)
        return await call_next(request)


app = mcp.streamable_http_app()
app.add_middleware(BearerAuth)


if __name__ == "__main__":
    import uvicorn
    _log(f"démarrage sur {HOST}:{PORT}  (collection={COLLECTION})")
    uvicorn.run(app, host=HOST, port=PORT)

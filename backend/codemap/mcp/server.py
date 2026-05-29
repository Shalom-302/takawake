"""
Serveur MCP (stdio) — expose la mémoire projet `kaapi_backend_memory` à Claude
Code et à tout client MCP, pour rechercher sémantiquement dans le code backend
sans rescanner le dépôt (économie de tokens).

POURQUOI fait-main : l'image `kaapi-app` n'embarque pas le SDK `mcp`. Plutôt que
d'alourdir l'image, on implémente le transport stdio MCP (JSON-RPC 2.0 délimité
par newline) avec la seule stdlib. Les seules deps externes — `sentence-
transformers` et `qdrant-client` — sont déjà présentes dans l'image.

Le modèle e5 est chargé PARESSEUSEMENT (au 1er appel `tools/call`), donc le
démarrage du serveur est instantané ; une fois chargé il reste chaud en mémoire.

Lancement (par Claude Code via .mcp.json, depuis l'hôte) :
    docker exec -i -w /app kaapi-api python -u codemap/mcp/server.py

LECTURE SEULE : ce serveur n'écrit jamais dans Qdrant ni dans le code métier.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

# Modèle en cache local — interdire tout accès réseau HF.
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

# common.py vit dans codemap/scripts (paramètres modèle / Qdrant partagés).
_SCRIPTS = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))
import common as C  # noqa: E402

_OUTPUT = Path(__file__).resolve().parent.parent / "output"

# --- Hygiène stdout : le protocole MCP exige que SEUL du JSON-RPC sorte sur
#     stdout. On détourne fd 1 vers fd 2 pour que toute impression parasite
#     (tqdm, warnings de libs) parte sur stderr, et on garde un handle privé
#     vers le vrai stdout pour écrire les réponses.
_REAL_STDOUT = os.fdopen(os.dup(1), "w", encoding="utf-8", buffering=1)
os.dup2(2, 1)
sys.stdout = sys.stderr  # type: ignore[assignment]

PROTOCOL_VERSION = "2024-11-05"
SERVER_INFO = {"name": "kaapi-codemap", "version": "1.0.0"}

_model = None  # SentenceTransformer, chargé à la demande
_client = None  # QdrantClient, créé à la demande


def log(*a: Any) -> None:
    print("[mcp]", *a, file=sys.stderr, flush=True)


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        log("chargement du modèle", C.EMBED_MODEL, "...")
        _model = SentenceTransformer(C.EMBED_MODEL, device="cpu")
        log("modèle prêt")
    return _model


def _get_client():
    global _client
    if _client is None:
        from qdrant_client import QdrantClient
        p = urlparse(C.QDRANT_URL)
        https = p.scheme == "https"
        port = p.port or (443 if https else 6333)
        _client = QdrantClient(host=p.hostname, port=port, https=https,
                               api_key=C.QDRANT_API_KEY, prefer_grpc=False, timeout=60)
    return _client


# --- Logique métier des outils ---------------------------------------------

def _search(query: str, top: int = 8, layer: Optional[str] = None,
            module: Optional[str] = None, type_: Optional[str] = None) -> List[dict]:
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
        collection_name=C.QDRANT_COLLECTION, query=vec,
        query_filter=flt, limit=top, with_payload=True,
    ).points

    results = []
    for h in hits:
        p = h.payload or {}
        results.append({
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
    return results


def _format_results(query: str, res: List[dict]) -> str:
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


def _overview() -> str:
    pm = _OUTPUT / "PROJECT_MAP.md"
    if pm.exists():
        return pm.read_text(encoding="utf-8")
    return "PROJECT_MAP.md introuvable — relancer le pipeline codemap."


# --- Déclaration des outils MCP ---------------------------------------------

TOOLS = [
    {
        "name": "search_code",
        "description": (
            "Recherche sémantique dans la mémoire vectorielle du backend kaapi "
            "(collection Qdrant kaapi_backend_memory, 3583 chunks de code). "
            "Utilise-la AVANT de scanner le dépôt : retrouve le(s) fichier(s), "
            "symbole(s) et dépendances pertinents pour une intention en langage "
            "naturel (ex: 'modifier le login', 'permissions utilisateur', "
            "'envoi de notifications'). Retourne fichier:lignes, symbole, type, "
            "couche, module, dépendances et score cosine."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Intention en langage naturel."},
                "top": {"type": "integer", "description": "Nombre de résultats (défaut 8).", "default": 8},
                "layer": {"type": "string", "description": "Filtre couche: api|service|crud|model|schema|core|task|command|util|plugin|entrypoint|test."},
                "module": {"type": "string", "description": "Filtre module logique (ex: advanced_auth, routers, security)."},
                "type": {"type": "string", "description": "Filtre type: module|class|method|function|endpoint."},
            },
            "required": ["query"],
        },
    },
    {
        "name": "architecture_overview",
        "description": (
            "Renvoie la cartographie d'architecture du backend (PROJECT_MAP.md) : "
            "modules, couches, dépendances, flux métier et points d'entrée API. "
            "À lire en premier pour s'orienter dans le projet sans rescanner le code."
        ),
        "inputSchema": {"type": "object", "properties": {}},
    },
]


def _call_tool(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    if name == "search_code":
        query = args.get("query", "")
        res = _search(
            query,
            top=int(args.get("top", 8) or 8),
            layer=args.get("layer"),
            module=args.get("module"),
            type_=args.get("type"),
        )
        text = _format_results(query, res)
        return {"content": [{"type": "text", "text": text}], "isError": False}
    if name == "architecture_overview":
        return {"content": [{"type": "text", "text": _overview()}], "isError": False}
    return {
        "content": [{"type": "text", "text": f"Outil inconnu: {name}"}],
        "isError": True,
    }


# --- Boucle JSON-RPC stdio ---------------------------------------------------

class MethodNotFound(Exception):
    pass


def _handle(req: Dict[str, Any]) -> Any:
    method = req.get("method")
    params = req.get("params") or {}
    if method == "initialize":
        client_ver = params.get("protocolVersion")
        return {
            "protocolVersion": client_ver or PROTOCOL_VERSION,
            "capabilities": {"tools": {}},
            "serverInfo": SERVER_INFO,
        }
    if method == "tools/list":
        return {"tools": TOOLS}
    if method == "tools/call":
        return _call_tool(params.get("name", ""), params.get("arguments") or {})
    if method == "ping":
        return {}
    raise MethodNotFound(method)


def _send(obj: Dict[str, Any]) -> None:
    _REAL_STDOUT.write(json.dumps(obj, ensure_ascii=False) + "\n")
    _REAL_STDOUT.flush()


def main() -> None:
    log("serveur démarré — en attente de requêtes MCP")
    for raw in sys.stdin:
        raw = raw.lstrip("﻿").strip()  # tolère un BOM en tête de flux
        if not raw:
            continue
        try:
            req = json.loads(raw)
        except json.JSONDecodeError:
            continue
        is_notification = "id" not in req
        try:
            result = _handle(req)
            if not is_notification:
                _send({"jsonrpc": "2.0", "id": req["id"], "result": result})
        except MethodNotFound as e:
            if not is_notification:
                _send({"jsonrpc": "2.0", "id": req["id"],
                       "error": {"code": -32601, "message": f"Method not found: {e}"}})
        except Exception as e:  # noqa: BLE001
            log("erreur:", repr(e))
            if not is_notification:
                _send({"jsonrpc": "2.0", "id": req["id"],
                       "error": {"code": -32603, "message": str(e)}})
    log("stdin fermé — arrêt")


if __name__ == "__main__":
    main()

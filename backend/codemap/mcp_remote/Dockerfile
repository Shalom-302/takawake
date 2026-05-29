# Image self-contained du serveur MCP distant kaapi-codemap.
# Build context = ce dossier (codemap/mcp_remote).
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HUB_DISABLE_PROGRESS_BARS=1 \
    TOKENIZERS_PARALLELISM=false \
    HF_HOME=/srv/.hf_cache

WORKDIR /srv

# 1) torch CPU-only (évite les ~2 Go de CUDA), puis le reste.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) Pré-télécharge le modèle e5 DANS l'image (runtime 100% offline).
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('intfloat/multilingual-e5-base')"

# 3) Code + carte d'architecture embarquée.
COPY server_http.py PROJECT_MAP.md ./

ENV HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 HOST=0.0.0.0 PORT=8000
EXPOSE 8000

# Healthcheck (sans dépendance : urllib stdlib).
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health',timeout=3).status==200 else 1)"

CMD ["python", "server_http.py"]

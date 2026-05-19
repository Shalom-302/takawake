# syntax=docker/dockerfile:1.7
# ===================================================================
# STAGE 1 : Builder — installe les deps Python avec cache pip persistant
# ===================================================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Deps système pour compiler les paquets Python qui n'ont pas de wheels
# (libpq pour psycopg, build-essential pour hdbscan/Cython si pas de wheel)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
       gcc \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

# Copier UNIQUEMENT les manifestes de deps : la layer suivante n'est invalidée
# que si requirements.txt ou install_plugin_requirements.py changent.
COPY requirements.txt install_plugin_requirements.py ./

# Cache mount BuildKit : /root/.cache/pip est partagé entre builds.
# Premier build : télécharge tout (~8 min).
# Rebuilds suivants : ne télécharge que les wheels manquantes (~30s).
# IMPORTANT : pas de --no-cache-dir, sinon le mount ne sert à rien.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

RUN --mount=type=cache,target=/root/.cache/pip \
    python install_plugin_requirements.py


# ===================================================================
# STAGE 2 : Runtime — image légère, copie le site-packages du builder
# ===================================================================
FROM python:3.11-slim

WORKDIR /app

# libpq pour psycopg en runtime. build-essential reste dans le builder.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

COPY . .

EXPOSE 8000

# --reload pour dev. À retirer pour la prod (cf. INSPECTION_RAPPORT §3.E).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

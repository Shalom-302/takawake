#!/usr/bin/env python3
# metrics_server.py - Serveur de métriques indépendant pour Prometheus
from fastapi import FastAPI, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, CollectorRegistry
from prometheus_client import Counter, Summary, Gauge
import uvicorn
import psutil
import asyncio
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("metrics-server")

# Création d'une application FastAPI dédiée aux métriques
app = FastAPI(title="Kaapi Metrics", docs_url=None, redoc_url=None)

# Création d'un registre personnalisé pour les métriques
REGISTRY = CollectorRegistry()

# Métriques de base
HTTP_REQUESTS = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'], registry=REGISTRY)
REQUEST_LATENCY = Summary('http_request_duration_seconds', 'HTTP request latency', registry=REGISTRY)

# Métriques système
CPU_USAGE = Gauge('system_cpu_usage', 'CPU usage percentage', registry=REGISTRY)
MEMORY_USAGE = Gauge('system_memory_usage_bytes', 'Memory usage in bytes', registry=REGISTRY)
DISK_USAGE = Gauge('system_disk_usage_bytes', 'Disk usage in bytes', registry=REGISTRY)
DISK_FREE = Gauge('system_disk_free_bytes', 'Free disk space in bytes', registry=REGISTRY)

@app.get("/metrics")
async def metrics():
    """Endpoint pour exposer les métriques Prometheus."""
    try:
        # Mise à jour des métriques système
        update_system_metrics()
        
        # Génération des métriques Prometheus
        return Response(content=generate_latest(REGISTRY), media_type=CONTENT_TYPE_LATEST)
    except Exception as e:
        logger.error(f"Erreur lors de la génération des métriques: {str(e)}")
        return Response(content=f"# Erreur: {str(e)}", status_code=500)

def update_system_metrics():
    """Met à jour les métriques système."""
    try:
        # CPU
        CPU_USAGE.set(psutil.cpu_percent())
        
        # Mémoire
        mem = psutil.virtual_memory()
        MEMORY_USAGE.set(mem.used)
        
        # Disque
        disk = psutil.disk_usage('/')
        DISK_USAGE.set(disk.used)
        DISK_FREE.set(disk.free)
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour des métriques système: {str(e)}")

async def periodic_metrics_update():
    """Met à jour périodiquement les métriques système."""
    while True:
        update_system_metrics()
        await asyncio.sleep(15)  # Mise à jour toutes les 15 secondes

@app.on_event("startup")
async def startup_event():
    """Événement de démarrage pour initialiser les tâches en arrière-plan."""
    asyncio.create_task(periodic_metrics_update())
    logger.info("Serveur de métriques démarré")

if __name__ == "__main__":
    # Démarrage du serveur sur le port 8001
    uvicorn.run(app, host="0.0.0.0", port=8001)

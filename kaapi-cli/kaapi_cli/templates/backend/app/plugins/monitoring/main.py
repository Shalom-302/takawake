    # main.py
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from prometheus_client import Counter, Histogram, Gauge
from fastapi import APIRouter, Response, Request, Depends
import time
import os
import psutil

# Définition des métriques
REQUEST_COUNT = Counter(
    'http_requests_total', 
    'Total number of HTTP requests', 
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds', 
    'HTTP request latency in seconds', 
    ['method', 'endpoint']
)

CPU_USAGE = Gauge(
    'system_cpu_usage', 
    'Current CPU usage percentage'
)

MEMORY_USAGE = Gauge(
    'system_memory_usage_bytes', 
    'Current memory usage in bytes'
)

# Fonction pour mettre à jour les métriques système
def update_system_metrics():
    # Mise à jour des métriques système
    try:
        CPU_USAGE.set(psutil.cpu_percent())
        MEMORY_USAGE.set(psutil.virtual_memory().used)
    except Exception as e:
        print(f"Erreur lors de la mise à jour des métriques système: {str(e)}")

def get_router():
    router = APIRouter(tags=["Monitoring"])
    
    @router.get("/metrics")
    async def metrics_endpoint():
        """
        Endpoint pour exposer les métriques Prometheus.
        Utilisé par Prometheus pour scraper les données de monitoring.
        """
        try:
            # Mise à jour des métriques système avant de générer le rapport
            update_system_metrics()
            
            # Générer les métriques au format Prometheus
            prometheus_metrics = generate_latest()
            return Response(
                content=prometheus_metrics, 
                media_type=CONTENT_TYPE_LATEST
            )
        except Exception as e:
            # En cas d'erreur, renvoyer une réponse avec un message d'erreur
            return Response(
                content=f"Error generating metrics: {str(e)}",
                status_code=500
            )
    
    # Ajouter des endpoints supplémentaires pour tester et générer des métriques manuellement
    @router.get("/record-request")
    async def record_request(request: Request, path: str, status_code: int = 200, latency: float = 0.1):
        """
        Endpoint de test pour enregistrer manuellement une requête dans les métriques.
        """
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=path,
            status=status_code
        ).inc()
        
        REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=path
        ).observe(latency)
        
        return {"message": "Request recorded in metrics"}
    
    return router
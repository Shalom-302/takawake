# backend/app/main.py
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
import socketio
import time

from .core.db import Base, engine, SessionLocal
from app.casbin_setup import get_casbin_enforcer

# Plugins imports
from app.plugins.plugin_manager import load_plugins_into_app, plugin_manager_router
from app.plugins.webhooks.main import get_router as get_webhooks_router
from app.plugins.advanced_audit.main import get_router as get_audit_router
from app.plugins.monitoring.main import get_router as get_monitoring_router
from app.plugins.messaging.main import get_router as get_messaging_router
from app.plugins.websockets.main import get_router as get_websockets_router
from app.plugins.custom_auth.main import get_router as get_auth_providers_router
from app.plugins.api_versioning.main import router as api_versioning_router
from app.plugins.api_versioning.integration import register_with_main_app
from app.plugins.advanced_logging.main import get_router as get_advanced_logging_router
from app.plugins.advanced_scheduler.main import get_router as get_advanced_scheduler_router
from app.plugins.ai_integration.main import router as ai_integration_router
from app.plugins.data_exchange.main import data_exchange_router
from app.plugins.file_storage.main import router as file_storage_router
from app.plugins.privacy_compliance import router as privacy_compliance_router
from app.plugins.pwa_support import router as pwa_support_router
from app.plugins.workflow.main import router as workflow_router

from .routers import auth, admin, migrations, auth_provider, admin_advanced, role

from app.plugins.websockets.main import sio
from .core.config import settings
from app.plugins.sse.stream import Stream
from app.plugins.security.middleware import SecurityMiddlewareEnhanced
from app.plugins.security.intrusion_detection import IntrusionDetector
from app.plugins.security.mfa_service import MFAService
from app.plugins.security.waf import WebApplicationFirewall, ThreatIntelFeed
from app.plugins.security.main import crypto_router
from app.plugins.security.main import app as security_app
from app.plugins.security.security_config import load_security_config

# Ajout pour Prometheus metrics
from prometheus_client import generate_latest, Counter, Summary, Gauge, CONTENT_TYPE_LATEST, CollectorRegistry
import psutil
import logging

# Créer un registre personnalisé pour éviter les conflits avec le plugin de monitoring
REGISTRY = CollectorRegistry()

# Définition des métriques simples avec des préfixes uniques pour éviter les conflits
MAIN_REQUEST_COUNT = Counter('main_http_requests_total', 'Total count of requests', ['method', 'endpoint', 'status'], registry=REGISTRY)
MAIN_REQUEST_TIME = Summary('main_http_request_processing_seconds', 'Time spent processing request', ['method', 'endpoint', 'status'], registry=REGISTRY)

# Définition des métriques système
CPU_USAGE = Gauge('system_cpu_usage', 'CPU usage', registry=REGISTRY)
MEMORY_USAGE = Gauge('system_memory_usage', 'Memory usage', registry=REGISTRY)
DISK_USAGE = Gauge('system_disk_usage', 'Disk usage', registry=REGISTRY)

security_config = load_security_config()

app = FastAPI(title=settings.PROJECT_NAME)

# Add Root metrics endpoint for Prometheus scraping
@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Register Socket.IO app
socket_app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=app,
    # Do not remove this configuration: https://github.com/pyropy/fastapi-socketio/issues/51
    socketio_path='/ws/socket.io',
)
app.mount('/ws', socket_app)

# Override Stream dependency
_stream = Stream()
app.dependency_overrides[Stream] = lambda: _stream

# CORS Middleware
origins = settings.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Advanced Security Middleware
app.add_middleware(
    SecurityMiddlewareEnhanced,
    detector=IntrusionDetector(),
    mfa_service=MFAService(auth_provider="email"),
    waf=WebApplicationFirewall(
        config=security_config.waf,
        intel_feed=ThreatIntelFeed(security_config.waf.threat_intel)
    )
)

# Initialize database tables and load plugins.
def init_db():
    """Initialize database tables and load plugins."""
    db = SessionLocal()
    print("🟢 Initializing database")
    try:
        # (1) load plugins from DB
        load_plugins_into_app(app, db)

        # (2) Optional DB checks or migrations
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        missing_tables = []
        for table_name in Base.metadata.tables.keys():
            if table_name not in existing_tables:
                print(f"🟢 Creating new table: {table_name}")
                missing_tables.append(table_name)
        
        if missing_tables:
            Base.metadata.create_all(
                bind=engine,
                tables=[Base.metadata.tables[name] for name in missing_tables]
            )

        # (3) Casbin rule sync
        enforcer = get_casbin_enforcer()
        print(" Database initialization finished")
    finally:
        db.close()
    print("✅ Startup finished")

@app.on_event("startup")
def on_startup():
    """Initialize database and plugins on application startup."""
    init_db()
    print("✅ Startup finished")

# Initialize API versioning plugin
register_with_main_app(app)
print("🟢 API Versioning initialized")

# (4) Include all your normal app routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(migrations.router, prefix="/admin/migrations", tags=["Migrations"])
app.include_router(admin_advanced.router, prefix="/admin-advanced", tags=["Admin Advanced"])
app.include_router(role.router, prefix="/roles", tags=["Role"])

# Core plugins
app.include_router(get_webhooks_router(), prefix="/plugins/webhooks", tags=["Webhooks"])
app.include_router(get_audit_router(), prefix="/plugins/advanced_audit", tags=["Advanced Audit"])
app.include_router(get_monitoring_router(), prefix="/plugins/monitoring", tags=["Advanced Monitoring"])
app.include_router(get_messaging_router(), prefix="/plugins/messaging", tags=["Messaging"])
app.include_router(get_websockets_router(), prefix="/plugins/websockets", tags=["Websockets"])
app.include_router(get_auth_providers_router(), prefix="/plugins/auth-providers", tags=["Auth Providers"])
app.include_router(crypto_router, prefix="/plugins/security", tags=["Security"])
app.include_router(api_versioning_router, prefix="/plugins/api-versioning", tags=["API Versioning"])

# Additional plugins
app.include_router(get_advanced_logging_router(), prefix="/plugins/advanced-logging", tags=["Advanced Logging"])
app.include_router(get_advanced_scheduler_router(), prefix="/plugins/advanced-scheduler", tags=["Advanced Scheduler"])
app.include_router(ai_integration_router, prefix="/plugins/ai-integration", tags=["AI Integration"])
app.include_router(data_exchange_router, prefix="/plugins/data-exchange", tags=["Data Exchange"])
app.include_router(file_storage_router, prefix="/plugins/file-storage", tags=["File Storage"])
app.include_router(privacy_compliance_router, prefix="/plugins/privacy-compliance", tags=["Privacy Compliance"])
app.include_router(pwa_support_router, prefix="/plugins/pwa-support", tags=["PWA Support"])
app.include_router(workflow_router, prefix="/plugins/workflow", tags=["Workflow"])

# (5) Optionally mount the plugin manager endpoints
# e.g. GET /admin/plugins  or POST /admin/plugins/<plugin>/toggle
app.include_router(plugin_manager_router)

def update_system_metrics():
    """Update system metrics for monitoring"""
    CPU_USAGE.set(psutil.cpu_percent())
    MEMORY_USAGE.set(psutil.virtual_memory().percent)
    DISK_USAGE.set(psutil.disk_usage('/').percent)

@app.get("/metrics")
def read_metrics():
    try:
        # Update system metrics before generating output
        update_system_metrics()
        
        # Generate Prometheus metrics from our custom registry
        output = generate_latest(REGISTRY)
        
        return Response(content=output, media_type=CONTENT_TYPE_LATEST)
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error serving metrics: {str(e)}")
        return Response(
            content=f"Error serving metrics: {str(e)}", 
            status_code=500,
            media_type="text/plain"
        )

@app.get("/")
def read_root():
    return {"message": "Hello from Kaapi backend!"}

# Ajout d'un middleware pour les métriques
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    request_path = request.url.path
    # Ne pas compter les requêtes vers l'endpoint de métriques
    if request_path == "/metrics":
        return await call_next(request)
    
    # Enregistrer le début du traitement
    start_time = time.time()
    
    # Traiter la requête
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        status_code = 500
        raise e
    finally:
        # Mesurer le temps de traitement
        process_time = time.time() - start_time
        # Incrémenter le compteur de requêtes
        MAIN_REQUEST_COUNT.labels(
            method=request.method, 
            endpoint=request_path,
            status=status_code
        ).inc()
        # Enregistrer le temps de traitement
        MAIN_REQUEST_TIME.labels(
            method=request.method,
            endpoint=request_path,
            status=status_code
        ).observe(process_time)
    
    return response

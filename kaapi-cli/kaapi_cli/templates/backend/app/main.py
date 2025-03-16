# backend/app/main.py
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
import socketio
import time
import threading
import logging

from .core.db import Base, engine, SessionLocal
from .core.config import settings
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
from app.plugins.payment.main import init_app as init_payment_plugin
from app.plugins.privacy_compliance import router as privacy_compliance_router
from app.plugins.pwa_support import router as pwa_support_router
from app.plugins.workflow.main import router as workflow_router
from app.plugins.api_gateway.main import initialize_plugin as init_api_gateway_plugin
from app.plugins.api_gateway.main import get_router as get_api_gateway_router
from app.plugins.websockets.main import sio

from app.plugins.sse.stream import Stream
from app.plugins.security.middleware import SecurityMiddlewareEnhanced
from app.plugins.security.intrusion_detection import IntrusionDetector
from app.plugins.security.mfa_service import MFAService
from app.plugins.security.waf import WebApplicationFirewall, ThreatIntelFeed
from app.plugins.security.main import crypto_router
from app.plugins.security.security_config import load_security_config


from .routers import auth, admin, migrations, auth_provider, admin_advanced, role


# Add Prometheus metrics
from prometheus_client import generate_latest, Counter, Summary, Gauge, CONTENT_TYPE_LATEST, CollectorRegistry, REGISTRY as DEFAULT_REGISTRY
import psutil

# Define simple metrics with unique prefixes to avoid conflicts
MAIN_REQUEST_COUNT = Counter('kaapi_http_requests_total', 'Total count of requests', ['method', 'endpoint', 'status'])
MAIN_REQUEST_TIME = Summary('kaapi_http_request_processing_seconds', 'Time spent processing request', ['method', 'endpoint', 'status'])

# Define system metrics
CPU_USAGE = Gauge('kaapi_system_cpu_usage_percent', 'CPU usage percentage', labelnames=['source'])
MEMORY_USAGE = Gauge('kaapi_system_memory_usage_percent', 'Memory usage percentage', labelnames=['source'])
DISK_USAGE = Gauge('kaapi_system_disk_usage_percent', 'Disk usage percentage', labelnames=['source'])

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
        
        # Initialize payment plugin
        init_payment_plugin(app)
        print("🟢 Payment plugin initialized")
    finally:
        db.close()
    print("✅ Startup finished")

@app.on_event("startup")
def on_startup():
    """Initialize database and plugins on application startup."""
    init_db()
    
    # Initialize audit metrics with existing data
    from app.plugins.advanced_audit import initialize_audit_metrics
    from app.core.db import SessionLocal
    db = SessionLocal()
    try:
        initialize_audit_metrics(db)
    finally:
        db.close()
        
    print("✅ Startup finished")

# Initialize API versioning plugin
register_with_main_app(app)
print("🟢 API Versioning initialized")

# Initialize API Gateway plugin
init_api_gateway_plugin(
    app, 
    api_title=settings.PROJECT_NAME + " API",
    api_description="Secure API Gateway for " + settings.PROJECT_NAME,
    api_version="1.0.0"
)
print("🟢 API Gateway initialized")

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
app.include_router(get_api_gateway_router(), prefix="/admin/api-gateway", tags=["API Gateway"])

# (5) Optionally mount the plugin manager endpoints
# e.g. GET /admin/plugins  or POST /admin/plugins/<plugin>/toggle
app.include_router(plugin_manager_router)

def update_system_metrics():
    """Update system metrics for monitoring"""
    try:
        # CPU usage (en pourcentage)
        CPU_USAGE.labels(source="main").set(psutil.cpu_percent())
        
        # Memory usage (en pourcentage)
        MEMORY_USAGE.labels(source="main").set(psutil.virtual_memory().percent)
        
        # Disk usage (en pourcentage)
        DISK_USAGE.labels(source="main").set(psutil.disk_usage('/').percent)
        
        logging.debug(f"Updated system metrics: CPU={psutil.cpu_percent()}%, Memory={psutil.virtual_memory().percent}%, Disk={psutil.disk_usage('/').percent}%")
    except Exception as e:
        logging.error(f"Error updating system metrics: {str(e)}")

# Function to update system metrics in the background
def system_metrics_background_task():
    while True:
        try:
            update_system_metrics()
            time.sleep(5)  # Update every 5 seconds
        except Exception as e:
            logging.error(f"Error in system metrics background task: {str(e)}")
            time.sleep(10)  # Pause longer in case of error

# Start background task to update system metrics
system_metrics_thread = threading.Thread(target=system_metrics_background_task, daemon=True)
system_metrics_thread.start()

@app.get("/metrics")
def read_metrics():
    try:
        # Update system metrics before generating output
        update_system_metrics()
        
        # Generate Prometheus metrics from our custom registry
        output = generate_latest()
        
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

# Add metrics middleware
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    request_path = request.url.path
    # Do not count requests to the metrics endpoint
    if request_path == "/metrics":
        return await call_next(request)
    
    # Record the start time
    start_time = time.time()
    
    # Process the request
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        status_code = 500
        raise e
    finally:
        # Measure the processing time
        process_time = time.time() - start_time
        # Increment the request counter
        MAIN_REQUEST_COUNT.labels(
            method=request.method, 
            endpoint=request_path,
            status=status_code
        ).inc()
        # Record the processing time
        MAIN_REQUEST_TIME.labels(
            method=request.method,
            endpoint=request_path,
            status=status_code
        ).observe(process_time)
    
    return response

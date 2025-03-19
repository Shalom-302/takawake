# backend/app/main.py
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
import time
import threading
import logging
import os

from .core.db import Base, engine, SessionLocal
from .core.config import settings
from app.casbin_setup import get_casbin_enforcer

# Plugins imports
from app.plugins.plugin_manager import load_plugins_into_app, plugin_manager_router
from app.plugins.webhooks.main import get_router as get_webhooks_router
from app.plugins.advanced_audit.main import get_router as get_audit_router
from app.plugins.monitoring.main import get_router as get_monitoring_router
from app.plugins.messaging.main import get_router as get_messaging_router
from app.plugins.api_versioning.main import router as api_versioning_router
from app.plugins.api_versioning.integration import register_with_main_app
from app.plugins.advanced_logging.main import get_router as get_advanced_logging_router
from app.plugins.advanced_scheduler.main import get_router as get_advanced_scheduler_router
from app.plugins.ai_integration.main import router as ai_integration_router
from app.plugins.data_exchange.main import data_exchange_router
from app.plugins.file_storage.main import router as file_storage_router
from app.plugins.payment.main import init_app as init_payment_plugin
from app.plugins.privacy_compliance import router as privacy_compliance_router
from app.plugins.push_notifications.main import router as push_notifications_router
from app.plugins.pwa_support import router as pwa_support_router
from app.plugins.workflow.main import router as workflow_router
from app.plugins.api_gateway.main import initialize_plugin as init_api_gateway_plugin
from app.plugins.api_gateway.main import get_router as get_api_gateway_router
from app.plugins.offline_sync.main import get_router as get_offline_sync_router
from app.plugins.security.middleware import SecurityMiddlewareEnhanced
from app.plugins.security.intrusion_detection import IntrusionDetector
from app.plugins.security.mfa_service import MFAService
from app.plugins.security.waf import WebApplicationFirewall, ThreatIntelFeed
from app.plugins.security.main import crypto_router
from app.plugins.security.security_config import load_security_config
from app.plugins.kyc.main import get_admin_router as get_kyc_admin_router, get_api_router as get_kyc_api_router, on_plugin_init as init_kyc_plugin
from app.plugins.business_alerts.main import business_alerts_plugin
from app.plugins.digital_signature.main import digital_signature_plugin
from app.plugins.recommendation.main import recommendation_plugin
from app.plugins.messaging_service.main import messaging_service
from app.plugins.social_subscriptions.main import setup_social_subscriptions, social_subscriptions_plugin
from app.plugins.advanced_auth import init_app as init_auth_plugin


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

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url=None,  # Désactiver la documentation par défaut
    redoc_url=None,  # Désactiver la redoc par défaut
    openapi_url=None  # Désactiver l'URL openapi par défaut
)

# Add Root metrics endpoint for Prometheus scraping
@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

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

        # (2) Check database structure
        # This approach relies exclusively on migrations for schema management
        from app.core.cli import get_pending_migrations, apply_migrations

        # Check migration status
        migration_info = get_pending_migrations()
        if not migration_info["success"]:
            print(f"⚠️ Migration check failed: {migration_info.get('error', 'Unknown error')}")
            print("⚠️ Database schema might be incomplete")
            print("⚠️ Please run 'alembic revision --autogenerate -m \"initial schema\"' followed by 'alembic upgrade head' to set up the database")
        else:
            # Check if migrations need to be applied
            if "No database revision" in migration_info["current"] or "head" not in migration_info["current"]:
                print("⚠️ Database needs migration. Current state: " + migration_info["current"])
                print("⚠️ Please run 'alembic upgrade head' to apply pending migrations")
                
                # Optionally, you could still try to apply migrations automatically
                # However, we'll leave this commented out to give you full control
                # 
                # print("🟢 Attempting to apply database migrations automatically")
                # result = apply_migrations()
                # if result["success"]:
                #     print("🟢 Migrations applied successfully")
                # else:
                #     print(f"⚠️ Error applying migrations: {result.get('error', 'Unknown error')}")
            else:
                print("🟢 Database schema is up to date")

        # (3) Casbin rule sync
        enforcer = get_casbin_enforcer()
        print("🟢 Database initialization finished")
        
        # Initialize payment plugin
        init_payment_plugin(app)
        print("🟢 Payment plugin initialized")
        
        # Initialize offline sync plugin
        from app.plugins.offline_sync.main import initialize_plugin as init_offline_sync_plugin
        init_offline_sync_plugin(app)
        print("🟢 Offline Sync plugin initialized")
        
        # Initialize KYC plugin
        init_kyc_plugin(app)
        print("🟢 KYC plugin initialized")
        
        # Initialize Business Alerts plugin
        business_alerts_plugin.init_app(app)
        print("🟢 Business Alerts plugin initialized")
        
        # Initialize Digital Signature plugin
        digital_signature_plugin.init_app(app)
        print("🟢 Digital Signature plugin initialized")
        
        # Initialize messaging service plugin
        messaging_service.init_app(app)
        print("🟢 Messaging Service plugin initialized")
        
        # Initialize social subscriptions plugin
        setup_social_subscriptions(app)
        print("🟢 Social Subscriptions plugin initialized")
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
        # Try to initialize audit metrics, but handle database errors gracefully
        # This is necessary because the tables might not exist yet if migrations haven't been run
        try:
            initialize_audit_metrics(db)
        except Exception as e:
            print(f"⚠️ Warning: Could not initialize audit metrics: {e}\n   This is normal if migrations have not yet been applied.")
    finally:
        db.close()
        
    print("✅ Startup finished")

# Initialize API versioning plugin
register_with_main_app(app)
print("🟢 API Versioning initialized")

# Initialize Advanced Authentication plugin
init_auth_plugin(app)
print("🟢 Advanced Authentication plugin initialized")

# Initialize API Gateway plugin
init_api_gateway_plugin(
    app, 
    api_title=settings.PROJECT_NAME + " API",
    api_description="Secure API Gateway for " + settings.PROJECT_NAME,
    api_version="1.0.0"
)
print("🟢 API Gateway initialized")

# (4) Include all your normal app routers

# Core plugins
app.include_router(get_webhooks_router(), prefix="/plugins/webhooks", tags=["Webhooks"])
app.include_router(get_audit_router(), prefix="/plugins/advanced_audit", tags=["Advanced Audit"])
app.include_router(get_monitoring_router(), prefix="/plugins/monitoring", tags=["Advanced Monitoring"])
app.include_router(get_messaging_router(), prefix="/plugins/messaging", tags=["Messaging"])
app.include_router(crypto_router, prefix="/plugins/security", tags=["Security"])
app.include_router(api_versioning_router, prefix="/plugins/api-versioning", tags=["API Versioning"])

# Additional plugins
app.include_router(get_advanced_logging_router(), prefix="/plugins/advanced-logging", tags=["Advanced Logging"])
app.include_router(get_advanced_scheduler_router(), prefix="/plugins/advanced-scheduler", tags=["Advanced Scheduler"])
# Note: advanced_auth plugin is already included via init_auth_plugin, this is just for clarity in the list
app.include_router(ai_integration_router, prefix="/plugins/ai-integration", tags=["AI Integration"])
app.include_router(data_exchange_router, prefix="/plugins/data-exchange", tags=["Data Exchange"])
app.include_router(file_storage_router, prefix="/plugins/file-storage", tags=["File Storage"])
app.include_router(privacy_compliance_router, tags=["Privacy Compliance"])
app.include_router(push_notifications_router, prefix="/plugins/push-notifications", tags=["Push Notifications"])
app.include_router(pwa_support_router, prefix="/plugins/pwa-support", tags=["PWA Support"])
app.include_router(workflow_router, prefix="/plugins/workflow", tags=["Workflow"])
app.include_router(get_api_gateway_router(), prefix="/admin/api-gateway", tags=["API Gateway"])
app.include_router(get_offline_sync_router(), prefix="/plugins/offline-sync", tags=["Offline Sync"])
app.include_router(get_kyc_admin_router(), prefix="/admin", tags=["KYC Admin"])
app.include_router(get_kyc_api_router(), prefix="/api", tags=["KYC"])
app.include_router(business_alerts_plugin.router, prefix="/plugins/business-alerts", tags=["Business Alerts"])
app.include_router(digital_signature_plugin.router, prefix="/plugins/digital-signature", tags=["Digital Signature"])
app.include_router(recommendation_plugin.router, prefix="/plugins/recommendation", tags=["Recommendation"])
app.include_router(messaging_service.router, prefix="/plugins/messaging-service", tags=["Messaging Service"])
app.include_router(social_subscriptions_plugin.router, prefix="/plugins/social-subscriptions", tags=["Social Subscriptions"])

# (5) Optionally mount the plugin manager endpoints
# e.g. GET /admin/plugins  or POST /admin/plugins/<plugin>/toggle
app.include_router(plugin_manager_router)

@app.get("/debug/env", tags=["debug"])
async def debug_env():
    """DEBUG ONLY: Affiche des informations sur les variables d'environnement"""
    facebook_id = os.getenv("FACEBOOK_CLIENT_ID")
    facebook_secret = os.getenv("FACEBOOK_CLIENT_SECRET")
    redirect_uri = os.getenv("FACEBOOK_WEBHOOK_OAUTH_REDIRECT_URI")
    
    # Ne pas exposer les valeurs complètes, seulement leur présence
    return {
        "FACEBOOK_CLIENT_ID": bool(facebook_id),
        "FACEBOOK_CLIENT_ID_LENGTH": len(facebook_id) if facebook_id else 0,
        "FACEBOOK_CLIENT_SECRET": bool(facebook_secret),
        "FACEBOOK_CLIENT_SECRET_LENGTH": len(facebook_secret) if facebook_secret else 0,
        "FACEBOOK_WEBHOOK_OAUTH_REDIRECT_URI": redirect_uri if redirect_uri else None,
        "OAUTH_PROVIDERS": {
            provider: {
                "client_id_set": bool(config.get("client_id")),
                "client_secret_set": bool(config.get("client_secret")),
            }
            for provider, config in settings.OAUTH_PROVIDERS.items()
        }
    }

def update_system_metrics():
    """Update system metrics for monitoring"""
    try:
        # CPU usage (in percentage)
        CPU_USAGE.labels(source="main").set(psutil.cpu_percent())
        
        # Memory usage (in percentage)
        MEMORY_USAGE.labels(source="main").set(psutil.virtual_memory().percent)
        
        # Disk usage (in percentage)
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

# Ajouter manuellement les routes de documentation
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.openapi.utils import get_openapi

@app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint():
    return get_openapi(title=settings.PROJECT_NAME, version="1.0.0", routes=app.routes)

@app.get("/docs", include_in_schema=False)
async def get_docs():
    return get_swagger_ui_html(openapi_url="/openapi.json", title=settings.PROJECT_NAME)

@app.get("/redoc", include_in_schema=False)
async def get_redoc():
    return get_redoc_html(openapi_url="/openapi.json", title=settings.PROJECT_NAME)

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

# backend/app/main.py
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
import time
import threading
import logging
import os
import uuid
import time
from typing import Optional
from fastapi import Query

from .core.db import Base, engine, SessionLocal
from .core.config import settings
from app.casbin_setup import get_casbin_enforcer



# Middleware imports
from app.plugins.security.middleware import SecurityMiddlewareEnhanced
from app.plugins.security.intrusion_detection import IntrusionDetector
from app.plugins.security.mfa_service import MFAService
from app.plugins.security.waf import WebApplicationFirewall, ThreatIntelFeed

# Plugins imports
from app.plugins.plugin_manager import load_plugins_into_app, plugin_manager_router

from app.plugins.advanced_auth import auth_router
from app.plugins.webhooks import webhooks_router
from app.plugins.advanced_audit.main import get_router as get_audit_router
from app.plugins.monitoring import monitoring_router

from app.plugins.security import security_router
from app.plugins.business_alerts import business_alerts_router
from app.plugins.digital_signature import digital_signature_router
from app.plugins.recommendation import recommendation_router

from app.plugins.pwa_support import pwa_support_router
from app.plugins.workflow import workflow_router
from app.plugins.api_versioning import api_versioning_router, register_with_main_app
from app.plugins.advanced_logging import advanced_logging_router
from app.plugins.advanced_scheduler import advanced_scheduler_router
from app.plugins.ai_integration import ai_integration_router
from app.plugins.data_exchange import data_exchange_router
from app.plugins.file_storage import file_storage_router, file_storage_public_router
from app.plugins.payment import payment_router
from app.plugins.privacy_compliance import privacy_compliance_router
from app.plugins.kyc import kyc_admin_router, kyc_api_router
from app.plugins.offline_sync import offline_sync_router
from app.plugins.social_subscriptions import social_subscriptions_router

from app.plugins.messaging_service.main import messaging_service_router
from app.plugins.push_notifications import push_notifications_router
from app.plugins.api_gateway import api_gateway_router
from app.plugins.security.security_config import load_security_config

from app.api.push import router as push_router
from app.api.health_check import health_check_router

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
    docs_url=None,  # Disable default documentation
    redoc_url=None,  # Disable redoc@
    openapi_url=None  # Disable openapi URL
)

# Add direct WebSocket routes before all middleware
# This approach ensures that WebSocket connections are not intercepted by middlewares
@app.websocket(f"{settings.API_PREFIX}/ws-root/{{conversation_id}}")
async def websocket_root(websocket: WebSocket, conversation_id: str):
    """
    Base WebSocket endpoint that ignores all verifications
    but integrates the messaging service for a complete experience
    """
    import uuid
    from app.plugins.messaging_service.main import messaging_service
    from datetime import datetime
    
    print(f"Tentative de connexion WebSocket ROOT pour la conversation: {conversation_id}")
    await websocket.accept()
    
    # Create a temporary user ID for this session
    temp_user_id = str(uuid.uuid4())
    
    try:
        # Send a welcome message
        await websocket.send_json({
            "type": "connection_established",
            "data": {
                "conversation_id": conversation_id,
                "user_id": temp_user_id,
                "status": "connected"
            }
        })
        
        # Connect to the WebSocket manager
        from app.plugins.messaging_service.utils.websocket_manager import MessageWebSocketManager
        
        # Check if the messaging service has a websocket manager
        if not hasattr(messaging_service, 'websocket_manager'):
            # Create a temporary websocket manager for this session
            websocket_manager = MessageWebSocketManager()
            print("[WS-ROOT] Création d'un gestionnaire WebSocket temporaire")
        else:
            websocket_manager = messaging_service.websocket_manager
            print("[WS-ROOT] Utilisation du gestionnaire WebSocket du service de messagerie")
        
        # Connect the client to the manager
        await websocket_manager.connect(websocket, temp_user_id, conversation_id, already_accepted=True)
        print(f"[WS-ROOT] Client connecté: {temp_user_id} à conversation: {conversation_id}")
        
        # Message listening loop
        while True:
            try:
                # Attendre un message avec une gestion appropriée des déconnexions
                data = await websocket.receive_json()
                print(f"[WS-ROOT] Message reçu: {data}")
                
                # Process the message based on its type
                if "type" in data:
                    if data["type"] == "message":
                        # Create a message with the minimal required data in the format expected by the frontend
                        message_id = str(uuid.uuid4())
                        current_time = datetime.now()
                        message = {
                            "id": message_id,
                            "sender_id": temp_user_id,  # Le frontend attend sender_id et non user_id
                            "content": data.get("content", ""),
                            "timestamp": current_time.isoformat(),  # Forme ISO standard pour éviter les problèmes de sérialisation
                            "created_at": current_time.isoformat(),  # Ajouter created_at que le frontend attend probablement
                            "conversation_id": conversation_id,
                            "username": "Utilisateur temporaire", # Pour l'affichage
                            "message_type": "text",  # Type de message attendu par le frontend
                            "status": "sent",  # Statut initial du message
                            "is_edited": False,  # Champs supplémentaires qui peuvent être attendus par le frontend
                            "is_deleted": False,
                            "is_read": False
                        }
                        
                        # Broadcast the message to all clients connected to this conversation
                        # using the format expected by the frontend (WebSocketMessageType.MESSAGE)
                        try:
                            print(f"[WS-ROOT] Tentative de diffusion du message: {message_id} à la conversation: {conversation_id}")
                            print(f"[WS-ROOT] Utilisateurs dans la conversation selon WebSocket manager: {websocket_manager.conversation_users.get(conversation_id, set())}")
                            print(f"[WS-ROOT] Expéditeur à exclure: {temp_user_id}")
                            
                            await websocket_manager.broadcast_to_conversation(
                                conversation_id,
                                {
                                    "type": "message",
                                    "data": message
                                },
                                exclude_user_id=temp_user_id
                            )
                            print(f"[WS-ROOT] Message diffusé: {message_id}")
                            
                            # Confirmer la réception du message
                            await websocket.send_json({
                                "type": "message_received",
                                "data": {
                                    "message_id": message_id
                                }
                            })
                        except Exception as broadcast_error:
                            print(f"[WS-ROOT] Erreur lors de la diffusion du message: {str(broadcast_error)}")
                            
                    elif data["type"] == "typing":
                        # Diffuser l'indication de frappe
                        try:
                            is_typing = data.get("is_typing", False)
                            await websocket_manager.broadcast_to_conversation(
                                conversation_id,
                                {
                                    "type": "typing_indicator", 
                                    "data": {
                                        "user_id": temp_user_id,
                                        "username": "Utilisateur temporaire",
                                        "is_typing": is_typing,
                                        "conversation_id": conversation_id
                                    }
                                },
                                exclude_user_id=temp_user_id  # Ne pas envoyer à soi-même
                            )
                            print(f"[WS-ROOT] Indicateur de frappe diffusé: {is_typing}")
                        except Exception as typing_error:
                            print(f"[WS-ROOT] Erreur lors de la diffusion de l'indicateur de frappe: {str(typing_error)}")
                    
                    elif data["type"] == "read_receipt":
                        # Traiter et diffuser l'accusé de lecture
                        try:
                            # Extraire les données du message lu
                            receipt_data = data.get("data", {})
                            message_id = receipt_data.get("message_id")
                            reader_id = receipt_data.get("reader_id")
                            reader_name = receipt_data.get("reader_name", "Utilisateur")
                            
                            print(f"[WS-ROOT] Accusé de lecture reçu: message {message_id} lu par {reader_id} ({reader_name})")
                            
                            # Diffuser l'accusé de lecture dans la conversation
                            # Ne pas l'envoyer au lecteur lui-même (il sait déjà qu'il a lu le message)
                            await websocket_manager.broadcast_to_conversation(
                                conversation_id,
                                {
                                    "type": "read_receipt",
                                    "data": {
                                        "message_id": message_id,
                                        "reader_id": reader_id,
                                        "reader_name": reader_name,
                                        "conversation_id": conversation_id,
                                        "timestamp": datetime.now().isoformat()
                                    }
                                },
                                exclude_user_id=reader_id  # Ne pas renvoyer au lecteur
                            )
                            print(f"[WS-ROOT] Accusé de lecture diffusé pour le message: {message_id}")
                        except Exception as read_receipt_error:
                            print(f"[WS-ROOT] Erreur lors de la diffusion de l'accusé de lecture: {str(read_receipt_error)}")
                    
                    elif data["type"] == "ping":
                        # Renvoyer un pong pour maintenir la connexion active
                        await websocket.send_json({
                            "type": "pong",
                            "timestamp": time.time()
                        })
                        
                    else:
                        # Pour les autres types de messages, simplement les renvoyer en écho
                        await websocket.send_json({
                            "type": "echo",
                            "original": data,
                            "timestamp": time.time()
                        })
            
            except WebSocketDisconnect:
                print(f"[WS-ROOT] WebSocket déconnecté pour l'utilisateur {temp_user_id} dans la conversation {conversation_id}")
                # Nettoyer la connexion et sortir de la boucle
                websocket_manager.disconnect(temp_user_id, conversation_id)
                # Informer les autres utilisateurs de la déconnexion
                try:
                    await websocket_manager.broadcast_to_conversation(
                        conversation_id,
                        {
                            "type": "user_presence",
                            "data": {
                                "user_id": temp_user_id,
                                "status": "offline",
                                "timestamp": time.time()
                            }
                        },
                        exclude_user_id=temp_user_id
                    )
                except Exception as e:
                    print(f"[WS-ROOT] Erreur lors de la notification de déconnexion: {str(e)}")
                break  # Sortir de la boucle while

            except Exception as e:
                print(f"[WS-ROOT] Erreur lors de la réception ou du traitement du message: {str(e)}")
                # En cas d'erreur grave, on sort de la boucle pour éviter les boucles infinies
                if "disconnect message has been received" in str(e):
                    print(f"[WS-ROOT] Déconnexion détectée, fin de la boucle de réception")
                    # Nettoyer proprement
                    websocket_manager.disconnect(temp_user_id, conversation_id)
                    break
                
    except WebSocketDisconnect:
        print(f"[WS-ROOT] WebSocket déconnecté pour la conversation {conversation_id}")
        # Nettoyer la connexion
        if hasattr(messaging_service, 'websocket_manager'):
            messaging_service.websocket_manager.disconnect(temp_user_id, conversation_id)
            print(f"[WS-ROOT] Client déconnecté du gestionnaire: {temp_user_id}")
    
    except Exception as e:
        print(f"[WS-ROOT] Erreur générale: {str(e)}")
        # Essayer de nettoyer la connexion en cas d'erreur
        try:
            if hasattr(messaging_service, 'websocket_manager'):
                messaging_service.websocket_manager.disconnect(temp_user_id, conversation_id)
        except:
            pass

# Add a specific WebSocket route for global connections
@app.websocket(f"{settings.API_PREFIX}/ws-root/global")
async def websocket_root_global(websocket: WebSocket, token: Optional[str] = Query(None), user_id: Optional[str] = Query(None)):
    """
    WebSocket endpoint for global connections that handles real-time updates across the application
    """
    import uuid
    from app.plugins.messaging_service.routes.websocket_routes import handle_global_websocket
    
    print(f"Tentative de connexion WebSocket global avec token: {token and token[:10]}...")
    
    if not user_id:
        user_id = f"user-{int(time.time() * 1000)}"
    
    # Pass the connection to the handler in the messaging service
    await handle_global_websocket(websocket, token, user_id)

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
# app.add_middleware(
#     SecurityMiddlewareEnhanced,
#     detector=IntrusionDetector(),
#     mfa_service=MFAService(auth_provider="email"),
#     waf=WebApplicationFirewall(
#         config=security_config.waf,
#         intel_feed=ThreatIntelFeed(security_config.waf.threat_intel)
#     )
# )

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
        
    finally:
        # Make sure to close the database connection
        db.close()
        
        print("🚀 Event startup complete!")

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

# Create an APIRouter to group all API routes under the configured prefix
api_router = APIRouter(prefix=settings.API_PREFIX)

# (4) Include all your normal app routers under the /api prefix

# Core plugins
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(webhooks_router, prefix="/webhooks", tags=["Webhooks"])
api_router.include_router(get_audit_router(), prefix="/advanced_audit", tags=["Advanced Audit"])
api_router.include_router(monitoring_router, prefix="/monitoring", tags=["Advanced Monitoring"])
api_router.include_router(messaging_service_router, prefix="/messaging", tags=["Messaging Service"])
api_router.include_router(security_router, prefix="/security", tags=["Security"])
api_router.include_router(api_versioning_router, prefix="/versioning", tags=["API Versioning"], include_in_schema=False)
# Additional plugins
api_router.include_router(payment_router, prefix="/payment", tags=["Payment"])
api_router.include_router(advanced_logging_router, prefix="/advanced-logging", tags=["Advanced Logging"])
api_router.include_router(advanced_scheduler_router, prefix="/advanced-scheduler", tags=["Advanced Scheduler"])
api_router.include_router(ai_integration_router, prefix="/ai-integration", tags=["AI Integration"])
api_router.include_router(data_exchange_router, prefix="/data-exchange", tags=["Data Exchange"])
# api_router.include_router(file_storage_router, prefix="/file-storage", tags=["File Storage"])
api_router.include_router(privacy_compliance_router, prefix="/privacy", tags=["Privacy Compliance"])
api_router.include_router(push_notifications_router, prefix="/push-notifications", tags=["Push Notifications"])
api_router.include_router(pwa_support_router, prefix="/pwa-support", tags=["PWA Support"])
api_router.include_router(workflow_router, prefix="/workflow", tags=["Workflow"])
api_router.include_router(api_gateway_router, prefix="/api-gateway", tags=["API Gateway"])
api_router.include_router(offline_sync_router, prefix="/offline-sync", tags=["Offline Sync"])
api_router.include_router(kyc_admin_router, prefix="/kyc-admin", tags=["KYC Admin"])
api_router.include_router(kyc_api_router, prefix="/kyc", tags=["KYC"])
api_router.include_router(business_alerts_router, prefix="/business-alerts", tags=["Business Alerts"])
api_router.include_router(digital_signature_router, prefix="/digital-signature", tags=["Digital Signature"])
api_router.include_router(recommendation_router, prefix="/recommendation", tags=["Recommendation"])
api_router.include_router(social_subscriptions_router, prefix="/social-subscriptions", tags=["Social Subscriptions"])

# API Routes
api_router.include_router(health_check_router, tags=["system"])
api_router.include_router(push_router, tags=["push"])

# Inclure le router API principal dans l'application
app.include_router(api_router)

# Ajouter le router public de stockage de fichiers directement à l'application
app.include_router(file_storage_router, prefix=f"{settings.API_PREFIX}/public/file-storage", tags=["File Storage Public"])

# (5) Optionally mount the plugin manager endpoints
# e.g. GET /admin/plugins  or POST /admin/plugins/<plugin>/toggle
app.include_router(plugin_manager_router, prefix=f"{settings.API_PREFIX}/admin")

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

# Add Root metrics endpoint for Prometheus scraping
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

@app.on_event("shutdown")
async def shutdown():
    """
    Shutdown event handler
    """
    print("🛑 Application shutdown, performing cleanup tasks...")
    
    # Gracefully stop API gateway
    # close_api_gateway()
    
    # Close database connections
    print("🔄 Closing database connections...")
    
    print("✅ Shutdown complete")

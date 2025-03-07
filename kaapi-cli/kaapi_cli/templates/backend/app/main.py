# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
import socketio

from .db import Base, engine, SessionLocal
from app.casbin_setup import get_casbin_enforcer
from app.plugins.plugin_manager import load_plugins_into_app, plugin_manager_router
from app.plugins.webhooks.main import get_router as get_webhooks_router
from app.plugins.advanced_audit.main import get_router as get_audit_router
from app.plugins.monitoring.main import get_router as get_monitoring_router
from app.plugins.messaging.main import get_router as get_messaging_router
from app.plugins.websockets.main import get_router as get_websockets_router
from app.plugins.custom_auth.main import get_router as get_auth_providers_router
from .routers import auth, admin, migrations, auth_provider, admin_advanced, role
from app.plugins.websockets.main import sio
from .core.config import settings
from app.plugins.sse.stream import Stream

app = FastAPI(title=settings.PROJECT_NAME)

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

# CORS
origins = settings.CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

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

# (4) Include all your normal app routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(migrations.router, prefix="/admin/migrations", tags=["Migrations"])
app.include_router(admin_advanced.router, prefix="/admin-advanced", tags=["Admin Advanced"])
app.include_router(role.router, prefix="/roles", tags=["Role"])
app.include_router(get_webhooks_router(), prefix="/plugins/webhooks", tags=["Webhooks"])
app.include_router(get_audit_router(), prefix="/plugins/advanced_audit", tags=["Advanced Audit"])
app.include_router(get_monitoring_router(), prefix="/plugins/monitoring", tags=["Advanced Monitoring"])
app.include_router(get_messaging_router(), prefix="/plugins/messaging", tags=["Messaging"])
app.include_router(get_websockets_router(), prefix="/plugins/websockets", tags=["Websockets"])
app.include_router(get_auth_providers_router(), prefix="/plugins/auth-providers", tags=["Auth Providers"])



# (5) Optionally mount the plugin manager endpoints
# e.g. GET /admin/plugins  or POST /admin/plugins/<plugin>/toggle
app.include_router(plugin_manager_router)

@app.get("/")
def read_root():
    return {"message": "Hello from Kaapi backend!"}

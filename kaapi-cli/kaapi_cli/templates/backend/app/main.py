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

from .routers import auth, admin, migrations, auth_provider, admin_advanced, role
from app.plugins.websockets.main import sio

app = FastAPI()

# Register Socket.IO app
socket_app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=app,
    # Do not remove this configuration: https://github.com/pyropy/fastapi-socketio/issues/51
    socketio_path='/ws/socket.io',
)
app.mount('/ws', socket_app)

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
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
    db.close()
    print("✅ Startup finished")

# (4) Include all your normal app routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(migrations.router, prefix="/admin/migrations", tags=["Migrations"])
app.include_router(auth_provider.router, prefix="/auth-providers", tags=["Auth Providers"])
app.include_router(admin_advanced.router, prefix="/admin-advanced", tags=["Admin Advanced"])
app.include_router(role.router, prefix="/roles", tags=["Role"])
app.include_router(get_webhooks_router(), prefix="/plugins/webhooks", tags=["Webhooks"])
app.include_router(get_audit_router(), prefix="/plugins/advanced_audit", tags=["Advanced Audit"])

# (5) Optionally mount the plugin manager endpoints
# e.g. GET /admin/plugins  or POST /admin/plugins/<plugin>/toggle
app.include_router(plugin_manager_router)

@app.get("/")
def read_root():
    return {"message": "Hello from Kaapi backend!"}


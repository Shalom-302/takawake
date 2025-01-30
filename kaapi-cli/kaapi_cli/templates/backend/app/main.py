# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from .routers import auth, admin, migrations, auth_provider, admin_advanced, role


app = FastAPI()

# Allow requests from frontend
origins = [
    "http://localhost:3000",  # Frontend URL
    "http://127.0.0.1:3000",  # Alternative localhost
    "*"  # Allow all origins (optional, use only for development)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Enable credentials (if needed for authentication)
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Base.metadata.create_all(bind=engine)
    pass

@app.get("/")
def read_root():
    return {"message": "Hello from Kaapi backend!"}

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(migrations.router, prefix="/admin/migrations", tags=["Migrations"])
app.include_router(auth_provider.router, prefix="/auth-providers", tags=["Auth Providers"])
app.include_router(admin_advanced.router, prefix="/admin-advanced", tags=["Admin Advanced"])
app.include_router(role.router, prefix="/roles", tags=["Role"])

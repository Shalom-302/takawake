# backend/migrations/env.py
from logging.config import fileConfig
import os
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# This is the Alembic Config object, which provides access to values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# Import your models' Base metadata
# e.g. if your models are in backend/app/db.py or separate files, do something like:
from app.db import Base  # <--- adjust if your structure is different
# or import them all so the metadata includes every table
from app.models.user import User
# from backend.app.models.post import Post
# etc.

# this is the Alembic "target metadata"
target_metadata = Base.metadata

# typically, you might load DB_URL from your .env or config
DB_URL = os.getenv("DB_URL", "sqlite:///./dev.db")
config.set_main_option("sqlalchemy.url", DB_URL)

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    # ...
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        url=DB_URL,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,       # allows Alembic to detect column type changes
            compare_server_default=True
        )

        with context.begin_transaction():
            context.run_migrations()

def run_migrations():
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()

run_migrations()

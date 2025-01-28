from logging.config import fileConfig
import os
from sqlalchemy import engine_from_config, pool
from alembic import context

# The Alembic Config object
config = context.config

fileConfig(config.config_file_name)

# 1) Import the 'Base' from your models package
#    "app.models.__init__.py" should import all actual model files 
#    (comment.py, post.py, etc.) so that Base.metadata includes them all.
from app.models import Base

target_metadata = Base.metadata

# 2) Load DB_URL from environment (or fallback)
DB_URL = os.getenv("DB_URL", "sqlite:///./dev.db")

# 3) Tell Alembic which DB to connect to
config.set_main_option("sqlalchemy.url", DB_URL)

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
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
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()

def run_migrations():
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()

run_migrations()

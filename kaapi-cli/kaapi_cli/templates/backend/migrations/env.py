from logging.config import fileConfig
import os
from sqlalchemy import engine_from_config, pool
from alembic import context

# The Alembic Config object
config = context.config

fileConfig(config.config_file_name)

from app.db import Base
from app.models import *

target_metadata = Base.metadata

# 2) Load DB_URL from environment (or fallback)
DB_URL = os.getenv("DB_URL", "sqlite:///./dev.db")

# 3) Tell Alembic which DB to connect to
config.set_main_option("sqlalchemy.url", DB_URL)


def include_object(object, name, type_, reflected, compare_to):
    # Exclure la table 'casbin_rule' des migrations autogénérées
    if type_ == "table" and name == "casbin_rule":
        return False
    return True

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
            include_object=include_object,
        )
        with context.begin_transaction():
            context.run_migrations()

def run_migrations():
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()

run_migrations()

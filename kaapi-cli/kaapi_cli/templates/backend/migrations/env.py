from logging.config import fileConfig
import os
from sqlalchemy import engine_from_config, pool, MetaData, Table, inspect, text
from alembic import context
from datetime import datetime
import json
import shutil
from app.core.config import settings

# The Alembic Config object
config = context.config

fileConfig(config.config_file_name)

from app.db import Base
from app.models import *

target_metadata = Base.metadata

# 2) Load DB_URL from environment (or fallback)
DB_URL = settings.DB_URL

# 3) Tell Alembic which DB to connect to
config.set_main_option("sqlalchemy.url", DB_URL)


def include_object(object, name, type_, reflected, compare_to):
    # Exclure la table 'casbin_rule' des migrations autogénérées
    if type_ == "table" and name == "casbin_rule":
        return False
    return True

def generate_schema_visualization(connection):
    """Generate database schema visualization in both high-level and detailed formats."""
    inspector = inspect(connection)
    schema_info = {
        "tables": {},
        "relationships": []
    }
    
    # Collect table information
    for table_name in inspector.get_table_names():
        if table_name == "casbin_rule":
            continue
            
        columns = inspector.get_columns(table_name)
        foreign_keys = inspector.get_foreign_keys(table_name)
        indices = inspector.get_indexes(table_name)
        
        schema_info["tables"][table_name] = {
            "columns": [
                {
                    "name": col["name"],
                    "type": str(col["type"]),
                    "nullable": col["nullable"],
                    "primary_key": col.get("primary_key", False),
                    "default": str(col["default"]) if col.get("default") else None,
                } for col in columns
            ],
            "indices": [
                {
                    "name": idx["name"],
                    "unique": idx["unique"],
                    "columns": idx["column_names"]
                } for idx in indices
            ]
        }
        
        # Add relationships
        for fk in foreign_keys:
            schema_info["relationships"].append({
                "source_table": table_name,
                "source_columns": fk["constrained_columns"],
                "target_table": fk["referred_table"],
                "target_columns": fk["referred_columns"]
            })
    
    # Create docs directory if it doesn't exist
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs")
    os.makedirs(docs_dir, exist_ok=True)
    
    # Save schema information with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save detailed schema
    detailed_schema_file = os.path.join(docs_dir, f"db_schema_detailed_{timestamp}.json")
    with open(detailed_schema_file, "w") as f:
        json.dump(schema_info, f, indent=2)
    
    # Save latest version
    latest_schema_file = os.path.join(docs_dir, "db_schema_detailed_latest.json")
    with open(latest_schema_file, "w") as f:
        json.dump(schema_info, f, indent=2)
    
    # Generate high-level schema (just tables and their relationships)
    high_level_schema = {
        "tables": list(schema_info["tables"].keys()),
        "relationships": [
            {
                "source": rel["source_table"],
                "target": rel["target_table"]
            } for rel in schema_info["relationships"]
        ]
    }
    
    # Save high-level schema
    high_level_file = os.path.join(docs_dir, f"db_schema_high_level_{timestamp}.json")
    with open(high_level_file, "w") as f:
        json.dump(high_level_schema, f, indent=2)
    
    # Save latest high-level version
    latest_high_level_file = os.path.join(docs_dir, "db_schema_high_level_latest.json")
    with open(latest_high_level_file, "w") as f:
        json.dump(high_level_schema, f, indent=2)
    
    # Copy visualization template if it doesn't exist in the target directory
    template_dir = os.path.join(docs_dir, "templates")
    os.makedirs(template_dir, exist_ok=True)
    
    # Copy schema visualizer template
    template_path = os.path.join(os.path.dirname(__file__), "schema_visualizer.html")
    target_path = os.path.join(template_dir, "schema_visualizer.html")
    shutil.copy(template_path, target_path)
    
    # Create index.html that redirects to the visualizer
    index_html = os.path.join(docs_dir, "index.html")
    with open(index_html, "w") as f:
        f.write("""<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=templates/schema_visualizer.html">
</head>
<body>
    <p>Redirecting to schema visualizer...</p>
</body>
</html>""")

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
    
    # Create engine to generate schema documentation
    engine = engine_from_config(
        {"sqlalchemy.url": url},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with engine.connect() as connection:
        generate_schema_visualization(connection)

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
        
        # Generate schema documentation
        generate_schema_visualization(connection)

def run_migrations():
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()

run_migrations()

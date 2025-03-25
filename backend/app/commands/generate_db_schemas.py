"""
Generate database schemas documentation for Kaapi.

This script creates visual representations of the database schemas and
saves them to the docs/ directory.

Usage:
    python -m app.commands.generate_db_schemas
"""
import os
import importlib
from pathlib import Path
from sqlalchemy_schemadisplay import create_schema_graph
import sqlalchemy

from app.core.db import Base
from app.plugins.plugin_manager import load_plugins_into_app

# Import all models to ensure they are loaded
import app.models


def get_project_root() -> Path:
    """Return the path to the project root directory."""
    return Path(__file__).resolve().parent.parent.parent.parent


def import_all_models():
    """
    Ensures that all models defined in the application are loaded,
    including those defined in plugins.
    """
    # Import models from the main application
    importlib.import_module("app.models")
    
    # Import models from plugins
    plugins_path = Path(__file__).resolve().parent.parent / "plugins"
    if plugins_path.exists():
        for plugin_dir in plugins_path.iterdir():
            if not plugin_dir.is_dir() or plugin_dir.name.startswith("_"):
                continue
                
            models_path = plugin_dir / "models.py"
            if models_path.exists():
                module_name = f"app.plugins.{plugin_dir.name}.models"
                try:
                    importlib.import_module(module_name)
                except Exception as e:
                    print(f"Error importing models from plugin {plugin_dir.name}: {e}")


def generate_schema_diagram():
    """
    Generates a visual diagram of the database schema and saves it to the docs directory.
    """
    # Ensure all models are loaded
    import_all_models()
    
    # Create output directory if it doesn't exist
    root_dir = get_project_root()
    output_dir = root_dir / "docs" / "db_schema"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate graph
    graph = create_schema_graph(
        metadata=Base.metadata,
        show_datatypes=True,
        show_indexes=True,
        rankdir='LR',
        concentrate=False
    )
    
    # Save as PNG
    png_path = output_dir / "db_schema.png"
    graph.write_png(str(png_path))
    print(f"Database schema diagram saved to {png_path}")
    
    # Save as PDF
    pdf_path = output_dir / "db_schema.pdf"
    graph.write_pdf(str(pdf_path))
    print(f"Database schema diagram saved to {pdf_path}")


def generate_text_schema():
    """
    Generates a text description of the database schema and saves it to the docs directory.
    """
    # Ensure all models are loaded
    import_all_models()
    
    # Create output directory if it doesn't exist
    root_dir = get_project_root()
    output_dir = root_dir / "docs" / "db_schema"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate text description
    text_path = output_dir / "schema_description.md"
    
    with open(text_path, "w") as f:
        f.write("# Database Schema Documentation\n\n")
        
        for table_name in sorted(Base.metadata.tables.keys()):
            table = Base.metadata.tables[table_name]
            
            f.write(f"## {table_name}\n\n")
            
            # Describe columns
            f.write("### Columns\n\n")
            f.write("| Name | Type | Nullable | Default | Primary Key | Foreign Key |\n")
            f.write("|------|------|----------|---------|-------------|-------------|\n")
            
            for column in table.columns:
                nullable = "Yes" if column.nullable else "No"
                default = str(column.default.arg) if column.default is not None and column.default.arg is not None else ""
                primary_key = "Yes" if column.primary_key else "No"
                
                foreign_key = ""
                if column.foreign_keys:
                    fks = list(column.foreign_keys)
                    if fks:
                        foreign_key = f"{fks[0].column.table.name}.{fks[0].column.name}"
                
                f.write(f"| {column.name} | {column.type} | {nullable} | {default} | {primary_key} | {foreign_key} |\n")
            
            f.write("\n")
            
            # Describe indexes
            if table.indexes:
                f.write("### Indexes\n\n")
                f.write("| Name | Columns | Unique |\n")
                f.write("|------|---------|--------|\n")
                
                for index in table.indexes:
                    columns = ", ".join(column.name for column in index.columns)
                    unique = "Yes" if index.unique else "No"
                    
                    f.write(f"| {index.name} | {columns} | {unique} |\n")
                
                f.write("\n")
    
    print(f"Database schema description saved to {text_path}")


def main():
    """Main entry point for the script."""
    try:
        # Ensure all models are loaded
        import_all_models()
        
        # Generate schema diagrams
        generate_schema_diagram()
        
        # Generate text description
        generate_text_schema()
        
        return True
    except Exception as e:
        print(f"Error generating database schemas: {e}")
        return False


if __name__ == "__main__":
    main()

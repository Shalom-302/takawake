"""
Main CLI entry point for Kaapi management commands.
"""
import typer
from rich.console import Console
from typing import Optional

# Import sub-commands
from app.commands.migrate import app as migrate_app

# Main app
app = typer.Typer(help="Kaapi - Management CLI")
console = Console()

# Add sub-commands
app.add_typer(migrate_app, name="db", help="Database migration commands")

@app.command()
def info():
    """Display information about the Kaapi installation."""
    from app.core.config import settings
    
    console.print("[bold blue]Kaapi Information[/bold blue]")
    console.print(f"Project Name: {settings.PROJECT_NAME}")
    console.print(f"Environment: {settings.ENVIRONMENT}")
    console.print(f"API Version: {settings.API_V1_STR}")
    console.print(f"Database URL: {settings.DB_URL.replace('://', '://***:***@')}")

@app.callback()
def main(ctx: typer.Context):
    """
    Kaapi CLI - Manage your Kaapi application.
    """
    pass

if __name__ == "__main__":
    app()

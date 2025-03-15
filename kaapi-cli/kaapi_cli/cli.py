# kaapi-cli/kaapi_cli/cli.py
import typer
from pathlib import Path
import os
import shutil
import subprocess

# 1. Import the shared codegen utilities
#    Adjust the import path depending on where codegen.py actually lives.
#    If "backend/app/codegen.py" is not in the same repository as the CLI,
#    you might need a relative path or a separate Python package.
from .codegen import (
    generate_model_file,
    generate_router_file,
    include_router_in_main,
)

app = typer.Typer(help="Kaapi CLI - Manage your Kaapi projects easily.")

# A "db_app" for DB commands:
db_app = typer.Typer(help="Database related commands.")
app.add_typer(db_app, name="db")

@db_app.command("migrate")
def db_migrate():
    """
    Autogenerate a new Alembic revision for *all* changes, then upgrade to head.
    """
    try:
        typer.echo("Autogenerating Alembic revision...")
        subprocess.check_call(["alembic", "revision", "--autogenerate", "-m", "Kaapi global changes"])

        typer.echo("Upgrading to head...")
        subprocess.check_call(["alembic", "upgrade", "head"])

        typer.secho("Migration complete!", fg=typer.colors.GREEN)
    except subprocess.CalledProcessError:
        typer.secho("Alembic command failed", fg=typer.colors.RED)
        raise typer.Exit(code=1)
    
# Sub-Typer for 'generate' commands
generate_app = typer.Typer(help="Generate new components (models, routes, etc.).")
app.add_typer(generate_app, name="generate")


@generate_app.command("resource")
def generate_resource():
    """
    Generate a new resource (model + CRUD router).
    """
    typer.echo("Generating a new resource...")

    # 1. Verify we have a 'backend/app/models' and 'backend/app/routers' folder
    current_dir = Path.cwd()
    backend_dir = current_dir / "backend"
    models_dir = backend_dir / "app" / "models"
    routers_dir = backend_dir / "app" / "routers"
    main_file = backend_dir / "app" / "main.py"

    if not models_dir.exists() or not routers_dir.exists():
        typer.secho(
            "Error: 'models/' or 'routers/' folder not found in backend/app/. "
            "Ensure you're in a Kaapi project folder.",
            fg=typer.colors.RED
        )
        raise typer.Exit(code=1)

    # 2. Prompt for the resource name
    resource_name = typer.prompt("Enter resource name (e.g. Post, Product, User)")
    resource_name_lower = resource_name.lower()

    # 3. Prompt for fields
    typer.echo("Define fields (e.g. title:str, published:bool=True). Enter 'done' to finish.")
    fields_input = []
    while True:
        field_input = typer.prompt("Field definition (or 'done')", default="done")
        if field_input.lower() == "done":
            break
        fields_input.append(field_input.strip())

    # 4. Parse fields into a list of dicts
    fields = []
    for f in fields_input:
        if ":" not in f:
            typer.secho(f"Skipping invalid field definition '{f}'", fg=typer.colors.YELLOW)
            continue
        name_part, type_default_part = f.split(":", 1)
        name_part = name_part.strip()
        type_default_part = type_default_part.strip()

        default_value = None
        if "=" in type_default_part:
            t, d = type_default_part.split("=", 1)
            field_type = t.strip()
            default_value = d.strip()
        else:
            field_type = type_default_part

        fields.append({"name": name_part, "type": field_type, "default": default_value})

    # 5. Generate files using codegen
    try:
        model_path = generate_model_file(resource_name, fields, models_dir)
        typer.secho(f"Created/updated model: {model_path}", fg=typer.colors.GREEN)

        router_path = generate_router_file(resource_name, fields, routers_dir)
        typer.secho(f"Created/updated router: {router_path}", fg=typer.colors.GREEN)

        # 6. Auto-include in main.py
        if main_file.exists():
            include_router_in_main(resource_name, main_file)
            typer.secho(f"Updated main.py to include router for '{resource_name}'", fg=typer.colors.GREEN)
        else:
            typer.secho("Warning: main.py not found. Router not included automatically.", fg=typer.colors.YELLOW)

    except Exception as exc:
        typer.secho(f"Error generating resource: {exc}", fg=typer.colors.RED)
        raise typer.Exit(code=1)

    typer.secho(f"\nResource '{resource_name}' generated successfully!\n", fg=typer.colors.GREEN)



@app.command()
def template_init():
    """
    Initialize template for debugging kaapi
    """
    typer.echo("Initializing a new Kaapi project...\n")

    templates_dir = Path(__file__).parent / "templates"
    target_backend_dir = templates_dir / "backend"

    try:
        # 2. Generate initial migration
        typer.echo("Generating initial migration...")
        subprocess.check_call(
            ["alembic", "revision", "--autogenerate", "-m", "Initial tables"],
            cwd=str(target_backend_dir),
            env={**os.environ, "PYTHONPATH": str(target_backend_dir / "app")}  # Clé pour résoudre les imports
        )

        # 3. Apply database schema
        typer.echo("Applying database schema...")
        subprocess.check_call(
            ["alembic", "upgrade", "head"],
            cwd=str(target_backend_dir)
        )

        typer.secho("Database initialized successfully!", fg=typer.colors.GREEN)

    except subprocess.CalledProcessError as e:
        typer.secho(f"Alembic error: {str(e)}", fg=typer.colors.RED)
        raise typer.Exit(code=1)

    typer.secho("\nKaapi project initialized successfully!", fg=typer.colors.GREEN)


@app.command()
def init():
    """
    Initialize a new Kaapi project.
    """
    typer.echo("Initializing a new Kaapi project...\n")

    # 1. Prompt for the project name
    project_name = typer.prompt("Project name", default="my-kaapi-project")
    project_path = Path.cwd() / project_name

    if project_path.exists():
        typer.secho(
            f"Error: Directory '{project_name}' already exists!",
            fg=typer.colors.RED
        )
        raise typer.Exit(code=1)

    project_path.mkdir(parents=True, exist_ok=True)
    typer.echo(f"Created project directory: {project_path}")

    # 2. Prompt for the database choice
    db_options = {
        "1": "SQLite",
        "2": "PostgreSQL",
        "3": "MySQL"
    }
    db_choice_str = typer.prompt(
        f"Select a database [1=SQLite, 2=PostgreSQL, 3=MySQL]",
        default="1"
    )

    if db_choice_str not in db_options:
        typer.secho("Invalid choice. Defaulting to SQLite.", fg=typer.colors.YELLOW)
        db_choice_str = "1"

    db_choice = db_options[db_choice_str]

    # 3. Build the DB_URL based on user choice
    if db_choice == "SQLite":
        db_url = "sqlite:///./dev.db"
    elif db_choice == "PostgreSQL":
        # A typical PostgreSQL URL: postgresql://user:password@host:port/db_name
        user = typer.prompt("DB username", default="postgres")
        password = typer.prompt("DB password", default="postgres")
        host = typer.prompt("DB host", default="localhost")
        port = typer.prompt("DB port", default="5432")
        db_name = typer.prompt("DB name", default="kaapi_db")
        db_url = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
    elif db_choice == "MySQL":
        # A typical MySQL URL: mysql+pymysql://user:password@host:port/db_name
        user = typer.prompt("DB username", default="root")
        password = typer.prompt("DB password", default="root")
        host = typer.prompt("DB host", default="localhost")
        port = typer.prompt("DB port", default="3306")
        db_name = typer.prompt("DB name", default="kaapi_db")
        db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}"
    else:
        db_url = "sqlite:///./dev.db"

    typer.echo(f"Using database: {db_choice}")
    typer.echo(f"DB_URL: {db_url}")

    # 4. Copy template folders
    templates_dir = Path(__file__).parent / "templates"
    backend_template = templates_dir / "backend"
    frontend_template = templates_dir / "frontend"

    target_backend_dir = project_path / "backend"
    shutil.copytree(backend_template, target_backend_dir)
    typer.echo(f"Copied backend template to: {target_backend_dir}")

    target_frontend_dir = project_path / "frontend"
    shutil.copytree(frontend_template, target_frontend_dir)
    typer.echo(f"Copied frontend template to: {target_frontend_dir}")

    # 5. Rename/copy .env.template -> .env in the backend, then inject DB_URL
    backend_env_template = target_backend_dir / ".env.template"
    backend_env_file = target_backend_dir / ".env"

    if backend_env_template.exists():
        # Read the template
        env_content = backend_env_template.read_text()
        # Replace the default DB_URL
        env_content = env_content.replace('sqlite:///./test.db', db_url)
        # Write to .env
        backend_env_file.write_text(env_content)
        # Optionally remove the template file
        backend_env_template.unlink()

    backend_env_file = target_backend_dir / ".env"
    backend_env_file.write_text(f"DB_URL={db_url}\n")  # Simplified

    # try:
    #     # 2. Generate initial migration
    #     typer.echo("Generating initial migration...")
    #     subprocess.check_call(
    #         ["alembic", "revision", "--autogenerate", "-m", "Initial tables"],
    #         cwd=str(target_backend_dir),
    #         env={**os.environ, "PYTHONPATH": str(target_backend_dir / "app")}  # Clé pour résoudre les imports
    #     )

    #     # 3. Apply database schema
    #     typer.echo("Applying database schema...")
    #     subprocess.check_call(
    #         ["alembic", "upgrade", "head"],
    #         cwd=str(target_backend_dir)
    #     )

    #     typer.secho("Database initialized successfully!", fg=typer.colors.GREEN)

    # except subprocess.CalledProcessError as e:
    #     typer.secho(f"Alembic error: {str(e)}", fg=typer.colors.RED)
    #     raise typer.Exit(code=1)

    typer.secho("\nKaapi project initialized successfully!", fg=typer.colors.GREEN)


@app.command()
def install():
    """
    Build the project for production:
    - Installs backend dependencies
    - Installs frontend dependencies (Next.js)
    - Applies database migrations
    """
    typer.echo("Building Kaapi project for production...")

    current_dir = Path.cwd()
    backend_dir = current_dir / "backend"
    frontend_dir = current_dir / "frontend"

    # Validate project structure
    if not backend_dir.exists() or not frontend_dir.exists():
        typer.secho(
            "Error: Missing backend/frontend directories",
            fg=typer.colors.RED
        )
        raise typer.Exit(code=1)

    # Install backend dependencies
    try:
        typer.echo("\nInstalling backend dependencies...")
        subprocess.check_call(
            ["pip", "install", "-r", "requirements.txt"],
            cwd=backend_dir
        )
        typer.secho("Dependencies installed!", fg=typer.colors.GREEN)
    except subprocess.CalledProcessError:
        typer.secho("Failed to install dependencies", fg=typer.colors.RED)
        raise typer.Exit(code=1)

    # Build frontend
    try:
        typer.echo("\nInstalling frontend dependencies...")
        subprocess.check_call(["npm", "install"], cwd=frontend_dir)
        typer.secho("Dependencies installed!", fg=typer.colors.GREEN)
    except subprocess.CalledProcessError:
        typer.secho("Failed to install dependencies", fg=typer.colors.RED)
        raise typer.Exit(code=1)

    # Apply migrations
    try:
        typer.echo("\nRunning database migrations...")
        subprocess.check_call(["alembic", "upgrade", "head"], cwd=backend_dir)
        typer.secho("Database migrations applied!", fg=typer.colors.GREEN)
    except subprocess.CalledProcessError:
        typer.secho("Migration failed", fg=typer.colors.RED)
        raise typer.Exit(code=1)

    typer.secho("\n🚀 Project built successfully!", fg=typer.colors.GREEN, bold=True)

@app.command()
def start():
    """
    Start the Kaapi project in development mode: 
    - Runs Uvicorn for the backend (FastAPI)
    - Runs npm run dev for the frontend (Next.js)
    """
    typer.echo("Starting Kaapi project...")

    # 1. Verify we have backend/ and frontend/ in the current directory
    current_dir = Path.cwd()
    backend_dir = current_dir / "backend"
    frontend_dir = current_dir / "frontend"

    if not backend_dir.exists() or not frontend_dir.exists():
        typer.secho(
            "Error: 'backend' or 'frontend' folder not found. Are you in a Kaapi project directory?",
            fg=typer.colors.RED
        )
        raise typer.Exit(code=1)

    # 2. Start the backend (uvicorn) as a subprocess
    #    We'll assume a typical entry point: app/main.py
    #    If you changed your structure, adapt accordingly.
   
    uvicorn_cmd = ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
    typer.echo(f"Running backend: {uvicorn_cmd}")
    backend_process = subprocess.Popen(uvicorn_cmd, cwd=backend_dir)

    # 3. Start the frontend (npm run dev) as another subprocess
    npm_cmd = ["npm", "run", "dev"]
    typer.echo(f"Running frontend: {npm_cmd}")
    frontend_process = subprocess.Popen(npm_cmd, cwd=frontend_dir)

    typer.secho("\nKaapi is running! Press CTRL+C to stop.\n", fg=typer.colors.GREEN)

    try:
        # 4. Wait for both processes to finish
        #    This will block until either subprocess ends or we get an interrupt.
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        typer.echo("Stopping processes...")
        # Terminate both processes
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()

    typer.secho("Kaapi project stopped.", fg=typer.colors.YELLOW)

# ========== Launcher ==========

def main():
    app()


if __name__ == "__main__":
    main()


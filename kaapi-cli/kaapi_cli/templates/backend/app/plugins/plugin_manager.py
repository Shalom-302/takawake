import importlib
import os
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List
from app.core.db import get_db, SessionLocal
from sqlalchemy.orm import Session
from app.models.plugin import KaapiPlugin
from app.schemas.plugin import PluginStateSchema
from fastapi import FastAPI
from pydantic import BaseModel

# In-memory reference
LOADED_PLUGINS: Dict[str, PluginStateSchema] = {}

def load_plugins_into_app(app: FastAPI, db: Session):
    """
    Scan the `app/plugins/` directory for sub-folders each containing `main.py` with `get_router()`.
    Then ensure DB has a row for each discovered plugin, and read its `enabled` state.
    """
    plugins_dir = os.path.join("app", "plugins")
    for folder_name in os.listdir(plugins_dir):
        folder_path = os.path.join(plugins_dir, folder_name)
        if not os.path.isdir(folder_path):
            continue

        main_path = os.path.join(folder_path, "main.py")
        if os.path.isfile(main_path):
            module_str = f"app.plugins.{folder_name}.main"
            try:
                plugin_module = importlib.import_module(module_str)
                if hasattr(plugin_module, "get_router"):
                    # Ensure DB row
                    row = db.query(KaapiPlugin).filter_by(name=folder_name).first()
                    if not row:
                        row = KaapiPlugin(name=folder_name, enabled=True)
                        db.add(row)
                        db.commit()
                    # Use the row's `enabled` state
                    router = plugin_module.get_router()
                    prefix = f"/plugins/{folder_name}"
                    # If we only want to mount routes if row.enabled == True, you can do:
                    if row.enabled:
                        app.include_router(router, prefix=prefix, tags=[folder_name])
                        print(f"✅ Plugin {folder_name} (enabled) loaded with router {prefix}")
                    else:
                        print(f"🔇 Plugin {folder_name} disabled (not mounted)")

                    # Populate the memory dictionary
                    LOADED_PLUGINS[folder_name] = PluginStateSchema(name=folder_name, enabled=row.enabled)
            except Exception as e:
                print(f"⚠️ Failed to load plugin {folder_name}: {e}")

# We create a router to manage plugin states
plugin_manager_router = APIRouter()

@plugin_manager_router.get("/admin/plugins", response_model=List[PluginStateSchema])
def list_plugins():
    """Return all discovered plugins with their enabled states."""
    return list(LOADED_PLUGINS.values())

class ToggleBody(BaseModel):
    enabled: bool

@plugin_manager_router.post("/admin/plugins/{plugin_name}/toggle")
def toggle_plugin(plugin_name: str, data: ToggleBody, db: Session = Depends(get_db)):
    """Enable or disable a plugin by name, updating DB and memory."""
    if plugin_name not in LOADED_PLUGINS:
        raise HTTPException(status_code=404, detail="Plugin not found")

    # 1) Update DB
    row = db.query(KaapiPlugin).filter_by(name=plugin_name).first()
    if not row:
        # If plugin doesn't exist in DB, create it
        row = KaapiPlugin(name=plugin_name, enabled=data.enabled)
        db.add(row)
    else:
        row.enabled = data.enabled
    db.commit()

    # 2) Update memory reference
    LOADED_PLUGINS[plugin_name].enabled = data.enabled

    # For truly dynamic disabling routes, you'd have to remove or re-add them at runtime.
    # Usually you'd need a reload or advanced logic if you want changes to take effect immediately.

    return {"detail": f"Plugin {plugin_name} is now {'enabled' if data.enabled else 'disabled'}"}

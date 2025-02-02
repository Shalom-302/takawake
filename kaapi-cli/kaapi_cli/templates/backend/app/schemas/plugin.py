from pydantic import BaseModel

class PluginStateSchema(BaseModel):
    name: str
    enabled: bool

    class Config:
        from_attributes = True


from pydantic import BaseModel

class StarCreate(BaseModel):
    name: str
    quantity: int
    description: str

class StarUpdate(BaseModel):
    name: str | None = None
    quantity: int | None = None
    description: str | None = None

class StarOut(BaseModel):
    id: int
    name: str | None = None
    quantity: int | None = None
    description: str | None = None

    class Config:
            orm_mode = True 

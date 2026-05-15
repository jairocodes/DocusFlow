import uuid

from pydantic import BaseModel


class TagCreate(BaseModel):
    nombre: str
    color_hex: str = "#6b6960"


class TagOut(BaseModel):
    id: uuid.UUID
    nombre: str
    color_hex: str
    es_sistema: bool

    model_config = {"from_attributes": True}

import uuid

from pydantic import BaseModel


class FolderCreate(BaseModel):
    nombre: str
    color_hex: str = "#d4962a"


class FolderUpdate(BaseModel):
    nombre: str | None = None
    color_hex: str | None = None


class FolderOut(BaseModel):
    id: uuid.UUID
    nombre: str
    color_hex: str
    total_docs: int = 0

    model_config = {"from_attributes": True}

import uuid

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    nombre_completo: str
    email: EmailStr
    password: str
    rol: str = "analista"
    area: str | None = None


class UserUpdate(BaseModel):
    nombre_completo: str | None = None
    rol: str | None = None
    area: str | None = None
    activo: bool | None = None


class UserOut(BaseModel):
    id: uuid.UUID
    nombre_completo: str
    email: str
    rol: str
    area: str | None
    espacio_usado_bytes: int
    cuota_bytes: int
    activo: bool

    model_config = {"from_attributes": True}

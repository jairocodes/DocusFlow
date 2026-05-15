import uuid

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: uuid.UUID
    nombre_completo: str
    email: str
    rol: str
    area: str | None
    espacio_usado_bytes: int
    cuota_bytes: int

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ChangePasswordRequest(BaseModel):
    password_actual: str
    password_nuevo: str

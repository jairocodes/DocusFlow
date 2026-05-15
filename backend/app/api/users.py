from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.database import get_db
from app.core.deps import AdminUser
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserOut])
async def list_users(
    _: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).order_by(User.nombre_completo))
    return [UserOut.model_validate(u) for u in result.scalars()]


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    _: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    user = User(
        nombre_completo=body.nombre_completo,
        email=body.email,
        password_hash=hash_password(body.password),
        rol=body.rol,
        area=body.area,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    _: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def deactivate_user(
    user_id: uuid.UUID,
    _: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.activo = False
    await db.commit()
    return {"message": "Usuario desactivado"}

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import CurrentUser
from app.core.security import hash_password
from app.schemas.auth import LoginRequest, TokenResponse, UserPublic, ChangePasswordRequest
from app.services.auth_service import authenticate_user, generate_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user = await authenticate_user(db, body.email, body.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    token = generate_token(user)
    return TokenResponse(
        access_token=token,
        user=UserPublic.model_validate(user),
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UserPublic)
async def me(current_user: CurrentUser):
    return UserPublic.model_validate(current_user)


@router.put("/me/password", status_code=status.HTTP_200_OK)
async def change_password(
    body: ChangePasswordRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from app.core.security import verify_password
    if not verify_password(body.password_actual, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta",
        )
    current_user.password_hash = hash_password(body.password_nuevo)
    await db.commit()
    return {"message": "Contraseña actualizada correctamente"}

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import verify_password, create_access_token
from app.models.user import User


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email, User.activo == True))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(password, user.password_hash):
        return None
    user.ultimo_acceso = datetime.now(timezone.utc)
    await db.commit()
    return user


def generate_token(user: User) -> str:
    return create_access_token(str(user.id))

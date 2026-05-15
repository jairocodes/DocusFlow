"""
Script para crear el primer usuario administrador.
Uso: docker compose -f docker-compose.dev.yml exec backend python seed_admin.py
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User
from sqlalchemy import select


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "admin@docusflow.com"))
        if result.scalar_one_or_none():
            print("El usuario admin ya existe.")
            return

        admin = User(
            nombre_completo="Administrador DocusFlow",
            email="admin@docusflow.com",
            password_hash=hash_password("Admin1234!"),
            rol="admin",
            area="TI",
        )
        db.add(admin)
        await db.commit()
        print("Usuario admin creado:")
        print("  Email   : admin@docusflow.com")
        print("  Password: Admin1234!")


asyncio.run(main())

from typing import Annotated
from datetime import datetime, timezone
from calendar import monthrange

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.deps import CurrentUser
from app.models.document import Document
from app.models.shared_document import SharedDocument

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/dashboard")
async def dashboard_stats(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    now = datetime.now(timezone.utc)
    mes_inicio = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    base = select(func.count(Document.id))
    if current_user.rol != "admin":
        base = base.where(Document.usuario_id == current_user.id)

    total_docs = (await db.execute(base)).scalar_one()

    subidos_mes = (await db.execute(
        base.where(Document.fecha_subida >= mes_inicio)
    )).scalar_one()

    compartidos = (await db.execute(
        select(func.count(SharedDocument.id))
        .where(SharedDocument.compartido_con_usuario_id == current_user.id)
    )).scalar_one()

    return {
        "total_docs": total_docs,
        "subidos_mes": subidos_mes,
        "compartidos": compartidos,
        "espacio_usado": current_user.espacio_usado_bytes,
        "espacio_total": current_user.cuota_bytes,
    }

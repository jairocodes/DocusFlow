import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.deps import CurrentUser
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagOut

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagOut])
async def list_tags(
    _: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Tag).order_by(Tag.es_sistema.desc(), Tag.nombre))
    return [TagOut.model_validate(t) for t in result.scalars()]


@router.post("", response_model=TagOut, status_code=status.HTTP_201_CREATED)
async def create_tag(
    body: TagCreate,
    _: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tag = Tag(nombre=body.nombre, color_hex=body.color_hex, es_sistema=False)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return TagOut.model_validate(tag)


@router.delete("/{tag_id}", status_code=status.HTTP_200_OK)
async def delete_tag(
    tag_id: uuid.UUID,
    _: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Etiqueta no encontrada")
    if tag.es_sistema:
        raise HTTPException(status_code=400, detail="No se pueden eliminar etiquetas del sistema")
    await db.delete(tag)
    await db.commit()
    return {"success": True, "message": "Etiqueta eliminada"}

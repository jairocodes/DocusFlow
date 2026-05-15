import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.deps import CurrentUser
from app.models.folder import Folder
from app.models.document import Document
from app.schemas.folder import FolderCreate, FolderUpdate, FolderOut

router = APIRouter(prefix="/folders", tags=["folders"])


@router.get("", response_model=list[FolderOut])
async def list_folders(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Folder).where(Folder.usuario_id == current_user.id).order_by(Folder.nombre)
    )
    folders = result.scalars().all()

    out = []
    for f in folders:
        count_result = await db.execute(
            select(func.count(Document.id)).where(Document.carpeta_id == f.id)
        )
        total = count_result.scalar_one()
        fo = FolderOut.model_validate(f)
        fo.total_docs = total
        out.append(fo)
    return out


@router.post("", response_model=FolderOut, status_code=status.HTTP_201_CREATED)
async def create_folder(
    body: FolderCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    folder = Folder(nombre=body.nombre, color_hex=body.color_hex, usuario_id=current_user.id)
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    fo = FolderOut.model_validate(folder)
    fo.total_docs = 0
    return fo


@router.put("/{folder_id}", response_model=FolderOut)
async def update_folder(
    folder_id: uuid.UUID,
    body: FolderUpdate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Folder).where(Folder.id == folder_id, Folder.usuario_id == current_user.id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=404, detail="Carpeta no encontrada")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(folder, field, value)
    await db.commit()
    await db.refresh(folder)
    count_result = await db.execute(select(func.count(Document.id)).where(Document.carpeta_id == folder.id))
    fo = FolderOut.model_validate(folder)
    fo.total_docs = count_result.scalar_one()
    return fo


@router.delete("/{folder_id}", status_code=status.HTTP_200_OK)
async def delete_folder(
    folder_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Folder).where(Folder.id == folder_id, Folder.usuario_id == current_user.id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=404, detail="Carpeta no encontrada")
    await db.delete(folder)
    await db.commit()
    return {"success": True, "message": "Carpeta eliminada (documentos sin asignar)"}


@router.get("/{folder_id}/documents")
async def folder_documents(
    folder_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = 1,
    limit: int = 20,
):
    from app.schemas.document import DocumentOut, DocumentListResponse
    query = select(Document).where(
        Document.carpeta_id == folder_id,
        Document.usuario_id == current_user.id if current_user.rol != "admin" else True,
    )
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    docs = (await db.execute(query.order_by(Document.fecha_subida.desc()).offset((page - 1) * limit).limit(limit))).scalars().all()
    return DocumentListResponse(data=[DocumentOut.model_validate(d) for d in docs], total=total, page=page, limit=limit)

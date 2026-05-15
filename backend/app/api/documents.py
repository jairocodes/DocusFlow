import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, BackgroundTasks, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.core.database import get_db
from app.core.deps import CurrentUser
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentOut, DocumentUpdate, DocumentListResponse
from app.services.document_service import create_document, delete_document, get_document_or_404
from app.services.storage_service import download_file

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
    nombre: str = Form(""),
    carpeta_id: str = Form(""),
    tag_id: str = Form(""),
    es_aduanero: bool = Form(False),
):
    try:
        _carpeta_id = uuid.UUID(carpeta_id) if carpeta_id else None
        _tag_id = uuid.UUID(tag_id) if tag_id else None
        doc = await create_document(
            db=db,
            usuario=current_user,
            file=file,
            nombre=nombre,
            carpeta_id=_carpeta_id,
            tag_id=_tag_id,
            es_aduanero=es_aduanero,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # El pipeline OCR se lanzará en la siguiente feature
    background_tasks.add_task(_placeholder_ocr, doc.id)

    return {
        "success": True,
        "message": "Upload iniciado, procesando OCR...",
        "data": {"id": str(doc.id), "estado_ocr": doc.estado_ocr},
    }


async def _placeholder_ocr(doc_id: uuid.UUID):
    """Sustituido por el pipeline real en feature/pipeline-ocr."""
    pass


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    folder_id: str | None = None,
    tag_id: str | None = None,
    page: int = 1,
    limit: int = 20,
):
    query = select(Document)
    if current_user.rol != "admin":
        query = query.where(Document.usuario_id == current_user.id)
    if folder_id:
        query = query.where(Document.carpeta_id == uuid.UUID(folder_id))
    if tag_id:
        query = query.where(Document.tag_id == uuid.UUID(tag_id))

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar_one()

    query = query.order_by(Document.fecha_subida.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    docs = result.scalars().all()

    return DocumentListResponse(
        data=[DocumentOut.model_validate(d) for d in docs],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/recent", response_model=list[DocumentOut])
async def recent_documents(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    query = select(Document)
    if current_user.rol != "admin":
        query = query.where(Document.usuario_id == current_user.id)
    query = query.order_by(Document.ultimo_acceso.desc().nullslast(), Document.fecha_subida.desc()).limit(20)
    result = await db.execute(query)
    return [DocumentOut.model_validate(d) for d in result.scalars()]


@router.get("/search", response_model=DocumentListResponse)
async def search_documents(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    q: str = "",
    page: int = 1,
    limit: int = 20,
):
    from sqlalchemy import text as sa_text
    query = select(Document)
    if current_user.rol != "admin":
        query = query.where(Document.usuario_id == current_user.id)
    if q:
        fts = sa_text("to_tsvector('spanish', coalesce(documents.texto_ocr, '')) @@ plainto_tsquery('spanish', :q)")
        query = query.where(
            or_(
                Document.nombre.ilike(f"%{q}%"),
                fts.bindparams(q=q),
            )
        )
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar_one()
    query = query.order_by(Document.fecha_subida.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    docs = result.scalars().all()
    return DocumentListResponse(data=[DocumentOut.model_validate(d) for d in docs], total=total, page=page, limit=limit)


@router.get("/{doc_id}", response_model=DocumentOut)
async def get_document(
    doc_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        doc = await get_document_or_404(db, doc_id, current_user)
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=404, detail=str(e))
    return DocumentOut.model_validate(doc)


@router.get("/{doc_id}/preview")
async def preview_document(
    doc_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        doc = await get_document_or_404(db, doc_id, current_user)
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=404, detail=str(e))

    from datetime import datetime, timezone
    doc.ultimo_acceso = datetime.now(timezone.utc)
    await db.commit()

    data = download_file(doc.storage_path)
    media_type = _media_type(doc.extension)
    return StreamingResponse(iter([data]), media_type=media_type)


@router.get("/{doc_id}/download")
async def download_document(
    doc_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        doc = await get_document_or_404(db, doc_id, current_user)
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=404, detail=str(e))

    data = download_file(doc.storage_path)
    media_type = _media_type(doc.extension)
    headers = {"Content-Disposition": f'attachment; filename="{doc.nombre}"'}
    return StreamingResponse(iter([data]), media_type=media_type, headers=headers)


@router.put("/{doc_id}", response_model=DocumentOut)
async def update_document(
    doc_id: uuid.UUID,
    body: DocumentUpdate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        doc = await get_document_or_404(db, doc_id, current_user)
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=404, detail=str(e))
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(doc, field, value)
    await db.commit()
    await db.refresh(doc)
    return DocumentOut.model_validate(doc)


@router.delete("/{doc_id}", status_code=status.HTTP_200_OK)
async def remove_document(
    doc_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        doc = await get_document_or_404(db, doc_id, current_user)
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=404, detail=str(e))
    await delete_document(db, doc, current_user)
    return {"success": True, "message": "Documento eliminado"}


def _media_type(ext: str) -> str:
    return {
        "pdf": "application/pdf",
        "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xls": "application/vnd.ms-excel",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }.get(ext, "application/octet-stream")

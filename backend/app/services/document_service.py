import io
import uuid
from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.config import settings
from app.models.document import Document
from app.models.user import User
from app.services.storage_service import build_storage_path, upload_file, delete_file

EXTENSION_TO_TIPO = {
    "pdf": "pdf",
    "jpg": "img", "jpeg": "img", "png": "img",
    "doc": "doc", "docx": "doc",
    "xls": "xls", "xlsx": "xls",
}

CONTENT_TYPES = {
    "pdf": "application/pdf",
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


async def create_document(
    db: AsyncSession,
    usuario: User,
    file: UploadFile,
    nombre: str,
    carpeta_id: uuid.UUID | None,
    tag_id: uuid.UUID | None,
    es_aduanero: bool,
) -> Document:
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in settings.allowed_extensions_list:
        raise ValueError(f"Extensión no permitida: {ext}")

    data = await file.read()
    size = len(data)

    if size > settings.max_upload_size_bytes:
        raise ValueError(f"Archivo supera el límite de {settings.MAX_UPLOAD_SIZE_MB} MB")

    file_uuid = uuid.uuid4()
    storage_path = build_storage_path(usuario.id, file_uuid, ext)
    content_type = CONTENT_TYPES.get(ext, "application/octet-stream")

    upload_file(
        data=io.BytesIO(data),
        storage_path=storage_path,
        content_type=content_type,
        size=size,
    )

    doc = Document(
        nombre=nombre or file.filename or "sin_nombre",
        tipo=EXTENSION_TO_TIPO.get(ext, "doc"),
        extension=ext,
        origen="subido",
        estado_ocr="pendiente",
        tamanio_bytes=size,
        storage_path=storage_path,
        carpeta_id=carpeta_id,
        usuario_id=usuario.id,
        tag_id=tag_id,
    )
    db.add(doc)

    usuario.espacio_usado_bytes += size

    await db.commit()
    await db.refresh(doc)
    return doc


async def delete_document(db: AsyncSession, doc: Document, usuario: User) -> None:
    delete_file(doc.storage_path)
    usuario.espacio_usado_bytes = max(0, usuario.espacio_usado_bytes - doc.tamanio_bytes)
    await db.delete(doc)
    await db.commit()


async def get_document_or_404(
    db: AsyncSession, doc_id: uuid.UUID, usuario: User
) -> Document:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if doc is None:
        raise ValueError("Documento no encontrado")
    if usuario.rol != "admin" and doc.usuario_id != usuario.id:
        # también permitir si fue compartido — se comprueba en el router
        raise PermissionError("Sin acceso a este documento")
    return doc

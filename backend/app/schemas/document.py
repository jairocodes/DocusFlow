import uuid
from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: uuid.UUID
    nombre: str
    tipo: str
    extension: str
    origen: str
    estado_ocr: str
    tamanio_bytes: int
    storage_path: str
    carpeta_id: uuid.UUID | None
    usuario_id: uuid.UUID
    tag_id: uuid.UUID | None
    expediente_id: uuid.UUID | None
    tipo_doc_aduanero: str | None
    metadatos_extraidos: dict | None
    fecha_subida: datetime
    ultimo_acceso: datetime | None

    model_config = {"from_attributes": True}


class DocumentUpdate(BaseModel):
    nombre: str | None = None
    carpeta_id: uuid.UUID | None = None
    tag_id: uuid.UUID | None = None


class DocumentListResponse(BaseModel):
    data: list[DocumentOut]
    total: int
    page: int
    limit: int

"""
Background task que se lanza después de cada upload.
Actualiza texto_ocr y estado_ocr del documento en la DB.
"""

import logging
import uuid

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.document import Document
from app.workers.ocr_worker import extract_text

logger = logging.getLogger(__name__)


async def run_ocr_pipeline(doc_id: uuid.UUID) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Document).where(Document.id == doc_id))
        doc = result.scalar_one_or_none()
        if doc is None:
            logger.warning("OCR task: documento %s no encontrado", doc_id)
            return

        doc.estado_ocr = "procesando"
        await db.commit()

        texto, estado = extract_text(doc.storage_path, doc.extension)

        doc.texto_ocr = texto or None
        doc.estado_ocr = estado
        await db.commit()
        logger.info("OCR completado para %s → estado=%s chars=%d", doc_id, estado, len(texto))

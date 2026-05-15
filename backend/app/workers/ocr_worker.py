"""
Pipeline de extracción de texto para documentos subidos.

Orden de intentos:
1. pdfplumber  — PDFs nativos con texto embebido
2. pdf2image + pytesseract — PDFs escaneados / imágenes
3. python-docx — archivos .docx
4. openpyxl    — archivos .xlsx/.xls
"""

import io
import logging
import uuid

import pytesseract
from PIL import Image

from app.core.config import settings
from app.services.storage_service import download_file

logger = logging.getLogger(__name__)

pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD


# ── extracción por tipo ────────────────────────────────────────────────────

def _extract_pdf(data: bytes) -> str:
    import pdfplumber
    text_parts: list[str] = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            t = page.extract_text() or ""
            text_parts.append(t)
    return "\n".join(text_parts).strip()


def _extract_pdf_ocr(data: bytes) -> str:
    from pdf2image import convert_from_bytes
    images = convert_from_bytes(data, dpi=200)
    texts: list[str] = []
    for img in images:
        texts.append(pytesseract.image_to_string(img, lang=settings.TESSERACT_LANG))
    return "\n".join(texts).strip()


def _extract_image(data: bytes) -> str:
    img = Image.open(io.BytesIO(data))
    return pytesseract.image_to_string(img, lang=settings.TESSERACT_LANG).strip()


def _extract_docx(data: bytes) -> str:
    from docx import Document as DocxDocument
    doc = DocxDocument(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs if p.text).strip()


def _extract_xlsx(data: bytes) -> str:
    import openpyxl
    wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
    parts: list[str] = []
    for sheet in wb.worksheets:
        for row in sheet.iter_rows(values_only=True):
            line = " | ".join(str(c) for c in row if c is not None)
            if line:
                parts.append(line)
    return "\n".join(parts).strip()


# ── función principal ──────────────────────────────────────────────────────

def extract_text(storage_path: str, extension: str) -> tuple[str, str]:
    """
    Returns (texto_ocr, estado_ocr).
    estado_ocr: 'extraido' | 'sin_ocr' | 'error'
    """
    try:
        data = download_file(storage_path)
    except Exception as exc:
        logger.error("No se pudo descargar %s de MinIO: %s", storage_path, exc)
        return "", "error"

    try:
        ext = extension.lower()

        if ext == "pdf":
            text = _extract_pdf(data)
            if len(text) < 30:
                logger.info("pdfplumber sin texto útil para %s, usando OCR", storage_path)
                text = _extract_pdf_ocr(data)
            estado = "extraido" if text else "sin_ocr"

        elif ext in ("jpg", "jpeg", "png"):
            text = _extract_image(data)
            estado = "extraido" if text else "sin_ocr"

        elif ext == "docx":
            text = _extract_docx(data)
            estado = "extraido" if text else "sin_ocr"

        elif ext in ("xlsx", "xls"):
            text = _extract_xlsx(data)
            estado = "extraido" if text else "sin_ocr"

        else:
            text = ""
            estado = "sin_ocr"

        return text, estado

    except Exception as exc:
        logger.error("Error extrayendo texto de %s: %s", storage_path, exc)
        return "", "error"

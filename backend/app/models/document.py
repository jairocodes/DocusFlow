import uuid
from datetime import datetime

from sqlalchemy import BigInteger, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    tipo: Mapped[str] = mapped_column(String(10), nullable=False)       # pdf | img | doc | xls
    extension: Mapped[str] = mapped_column(String(10), nullable=False)
    origen: Mapped[str] = mapped_column(String(20), default="subido")
    estado_ocr: Mapped[str] = mapped_column(String(20), default="pendiente")
    texto_ocr: Mapped[str | None] = mapped_column(Text)
    tamanio_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    carpeta_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("folders.id", ondelete="SET NULL")
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    tag_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tags.id", ondelete="SET NULL")
    )
    expediente_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("expedientes.id", ondelete="SET NULL")
    )
    tipo_doc_aduanero: Mapped[str | None] = mapped_column(String(30))
    metadatos_extraidos: Mapped[dict | None] = mapped_column(JSONB)
    fecha_subida: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    ultimo_acceso: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    usuario: Mapped["User"] = relationship("User", back_populates="documents")
    carpeta: Mapped["Folder"] = relationship("Folder", back_populates="documents")
    tag: Mapped["Tag"] = relationship("Tag", back_populates="documents")
    expediente: Mapped["Expediente"] = relationship("Expediente", back_populates="documents")
    compartidos: Mapped[list["SharedDocument"]] = relationship("SharedDocument", back_populates="documento", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_documents_usuario", "usuario_id"),
        Index("idx_documents_carpeta", "carpeta_id"),
        Index("idx_documents_expediente", "expediente_id"),
        Index("idx_documents_metadatos", "metadatos_extraidos", postgresql_using="gin"),
    )

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Expediente(Base):
    __tablename__ = "expedientes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    numero_duca: Mapped[str | None] = mapped_column(String(100))
    codigo_factura: Mapped[str | None] = mapped_column(String(200))
    exportador_nit: Mapped[str | None] = mapped_column(String(50))
    exportador_nombre: Mapped[str | None] = mapped_column(String(200))
    importador_nit: Mapped[str | None] = mapped_column(String(50))
    importador_nombre: Mapped[str | None] = mapped_column(String(200))
    aduana_salida: Mapped[str | None] = mapped_column(String(100))
    aduana_entrada: Mapped[str | None] = mapped_column(String(100))
    pais_origen: Mapped[str | None] = mapped_column(String(3))
    pais_destino: Mapped[str | None] = mapped_column(String(3))
    mercancia_descripcion: Mapped[str | None] = mapped_column(Text)
    placa_vehiculo: Mapped[str | None] = mapped_column(String(30))
    estado: Mapped[str] = mapped_column(String(20), default="en_proceso")
    completitud_pct: Mapped[int] = mapped_column(Integer, default=0)
    usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    fecha_actualizacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    usuario: Mapped["User"] = relationship("User", back_populates="expedientes")
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="expediente")

    __table_args__ = (
        Index("idx_expedientes_duca", "numero_duca"),
        Index("idx_expedientes_factura", "codigo_factura"),
        Index("idx_expedientes_exportador", "exportador_nit"),
        Index("idx_expedientes_placa", "placa_vehiculo"),
    )

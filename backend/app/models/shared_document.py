import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class SharedDocument(Base):
    __tablename__ = "shared_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    documento_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    compartido_por_usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    compartido_con_usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    email_externo: Mapped[str | None] = mapped_column(String(255))
    estado: Mapped[str] = mapped_column(String(20), default="pendiente")
    token_acceso: Mapped[str | None] = mapped_column(String(255), unique=True)
    fecha_compartido: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    fecha_expiracion: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    documento: Mapped["Document"] = relationship("Document", back_populates="compartidos")
    compartido_por: Mapped["User"] = relationship("User", foreign_keys=[compartido_por_usuario_id])
    compartido_con: Mapped["User"] = relationship("User", foreign_keys=[compartido_con_usuario_id])

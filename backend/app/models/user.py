import uuid
from datetime import datetime

from sqlalchemy import Boolean, BigInteger, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nombre_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(20), nullable=False)  # admin | analista | viewer
    area: Mapped[str | None] = mapped_column(String(100))
    cuota_bytes: Mapped[int] = mapped_column(BigInteger, default=10737418240)  # 10 GB
    espacio_usado_bytes: Mapped[int] = mapped_column(BigInteger, default=0)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    ultimo_acceso: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    folders: Mapped[list["Folder"]] = relationship("Folder", back_populates="usuario", cascade="all, delete-orphan")
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="usuario", cascade="all, delete-orphan")
    expedientes: Mapped[list["Expediente"]] = relationship("Expediente", back_populates="usuario")

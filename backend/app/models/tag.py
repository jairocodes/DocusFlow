import uuid

from sqlalchemy import Boolean, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    color_hex: Mapped[str] = mapped_column(String(7), nullable=False)
    es_sistema: Mapped[bool] = mapped_column(Boolean, default=False)

    documents: Mapped[list["Document"]] = relationship("Document", back_populates="tag")

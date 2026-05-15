"""Esquema inicial: users, folders, tags, expedientes, documents, shared_documents

Revision ID: 0001
Revises:
Create Date: 2026-05-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("nombre_completo", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("rol", sa.String(20), nullable=False),
        sa.Column("area", sa.String(100)),
        sa.Column("cuota_bytes", sa.BigInteger, server_default="10737418240"),
        sa.Column("espacio_usado_bytes", sa.BigInteger, server_default="0"),
        sa.Column("activo", sa.Boolean, server_default="true"),
        sa.Column("fecha_creacion", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("ultimo_acceso", sa.DateTime(timezone=True)),
        sa.UniqueConstraint("email"),
    )

    # ── folders ────────────────────────────────────────────────────────────
    op.create_table(
        "folders",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("nombre", sa.String(150), nullable=False),
        sa.Column("color_hex", sa.String(7), nullable=False),
        sa.Column("usuario_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("fecha_creacion", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )

    # ── tags ───────────────────────────────────────────────────────────────
    op.create_table(
        "tags",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("nombre", sa.String(80), nullable=False),
        sa.Column("color_hex", sa.String(7), nullable=False),
        sa.Column("es_sistema", sa.Boolean, server_default="false"),
    )

    # ── expedientes ────────────────────────────────────────────────────────
    op.create_table(
        "expedientes",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("numero_duca", sa.String(100)),
        sa.Column("codigo_factura", sa.String(200)),
        sa.Column("exportador_nit", sa.String(50)),
        sa.Column("exportador_nombre", sa.String(200)),
        sa.Column("importador_nit", sa.String(50)),
        sa.Column("importador_nombre", sa.String(200)),
        sa.Column("aduana_salida", sa.String(100)),
        sa.Column("aduana_entrada", sa.String(100)),
        sa.Column("pais_origen", sa.String(3)),
        sa.Column("pais_destino", sa.String(3)),
        sa.Column("mercancia_descripcion", sa.Text),
        sa.Column("placa_vehiculo", sa.String(30)),
        sa.Column("estado", sa.String(20), server_default="en_proceso"),
        sa.Column("completitud_pct", sa.Integer, server_default="0"),
        sa.Column("usuario_id", UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("fecha_creacion", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("fecha_actualizacion", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("idx_expedientes_duca", "expedientes", ["numero_duca"])
    op.create_index("idx_expedientes_factura", "expedientes", ["codigo_factura"])
    op.create_index("idx_expedientes_exportador", "expedientes", ["exportador_nit"])
    op.create_index("idx_expedientes_placa", "expedientes", ["placa_vehiculo"])

    # ── documents ──────────────────────────────────────────────────────────
    op.create_table(
        "documents",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("nombre", sa.String(255), nullable=False),
        sa.Column("tipo", sa.String(10), nullable=False),
        sa.Column("extension", sa.String(10), nullable=False),
        sa.Column("origen", sa.String(20), server_default="subido"),
        sa.Column("estado_ocr", sa.String(20), server_default="pendiente"),
        sa.Column("texto_ocr", sa.Text),
        sa.Column("tamanio_bytes", sa.BigInteger, nullable=False),
        sa.Column("storage_path", sa.String(500), nullable=False),
        sa.Column("carpeta_id", UUID(as_uuid=True), sa.ForeignKey("folders.id", ondelete="SET NULL")),
        sa.Column("usuario_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tag_id", UUID(as_uuid=True), sa.ForeignKey("tags.id", ondelete="SET NULL")),
        sa.Column("expediente_id", UUID(as_uuid=True), sa.ForeignKey("expedientes.id", ondelete="SET NULL")),
        sa.Column("tipo_doc_aduanero", sa.String(30)),
        sa.Column("metadatos_extraidos", JSONB),
        sa.Column("fecha_subida", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("ultimo_acceso", sa.DateTime(timezone=True)),
    )
    op.create_index("idx_documents_usuario", "documents", ["usuario_id"])
    op.create_index("idx_documents_carpeta", "documents", ["carpeta_id"])
    op.create_index("idx_documents_expediente", "documents", ["expediente_id"])
    op.create_index(
        "idx_documents_ocr_fts", "documents",
        [sa.text("to_tsvector('spanish', coalesce(texto_ocr, ''))")],
        postgresql_using="gin",
    )
    op.create_index(
        "idx_documents_metadatos", "documents",
        ["metadatos_extraidos"],
        postgresql_using="gin",
    )

    # ── shared_documents ───────────────────────────────────────────────────
    op.create_table(
        "shared_documents",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("documento_id", UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("compartido_por_usuario_id", UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("compartido_con_usuario_id", UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("email_externo", sa.String(255)),
        sa.Column("estado", sa.String(20), server_default="pendiente"),
        sa.Column("token_acceso", sa.String(255), unique=True),
        sa.Column("fecha_compartido", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("fecha_expiracion", sa.DateTime(timezone=True)),
    )

    # Seed de tags del sistema
    op.execute("""
        INSERT INTO tags (id, nombre, color_hex, es_sistema) VALUES
        (gen_random_uuid(), 'Contrato',              '#1a4fd6', true),
        (gen_random_uuid(), 'Factura',               '#1a7a4a', true),
        (gen_random_uuid(), 'Legal',                 '#1a4fd6', true),
        (gen_random_uuid(), 'RR.HH.',                '#6b6960', true),
        (gen_random_uuid(), 'Finanzas',              '#a05a10', true),
        (gen_random_uuid(), 'Expediente aduanero',   '#0f6e56', true)
    """)


def downgrade() -> None:
    op.drop_table("shared_documents")
    op.drop_index("idx_documents_metadatos")
    op.drop_index("idx_documents_ocr_fts")
    op.drop_index("idx_documents_expediente")
    op.drop_index("idx_documents_carpeta")
    op.drop_index("idx_documents_usuario")
    op.drop_table("documents")
    op.drop_index("idx_expedientes_placa")
    op.drop_index("idx_expedientes_exportador")
    op.drop_index("idx_expedientes_factura")
    op.drop_index("idx_expedientes_duca")
    op.drop_table("expedientes")
    op.drop_table("tags")
    op.drop_table("folders")
    op.drop_table("users")

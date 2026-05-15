import io
import uuid
from typing import BinaryIO

from minio.error import S3Error

from app.core.config import settings
from app.core.storage import get_minio_client


def build_storage_path(usuario_id: uuid.UUID, file_uuid: uuid.UUID, extension: str) -> str:
    return f"{usuario_id}/{file_uuid}.{extension}"


def upload_file(
    data: BinaryIO,
    storage_path: str,
    content_type: str,
    size: int,
) -> None:
    client = get_minio_client()
    client.put_object(
        bucket_name=settings.MINIO_BUCKET,
        object_name=storage_path,
        data=data,
        length=size,
        content_type=content_type,
    )


def download_file(storage_path: str) -> bytes:
    client = get_minio_client()
    response = client.get_object(
        bucket_name=settings.MINIO_BUCKET,
        object_name=storage_path,
    )
    try:
        return response.read()
    finally:
        response.close()
        response.release_conn()


def get_presigned_url(storage_path: str, expires_seconds: int = 3600) -> str:
    from datetime import timedelta
    client = get_minio_client()
    return client.presigned_get_object(
        bucket_name=settings.MINIO_BUCKET,
        object_name=storage_path,
        expires=timedelta(seconds=expires_seconds),
    )


def delete_file(storage_path: str) -> None:
    client = get_minio_client()
    try:
        client.remove_object(
            bucket_name=settings.MINIO_BUCKET,
            object_name=storage_path,
        )
    except S3Error:
        pass

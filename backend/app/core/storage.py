import logging
from minio import Minio
from minio.error import S3Error

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: Minio | None = None


def get_minio_client() -> Minio:
    global _client
    if _client is None:
        _client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
    return _client


async def ensure_bucket_exists() -> None:
    client = get_minio_client()
    bucket = settings.MINIO_BUCKET
    try:
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)
            logger.info("Bucket '%s' creado", bucket)
        else:
            logger.info("Bucket '%s' ya existe", bucket)
    except S3Error as exc:
        logger.error("Error verificando/creando bucket MinIO: %s", exc)
        raise

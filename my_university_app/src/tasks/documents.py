import time
import logging
from src.core.celery_app import celery_app

logger = logging.getLogger(__name__)

@celery_app.task(
    name="process_document_task",
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=5
)
def process_document_task(file_key: str):
    logger.info(f"Starting to process document: {file_key}")
    try:
        # Simulate processing time
        time.sleep(3)
        logger.info(f"Document {file_key} processed successfully")
        return {"status": "success", "file_key": file_key}
    except Exception as exc:
        logger.error(f"Error processing document {file_key}: {exc}")
        raise exc

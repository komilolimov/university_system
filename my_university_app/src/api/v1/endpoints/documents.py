from fastapi import APIRouter, Depends, UploadFile, File
from typing import Annotated
from fastapi.concurrency import run_in_threadpool

# ИСПРАВЛЕНО: Меняем RequireRole на RequirePermission
from src.api.deps import get_current_user, RequirePermission
from src.services.storage import S3StorageService
from src.tasks.documents import process_document_task

router = APIRouter(prefix="/documents", tags=["Documents"])

CurrentUserDep = Annotated[dict, Depends(get_current_user)]

# ИСПРАВЛЕНО: Ставим точечный замок на право загрузки документов
@router.post("/upload", status_code=201, dependencies=[Depends(RequirePermission(["documents:write"]))])
async def upload_document(
    user: CurrentUserDep,
    file: UploadFile = File(...)
):
    storage_service = S3StorageService()
    file_key = await run_in_threadpool(storage_service.upload_file, file)
    
    process_document_task.delay(file_key)
    
    return {"message": "File uploaded successfully", "file_key": file_key}

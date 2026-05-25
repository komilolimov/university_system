import boto3
from fastapi import UploadFile
from botocore.exceptions import ClientError
import uuid
from src.core.config import settings

class S3StorageService:
    def __init__(self):
        self.endpoint_url = settings.MINIO_ENDPOINT_URL
        self.access_key = settings.MINIO_ACCESS_KEY
        self.secret_key = settings.MINIO_SECRET_KEY
        self.bucket_name = settings.MINIO_BUCKET_NAME
        
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name="us-east-1"
        )
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            error_code = e.response['Error'].get('Code')
            if error_code == '404':
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            else:
                raise

    def upload_file(self, file: UploadFile) -> str:
        file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Boto3's upload_fileobj expects a file-like object
        self.s3_client.upload_fileobj(
            file.file, 
            self.bucket_name, 
            unique_filename,
            ExtraArgs={"ContentType": file.content_type}
        )
        
        # Return the generated file key
        return unique_filename

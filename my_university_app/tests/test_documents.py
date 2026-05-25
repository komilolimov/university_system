import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

@patch("src.api.v1.endpoints.documents.S3StorageService")
@patch("src.api.v1.endpoints.documents.process_document_task.delay")
def test_upload_document(mock_celery_delay, mock_s3_service, client: TestClient, admin_token: str):
    # Arrange
    mock_instance = mock_s3_service.return_value
    mock_instance.upload_file.return_value = "mocked-file-key.pdf"
    
    file_content = b"fake file data"
    files = {"file": ("test.pdf", file_content, "application/pdf")}
    
    # Act
    response = client.post(
        "/api/v1/documents/upload", 
        files=files, 
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Assert
    assert response.status_code == 201
    assert response.json()["file_key"] == "mocked-file-key.pdf"
    
    mock_instance.upload_file.assert_called_once()
    mock_celery_delay.assert_called_once_with("mocked-file-key.pdf")

def test_upload_document_no_auth(client: TestClient):
    # Arrange
    file_content = b"fake file data"
    files = {"file": ("test.pdf", file_content, "application/pdf")}
    
    # Act
    response = client.post("/api/v1/documents/upload", files=files)
    
    # Assert
    assert response.status_code == 401

def test_upload_document_student_forbidden(client: TestClient, student_token: str):
    # Arrange
    file_content = b"fake file data"
    files = {"file": ("test.pdf", file_content, "application/pdf")}
    
    # Act
    response = client.post(
        "/api/v1/documents/upload", 
        files=files,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    # Assert
    assert response.status_code == 403

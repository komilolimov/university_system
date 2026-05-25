import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from unittest.mock import patch
from datetime import date
from src.models.employee import Employee, Role
from src.core.security import get_password_hash

def setup_auth_db(session: Session):
    role = Role(title="Admin", is_faculty=False)
    session.add(role)
    session.commit()
    session.refresh(role)
    
    emp = Employee(
        first_name="Admin",
        last_name="User",
        email="admin@test.com",
        role_id=role.id,
        hire_date=date.today(),
        hashed_password=get_password_hash("password123")
    )
    session.add(emp)
    session.commit()

def test_login_success(client: TestClient, session: Session):
    # Arrange
    setup_auth_db(session)
    # Act
    response = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "password123"})
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "Admin"

def test_login_invalid_password(client: TestClient, session: Session):
    # Arrange
    setup_auth_db(session)
    # Act
    response = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "wrong"})
    # Assert
    assert response.status_code == 401

def test_login_non_existent_user(client: TestClient):
    # Arrange (no user)
    # Act
    response = client.post("/api/v1/auth/login", json={"email": "nobody@test.com", "password": "password123"})
    # Assert
    assert response.status_code == 401

@patch("src.services.auth.token_blocklist")
def test_logout(mock_redis, client: TestClient, admin_token: str):
    # Arrange
    # Token blocklist is mocked
    # Act
    response = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    # Assert
    assert response.status_code == 200
    mock_redis.setex.assert_called_once()

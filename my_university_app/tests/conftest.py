import sys
from unittest.mock import MagicMock

# Mock Redis blocklist before importing src.main to prevent connection errors
mock_redis = MagicMock()
mock_redis.get.return_value = None
mock_redis.set.return_value = True
mock_redis.delete.return_value = True

redis_client_mock = MagicMock()
redis_client_mock.token_blocklist = mock_redis
sys.modules['src.core.redis_client'] = redis_client_mock

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from src.main import app
from src.api.deps import get_session
from src.core.security import create_access_token

# Use an in-memory SQLite database for testing
sqlite_url = "sqlite://"

engine = create_engine(
    sqlite_url, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
        
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="admin_token")
def admin_token_fixture():
    # Provide subject ID, user_type, and role as expected by the new deps
    return create_access_token(subject=1, user_type="employee", role="Admin")

@pytest.fixture(name="student_token")
def student_token_fixture():
    return create_access_token(subject=2, user_type="student", role="Student")

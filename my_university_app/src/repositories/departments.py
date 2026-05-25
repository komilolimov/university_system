from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.base import BaseRepository
from src.models import Department, School, ResearchLab

class DepartmentRepository(BaseRepository[Department]):
    def __init__(self):
        super().__init__(Department)

class SchoolRepository(BaseRepository[School]):
    def __init__(self):
        super().__init__(School)

class ResearchLabRepository(BaseRepository[ResearchLab]):
    def __init__(self):
        super().__init__(ResearchLab)

department_repository = DepartmentRepository()
school_repository = SchoolRepository()
research_lab_repository = ResearchLabRepository()

from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.base import BaseRepository
from src.models import AcademicTerm

class AcademicTermRepository(BaseRepository[AcademicTerm]):
    def __init__(self):
        super().__init__(AcademicTerm)

academic_term_repository = AcademicTermRepository()

from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.base import BaseRepository
from src.models import DegreeProgram, ProgramRequirement

class DegreeProgramRepository(BaseRepository[DegreeProgram]):
    def __init__(self):
        super().__init__(DegreeProgram)

class ProgramRequirementRepository(BaseRepository[ProgramRequirement]):
    def __init__(self):
        super().__init__(ProgramRequirement)

    def get(self, session: Session, program_id: int, catalog_id: int) -> Optional[ProgramRequirement]:
        return session.get(ProgramRequirement, (program_id, catalog_id))

    def delete(self, session: Session, program_id: int, catalog_id: int) -> bool:
        obj = self.get(session, program_id, catalog_id)
        if obj:
            session.delete(obj)
            session.flush()
            return True
        return False

degree_program_repository = DegreeProgramRepository()
program_requirement_repository = ProgramRequirementRepository()

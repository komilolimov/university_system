from src.core.exceptions import EntityNotFoundError
from typing import List
from sqlmodel import Session
from src.repositories.programs import degree_program_repository, program_requirement_repository
from src.models.program import (
    DegreeProgram, DegreeProgramCreate, DegreeProgramUpdate,
    ProgramRequirement, ProgramRequirementCreate, ProgramRequirementUpdate,
)
from src.core.uow import UnitOfWork


class DegreeProgramService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[DegreeProgram]:
        return degree_program_repository.get_all(session=session, skip=skip, limit=limit)

    def get(self, session: Session, id: int) -> DegreeProgram:
        obj = degree_program_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("DegreeProgram", id)
        return obj

    def create(self, session: Session, obj_in: DegreeProgramCreate) -> DegreeProgram:
        with UnitOfWork(session):
            return degree_program_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: DegreeProgramUpdate) -> DegreeProgram:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return degree_program_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            degree_program_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Degree program deleted"}


class ProgramRequirementService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[ProgramRequirement]:
        return program_requirement_repository.get_all(session=session, skip=skip, limit=limit)

    def get(self, session: Session, program_id: int, catalog_id: int) -> ProgramRequirement:
        obj = program_requirement_repository.get(session=session, program_id=program_id, catalog_id=catalog_id)
        if not obj:
            raise EntityNotFoundError("ProgramRequirement", f"{program_id}-{catalog_id}")
        return obj

    def create(self, session: Session, obj_in: ProgramRequirementCreate) -> ProgramRequirement:
        with UnitOfWork(session):
            return program_requirement_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, program_id: int, catalog_id: int, obj_in: ProgramRequirementUpdate) -> ProgramRequirement:
        with UnitOfWork(session):
            db_obj = self.get(session=session, program_id=program_id, catalog_id=catalog_id)
            return program_requirement_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, program_id: int, catalog_id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, program_id=program_id, catalog_id=catalog_id)
            program_requirement_repository.delete(session=session, program_id=db_obj.program_id, catalog_id=db_obj.catalog_id)
            return {"Success": "Program requirement deleted"}


degree_program_service = DegreeProgramService()
program_requirement_service = ProgramRequirementService()

from sqlmodel import Session, select
from src.core.db import engine
from src.models import Permission, Role, RolePermissionLink

MISSING_PERMISSIONS = [
    "permissions:write", "permissions:delete",
    "documents:read", "documents:write", "documents:delete",
    "research_labs:read", "research_labs:write", "research_labs:delete",
    "program_requirements:read", "program_requirements:write", "program_requirements:delete",
    "employee_experience:read", "employee_experience:write"
]

def add_missing_permissions():
    with Session(engine) as session:
        # Fetch existing permissions to avoid duplicates
        existing_perms = session.exec(select(Permission.name)).all()
        
        perms_to_add = [p for p in MISSING_PERMISSIONS if p not in existing_perms]
        
        if not perms_to_add:
            print("All missing permissions already exist in the database.")
            return

        print(f"Adding {len(perms_to_add)} missing permissions...")
        
        new_permissions = []
        for p_name in perms_to_add:
            new_perm = Permission(name=p_name, description=f"Allows {p_name}", is_active=True)
            new_permissions.append(new_perm)
            
        session.add_all(new_permissions)
        session.commit()
        
        # Now give all these new permissions to the Administrator role
        admin_role = session.exec(select(Role).where(Role.title == "Administrator")).first()
        if admin_role:
            print("Assigning new permissions to Administrator role...")
            # Re-fetch new permissions to get their IDs
            added_perms = session.exec(select(Permission).where(Permission.name.in_(perms_to_add))).all()
            
            links = [
                RolePermissionLink(role_id=admin_role.id, permission_id=p.id)
                for p in added_perms
            ]
            session.add_all(links)
            session.commit()
            print("Done!")
        else:
            print("Administrator role not found. Permissions added, but not assigned.")

if __name__ == "__main__":
    add_missing_permissions()

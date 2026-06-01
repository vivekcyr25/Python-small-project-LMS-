from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
from app.core.deps import get_current_user
from typing import List

def require_roles(roles: List[str]):
    def role_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions to access this resource",
            )
        return current_user
    return role_dependency

# Convenience dependencies
def is_student(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.STUDENT.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student role required")
    return current_user

def is_instructor(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.INSTRUCTOR.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Instructor role required")
    return current_user

def is_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return current_user

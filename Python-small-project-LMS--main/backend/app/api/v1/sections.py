from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, get_current_user
from app.models.content import Section
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User, UserRole
from app.schemas.content import SectionCreate, SectionUpdate, SectionRead

router = APIRouter()

def check_course_owner_or_admin(course_id: int, user: User, db: Session):
    if user.role == UserRole.ADMIN.value:
        return
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if course.instructor_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage content for this course"
        )

def check_enrollment_or_staff(course_id: int, user: User, db: Session):
    if user.role in [UserRole.ADMIN.value, UserRole.INSTRUCTOR.value]:
        return
    enrolled = db.query(Enrollment).filter(
        Enrollment.student_id == user.id,
        Enrollment.course_id == course_id,
        Enrollment.status == "active"
    ).first()
    if not enrolled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled in this course to view its sections"
        )

@router.post("/courses/{course_id}/sections", response_model=SectionRead, status_code=status.HTTP_201_CREATED)
def create_section(course_id: int, section_in: SectionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_course_owner_or_admin(course_id, current_user, db)
    
    # Calculate order index if not provided or set to 0
    if not section_in.order_index:
        max_order = db.query(Section).filter(Section.course_id == course_id).count()
        order_index = max_order + 1
    else:
        order_index = section_in.order_index

    db_section = Section(
        course_id=course_id,
        title=section_in.title,
        description=section_in.description,
        order_index=order_index,
        is_published=section_in.is_published
    )
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section

@router.get("/courses/{course_id}/sections", response_model=List[SectionRead])
def get_sections(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if student is enrolled or user is staff
    check_enrollment_or_staff(course_id, current_user, db)
    
    query = db.query(Section).filter(Section.course_id == course_id)
    
    # Students can only view published sections
    if current_user.role == UserRole.STUDENT.value:
        query = query.filter(Section.is_published == True)
        
    return query.order_by(Section.order_index.asc()).all()

@router.put("/sections/{section_id}", response_model=SectionRead)
def update_section(section_id: int, section_in: SectionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_section = db.query(Section).filter(Section.id == section_id).first()
    if not db_section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
        
    check_course_owner_or_admin(db_section.course_id, current_user, db)
    
    for field, value in section_in.dict(exclude_unset=True).items():
        setattr(db_section, field, value)
        
    db.commit()
    db.refresh(db_section)
    return db_section

@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_section = db.query(Section).filter(Section.id == section_id).first()
    if not db_section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
        
    check_course_owner_or_admin(db_section.course_id, current_user, db)
    
    db.delete(db_section)
    db.commit()
    return None

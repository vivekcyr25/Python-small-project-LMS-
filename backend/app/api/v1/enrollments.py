from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_user
from app.core.permissions import is_student, require_roles
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.user import User, UserRole
from app.schemas.enrollment import EnrollmentResponse

router = APIRouter()

@router.post("/{course_id}", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll_in_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(is_student)):
    # Check if course exists and is published
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if not course.is_published:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot enroll in an unpublished course")
    
    # Check if already enrolled
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    if existing_enrollment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already enrolled in this course")
    
    db_enrollment = Enrollment(student_id=current_user.id, course_id=course_id)
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def unenroll_from_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(is_student)):
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    
    db.delete(enrollment)
    db.commit()
    return None

@router.get("/me", response_model=List[EnrollmentResponse])
def get_my_enrollments(db: Session = Depends(get_db), current_user: User = Depends(is_student)):
    return db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()

@router.get("/course/{course_id}", response_model=List[EnrollmentResponse])
def get_course_enrollments(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    # Check permissions
    if current_user.role == UserRole.ADMIN.value:
        pass
    elif current_user.role == UserRole.INSTRUCTOR.value and course.instructor_id == current_user.id:
        pass
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view enrollments for this course")
    
    return db.query(Enrollment).filter(Enrollment.course_id == course_id).all()

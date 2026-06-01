from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_user
from app.core.permissions import require_roles, is_instructor, is_admin
from app.models.course import Course
from app.models.user import User, UserRole
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse

router = APIRouter()

@router.get("/", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.ADMIN.value:
        return db.query(Course).all()
    # For students and instructors, show only published courses (or instructor's own courses if we want, but prompt says "Anyone authenticated can list published courses.")
    # Let's show published courses for everyone who is not admin.
    return db.query(Course).filter(Course.is_published == True).all()

@router.get("/instructor/me", response_model=List[CourseResponse])
def get_instructor_courses(db: Session = Depends(get_db), current_user: User = Depends(is_instructor)):
    return db.query(Course).filter(Course.instructor_id == current_user.id).all()

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    # If not published and not owner/admin, raise 403
    if not course.is_published and course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this course")
    
    return course

@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(course_in: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(["instructor", "admin"]))):
    # Check if slug exists
    if db.query(Course).filter(Course.slug == course_in.slug).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
    
    db_course = Course(**course_in.dict(), instructor_id=current_user.id)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, course_in: CourseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    # Check permissions: owner or admin
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this course")
    
    for field, value in course_in.dict(exclude_unset=True).items():
        setattr(course, field, value)
    
    db.commit()
    db.refresh(course)
    return course

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    # Check permissions: owner or admin
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this course")
    
    db.delete(course)
    db.commit()
    return None

@router.patch("/{course_id}/publish", response_model=CourseResponse)
def publish_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to publish this course")
    
    course.is_published = True
    db.commit()
    db.refresh(course)
    return course

@router.patch("/{course_id}/unpublish", response_model=CourseResponse)
def unpublish_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to unpublish this course")
    
    course.is_published = False
    db.commit()
    db.refresh(course)
    return course

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.core.deps import get_db, get_current_user
from app.models.content import Section, Lesson
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.assessment import LessonProgress, Quiz
from app.models.user import User, UserRole
from app.schemas.content import LessonCreate, LessonUpdate, LessonRead

router = APIRouter()

class LessonReorderRequest(BaseModel):
    new_order_index: int

def get_section_and_check_permission(section_id: int, user: User, db: Session):
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    
    course = db.query(Course).filter(Course.id == section.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        
    if user.role != UserRole.ADMIN.value and course.instructor_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage content in this course"
        )
    return section, course

def check_lesson_permission(lesson: Lesson, user: User, db: Session, read_only: bool = False):
    section = db.query(Section).filter(Section.id == lesson.section_id).first()
    course = db.query(Course).filter(Course.id == section.course_id).first()
    
    # Admins can access everything
    if user.role == UserRole.ADMIN.value:
        return
        
    # Instructors can access their own courses
    if user.role == UserRole.INSTRUCTOR.value:
        if course.instructor_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this lesson"
            )
        return
        
    # Students
    if read_only:
        # Preview lessons can be accessed without enrollment
        if lesson.is_preview and lesson.is_published:
            return
            
        # Non-preview lessons require enrollment
        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == user.id,
            Enrollment.course_id == course.id,
            Enrollment.status == "active"
        ).first()
        if not enrolled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this course to view this lesson"
            )
        if not lesson.is_published:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This lesson is not published yet"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors and admins can modify lessons"
        )

@router.post("/sections/{section_id}/lessons", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
def create_lesson(section_id: int, lesson_in: LessonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_section_and_check_permission(section_id, current_user, db)
    
    # Calculate order index if not specified
    if not lesson_in.order_index:
        max_order = db.query(Lesson).filter(Lesson.section_id == section_id).count()
        order_index = max_order + 1
    else:
        order_index = lesson_in.order_index
        
    db_lesson = Lesson(
        section_id=section_id,
        title=lesson_in.title,
        description=lesson_in.description,
        lesson_type=lesson_in.lesson_type,
        content_text=lesson_in.content_text,
        content_url=lesson_in.content_url,
        duration_seconds=lesson_in.duration_seconds,
        order_index=order_index,
        is_preview=lesson_in.is_preview,
        is_published=lesson_in.is_published
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.get("/sections/{section_id}/lessons", response_model=List[LessonRead])
def get_lessons(section_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
        
    # Check enrollment for student, or if course owner
    if current_user.role == UserRole.STUDENT.value:
        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == section.course_id,
            Enrollment.status == "active"
        ).first()
        if not enrolled:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You must be enrolled to view lessons")
            
    query = db.query(Lesson).filter(Lesson.section_id == section_id)
    if current_user.role == UserRole.STUDENT.value:
        query = query.filter(Lesson.is_published == True)
        
    return query.order_by(Lesson.order_index.asc()).all()

@router.get("/lessons/{lesson_id}", response_model=LessonRead)
def get_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
        
    check_lesson_permission(lesson, current_user, db, read_only=True)
    return lesson

@router.put("/lessons/{lesson_id}", response_model=LessonRead)
def update_lesson(lesson_id: int, lesson_in: LessonUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
        
    check_lesson_permission(lesson, current_user, db, read_only=False)
    
    for field, value in lesson_in.dict(exclude_unset=True).items():
        setattr(lesson, field, value)
        
    db.commit()
    db.refresh(lesson)
    return lesson

@router.delete("/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
        
    check_lesson_permission(lesson, current_user, db, read_only=False)
    
    db.delete(lesson)
    db.commit()
    return None

@router.patch("/lessons/{lesson_id}/reorder", response_model=LessonRead)
def reorder_lesson(lesson_id: int, req: LessonReorderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
        
    check_lesson_permission(lesson, current_user, db, read_only=False)
    
    section_id = lesson.section_id
    old_order = lesson.order_index
    new_order = req.new_order_index
    
    if old_order != new_order:
        # Shift others
        if old_order < new_order:
            db.query(Lesson).filter(
                Lesson.section_id == section_id,
                Lesson.order_index > old_order,
                Lesson.order_index <= new_order
            ).update({Lesson.order_index: Lesson.order_index - 1}, synchronize_session=False)
        else:
            db.query(Lesson).filter(
                Lesson.section_id == section_id,
                Lesson.order_index >= new_order,
                Lesson.order_index < old_order
            ).update({Lesson.order_index: Lesson.order_index + 1}, synchronize_session=False)
            
        lesson.order_index = new_order
        db.commit()
        db.refresh(lesson)
        
    return lesson

@router.get("/courses/{course_id}/learn")
def learn_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        
    # Check permissions
    if current_user.role == UserRole.STUDENT.value:
        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
            Enrollment.status == "active"
        ).first()
        if not enrolled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this course to access the learning space"
            )
            
    # Fetch sections
    sections_query = db.query(Section).filter(Section.course_id == course_id)
    if current_user.role == UserRole.STUDENT.value:
        sections_query = sections_query.filter(Section.is_published == True)
    sections = sections_query.order_by(Section.order_index.asc()).all()
    
    # Build details
    sections_data = []
    for s in sections:
        lessons_query = db.query(Lesson).filter(Lesson.section_id == s.id)
        if current_user.role == UserRole.STUDENT.value:
            lessons_query = lessons_query.filter(Lesson.is_published == True)
        lessons = lessons_query.order_by(Lesson.order_index.asc()).all()
        
        lessons_data = []
        for l in lessons:
            # Check progress
            prog = db.query(LessonProgress).filter(
                LessonProgress.user_id == current_user.id,
                LessonProgress.lesson_id == l.id
            ).first()
            
            prog_data = None
            if prog:
                prog_data = {
                    "status": prog.status,
                    "progress_percent": prog.progress_percent,
                    "resume_position_seconds": prog.resume_position_seconds,
                    "completed_at": prog.completed_at
                }
            else:
                prog_data = {
                    "status": "not_started",
                    "progress_percent": 0,
                    "resume_position_seconds": 0,
                    "completed_at": None
                }
                
            lessons_data.append({
                "id": l.id,
                "section_id": l.section_id,
                "title": l.title,
                "description": l.description,
                "lesson_type": l.lesson_type,
                "content_text": l.content_text,
                "content_url": l.content_url,
                "duration_seconds": l.duration_seconds,
                "order_index": l.order_index,
                "is_preview": l.is_preview,
                "is_published": l.is_published,
                "progress": prog_data
            })
            
        sections_data.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "order_index": s.order_index,
            "is_published": s.is_published,
            "lessons": lessons_data
        })
        
    return {
        "course": {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "thumbnail_url": course.thumbnail_url
        },
        "sections": sections_data
    }

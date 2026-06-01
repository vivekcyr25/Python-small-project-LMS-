from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Dict, Any

from app.core.deps import get_db, get_current_user
from app.models.content import Section, Lesson
from app.models.enrollment import Enrollment
from app.models.assessment import LessonProgress
from app.models.user import User, UserRole
from app.schemas.assessment import LessonProgressUpdate, LessonProgressRead

router = APIRouter()

def check_enrollment(lesson_id: int, user: User, db: Session):
    lesson = db.query(Lesson).join(Section).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
        
    enrolled = db.query(Enrollment).filter(
        Enrollment.student_id == user.id,
        Enrollment.course_id == lesson.section.course_id,
        Enrollment.status == "active"
    ).first()
    if not enrolled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled in this course to update lesson progress"
        )
    return lesson

@router.post("/lessons/{lesson_id}/progress", response_model=LessonProgressRead)
def update_lesson_progress(lesson_id: int, progress_in: LessonProgressUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = check_enrollment(lesson_id, current_user, db)
    
    db_progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()
    
    now = datetime.utcnow()
    
    if not db_progress:
        db_progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            status=progress_in.status,
            progress_percent=progress_in.progress_percent,
            resume_position_seconds=progress_in.resume_position_seconds,
            completed_at=now if progress_in.status == "completed" else None
        )
        db.add(db_progress)
    else:
        if progress_in.status is not None:
            db_progress.status = progress_in.status
            if progress_in.status == "completed" and not db_progress.completed_at:
                db_progress.completed_at = now
        if progress_in.progress_percent is not None:
            db_progress.progress_percent = progress_in.progress_percent
        if progress_in.resume_position_seconds is not None:
            db_progress.resume_position_seconds = progress_in.resume_position_seconds
            
    db.commit()
    db.refresh(db_progress)
    return db_progress

@router.patch("/lessons/{lesson_id}/complete", response_model=LessonProgressRead)
def complete_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = check_enrollment(lesson_id, current_user, db)
    
    db_progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()
    
    now = datetime.utcnow()
    
    if not db_progress:
        db_progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            status="completed",
            progress_percent=100,
            completed_at=now
        )
        db.add(db_progress)
    else:
        db_progress.status = "completed"
        db_progress.progress_percent = 100
        if not db_progress.completed_at:
            db_progress.completed_at = now
            
    db.commit()
    db.refresh(db_progress)
    return db_progress

@router.get("/courses/{course_id}/progress")
def get_course_progress(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate progress for enrolled student
    if current_user.role == UserRole.STUDENT.value:
        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
            Enrollment.status == "active"
        ).first()
        if not enrolled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled to view course progress"
            )
            
    # Count total published lessons in this course
    total_lessons = db.query(Lesson).join(Section).filter(
        Section.course_id == course_id,
        Section.is_published == True,
        Lesson.is_published == True
    ).count()
    
    if total_lessons == 0:
        return {
            "completed_lessons": 0,
            "total_lessons": 0,
            "progress_percent": 0
        }
        
    # Count completed lessons for this student
    completed_lessons = db.query(LessonProgress).join(Lesson).join(Section).filter(
        Section.course_id == course_id,
        LessonProgress.user_id == current_user.id,
        LessonProgress.status == "completed"
    ).count()
    
    progress_percent = int((completed_lessons / total_lessons) * 100)
    
    return {
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "progress_percent": progress_percent
    }

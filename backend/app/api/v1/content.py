from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, get_current_user
from app.models.content import Module, Lesson
from app.schemas.content import Module as ModuleSchema, ModuleCreate, ModuleUpdate
from app.schemas.content import Lesson as LessonSchema, LessonCreate, LessonUpdate
from app.models.user import User, UserRole

router = APIRouter()

# --- Module Routes ---

@router.post("/modules", response_model=ModuleSchema, status_code=status.HTTP_201_CREATED)
def create_module(module_in: ModuleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.INSTRUCTOR and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to create modules")
    
    new_module = Module(**module_in.dict())
    db.add(new_module)
    db.commit()
    db.refresh(new_module)
    return new_module

@router.get("/courses/{course_id}/modules", response_model=List[ModuleSchema])
def get_course_modules(course_id: int, db: Session = Depends(get_db)):
    modules = db.query(Module).filter(Module.course_id == course_id).order_by(Module.order).all()
    return modules

# --- Lesson Routes ---

@router.post("/lessons", response_model=LessonSchema, status_code=status.HTTP_201_CREATED)
def create_lesson(lesson_in: LessonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.INSTRUCTOR and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to create lessons")
    
    new_lesson = Lesson(**lesson_in.dict())
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

@router.get("/modules/{module_id}/lessons", response_model=List[LessonSchema])
def get_module_lessons(module_id: int, db: Session = Depends(get_db)):
    lessons = db.query(Lesson).filter(Lesson.module_id == module_id).order_by(Lesson.order).all()
    return lessons

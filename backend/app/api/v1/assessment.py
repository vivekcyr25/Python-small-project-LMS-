from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, get_current_user
from app.models.assessment import Progress, Quiz, Question, Certificate
from app.schemas.assessment import (
    Progress as ProgressSchema, ProgressCreate,
    Quiz as QuizSchema, QuizCreate,
    Question as QuestionSchema, QuestionCreate,
    Certificate as CertificateSchema, CertificateCreate
)
from app.models.user import User, UserRole

router = APIRouter()

# --- Progress Routes ---

@router.post("/progress", response_model=ProgressSchema)
def update_progress(progress_in: ProgressCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if progress exists
    existing = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.lesson_id == progress_in.lesson_id
    ).first()
    
    if existing:
        existing.completed = progress_in.completed
        db.commit()
        db.refresh(existing)
        return existing
        
    new_progress = Progress(
        user_id=current_user.id,
        lesson_id=progress_in.lesson_id,
        completed=progress_in.completed
    )
    db.add(new_progress)
    db.commit()
    db.refresh(new_progress)
    return new_progress

@router.get("/progress/{course_id}", response_model=List[ProgressSchema])
def get_user_course_progress(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Assuming lessons are part of modules which are part of courses
    # Need to join to get course progress. For simplicity in this demo:
    from app.models.content import Lesson, Module
    progress = db.query(Progress).join(Lesson).join(Module).filter(
        Module.course_id == course_id,
        Progress.user_id == current_user.id
    ).all()
    return progress

# --- Quiz Routes ---

@router.post("/quizzes", response_model=QuizSchema, status_code=status.HTTP_201_CREATED)
def create_quiz(quiz_in: QuizCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.INSTRUCTOR and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to create quizzes")
    
    new_quiz = Quiz(**quiz_in.dict())
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@router.get("/courses/{course_id}/quizzes", response_model=List[QuizSchema])
def get_course_quizzes(course_id: int, db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).all()
    return quizzes

# --- Question Routes ---

@router.post("/quizzes/{quiz_id}/questions", response_model=QuestionSchema, status_code=status.HTTP_201_CREATED)
def create_question(quiz_id: int, question_in: QuestionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.INSTRUCTOR and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to create questions")
        
    new_question = Question(**question_in.dict(), quiz_id=quiz_id)
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question

@router.get("/quizzes/{quiz_id}/questions", response_model=List[QuestionSchema])
def get_quiz_questions(quiz_id: int, db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    return questions

# --- Certificate Routes ---

@router.post("/certificates", response_model=CertificateSchema, status_code=status.HTTP_201_CREATED)
def issue_certificate(cert_in: CertificateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Normally we'd verify 100% progress before issuing.
    # We issue it to the current user.
    new_cert = Certificate(
        user_id=current_user.id,
        course_id=cert_in.course_id,
        certificate_url=cert_in.certificate_url
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return new_cert

@router.get("/certificates", response_model=List[CertificateSchema])
def get_my_certificates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    return certs

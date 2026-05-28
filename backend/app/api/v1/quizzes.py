from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from app.core.deps import get_db, get_current_user
from app.models.content import Section, Lesson
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.assessment import Quiz, Question, AnswerOption, QuizAttempt, QuizAttemptAnswer, LessonProgress
from app.models.user import User, UserRole
from app.schemas.assessment import (
    QuizCreate, QuizRead, QuestionCreate, QuestionRead,
    AnswerOptionCreate, AnswerOptionRead, QuizSubmitRequest, QuizAttemptRead
)

router = APIRouter()

def get_lesson_and_check_ownership(lesson_id: int, user: User, db: Session):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
        
    section = db.query(Section).filter(Section.id == lesson.section_id).first()
    course = db.query(Course).filter(Course.id == section.course_id).first()
    
    if user.role != UserRole.ADMIN.value and course.instructor_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage quizzes for this course"
        )
    return lesson

@router.post("/lessons/{lesson_id}/quiz", response_model=QuizRead, status_code=status.HTTP_201_CREATED)
def create_quiz(lesson_id: int, quiz_in: QuizCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = get_lesson_and_check_ownership(lesson_id, current_user, db)
    
    # Check if quiz already exists for this lesson
    existing_quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson_id).first()
    if existing_quiz:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz already exists for this lesson")
        
    db_quiz = Quiz(
        lesson_id=lesson_id,
        title=quiz_in.title,
        description=quiz_in.description,
        passing_score=quiz_in.passing_score
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.get("/lessons/{lesson_id}/quiz")
def get_quiz(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
        
    # Student verification: must be enrolled or lesson must be preview
    if current_user.role == UserRole.STUDENT.value:
        if not lesson.is_preview:
            section = db.query(Section).filter(Section.id == lesson.section_id).first()
            enrolled = db.query(Enrollment).filter(
                Enrollment.student_id == current_user.id,
                Enrollment.course_id == section.course_id,
                Enrollment.status == "active"
            ).first()
            if not enrolled:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You must be enrolled to access this quiz")
                
    quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found for this lesson")
        
    # Serialize questions and options manually to strip correct answers if student
    is_student = (current_user.role == UserRole.STUDENT.value)
    
    questions_data = []
    for q in quiz.questions:
        options_data = []
        for o in q.options:
            options_data.append({
                "id": o.id,
                "question_id": o.question_id,
                "option_text": o.option_text,
                "order_index": o.order_index,
                # ONLY return correctness to instructors/admins
                "is_correct": o.is_correct if not is_student else False
            })
        questions_data.append({
            "id": q.id,
            "quiz_id": q.quiz_id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "points": q.points,
            "order_index": q.order_index,
            "options": options_data
        })
        
    return {
        "id": quiz.id,
        "lesson_id": quiz.lesson_id,
        "title": quiz.title,
        "description": quiz.description,
        "passing_score": quiz.passing_score,
        "questions": questions_data
    }

@router.post("/quizzes/{quiz_id}/questions", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
def create_question(quiz_id: int, question_in: QuestionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
        
    get_lesson_and_check_ownership(quiz.lesson_id, current_user, db)
    
    # Calculate order index
    max_order = db.query(Question).filter(Question.quiz_id == quiz_id).count()
    order_index = max_order + 1
    
    db_question = Question(
        quiz_id=quiz_id,
        question_text=question_in.question_text,
        question_type=question_in.question_type,
        points=question_in.points,
        order_index=order_index
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.post("/questions/{question_id}/options", response_model=AnswerOptionRead, status_code=status.HTTP_201_CREATED)
def create_option(question_id: int, option_in: AnswerOptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
        
    quiz = db.query(Quiz).filter(Quiz.id == question.quiz_id).first()
    get_lesson_and_check_ownership(quiz.lesson_id, current_user, db)
    
    # Calculate order index
    max_order = db.query(AnswerOption).filter(AnswerOption.question_id == question_id).count()
    order_index = max_order + 1
    
    db_option = AnswerOption(
        question_id=question_id,
        option_text=option_in.option_text,
        is_correct=option_in.is_correct,
        order_index=order_index
    )
    db.add(db_option)
    db.commit()
    db.refresh(db_option)
    return db_option

@router.post("/quizzes/{quiz_id}/submit", response_model=QuizAttemptRead)
def submit_quiz(quiz_id: int, submission: QuizSubmitRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
        
    lesson = db.query(Lesson).filter(Lesson.id == quiz.lesson_id).first()
    section = db.query(Section).filter(Section.id == lesson.section_id).first()
    
    # Verify enrollment
    if current_user.role == UserRole.STUDENT.value:
        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == section.course_id,
            Enrollment.status == "active"
        ).first()
        if not enrolled:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Must be enrolled to submit quiz")
            
    # Load questions and answers mapping
    submission_answers = {a.question_id: a for a in submission.answers}
    
    total_score = 0
    max_score = 0
    
    attempt_answers_to_create = []
    
    for question in quiz.questions:
        max_score += question.points
        user_ans = submission_answers.get(question.id)
        
        is_correct = False
        points_awarded = 0
        selected_option_ids = []
        answer_text = None
        
        if user_ans:
            selected_option_ids = user_ans.selected_option_ids or []
            answer_text = user_ans.answer_text
            
            if question.question_type == "mcq_single":
                # Single correct option check
                correct_option = db.query(AnswerOption).filter(
                    AnswerOption.question_id == question.id,
                    AnswerOption.is_correct == True
                ).first()
                if correct_option and len(selected_option_ids) == 1 and selected_option_ids[0] == correct_option.id:
                    is_correct = True
                    points_awarded = question.points
                    
            elif question.question_type == "mcq_multiple":
                # All correct options check
                correct_options = db.query(AnswerOption).filter(
                    AnswerOption.question_id == question.id,
                    AnswerOption.is_correct == True
                ).all()
                correct_ids = {o.id for o in correct_options}
                user_ids = set(selected_option_ids)
                if correct_ids == user_ids and len(correct_ids) > 0:
                    is_correct = True
                    points_awarded = question.points
                    
            elif question.question_type == "short_answer":
                # Matches correct option text (case insensitive, trimmed)
                correct_option = db.query(AnswerOption).filter(
                    AnswerOption.question_id == question.id,
                    AnswerOption.is_correct == True
                ).first()
                if correct_option and answer_text:
                    if correct_option.option_text.strip().lower() == answer_text.strip().lower():
                        is_correct = True
                        points_awarded = question.points
                        
        total_score += points_awarded
        attempt_answers_to_create.append({
            "question_id": question.id,
            "selected_option_ids": selected_option_ids,
            "answer_text": answer_text,
            "is_correct": is_correct,
            "points_awarded": points_awarded
        })
        
    percentage = int((total_score / max_score) * 100) if max_score > 0 else 0
    passed = percentage >= quiz.passing_score
    
    # Save QuizAttempt
    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=current_user.id,
        score=total_score,
        max_score=max_score,
        percentage=percentage,
        passed=passed
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Create child answers
    for ans in attempt_answers_to_create:
        db_ans = QuizAttemptAnswer(
            attempt_id=attempt.id,
            question_id=ans["question_id"],
            selected_option_ids=ans["selected_option_ids"],
            answer_text=ans["answer_text"],
            is_correct=ans["is_correct"],
            points_awarded=ans["points_awarded"]
        )
        db.add(db_ans)
        
    # Mark lesson progress as complete if they passed
    if passed:
        prog = db.query(LessonProgress).filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == quiz.lesson_id
        ).first()
        if not prog:
            prog = LessonProgress(
                user_id=current_user.id,
                lesson_id=quiz.lesson_id,
                status="completed",
                progress_percent=100,
                completed_at=attempt.submitted_at
            )
            db.add(prog)
        else:
            prog.status = "completed"
            prog.progress_percent = 100
            if not prog.completed_at:
                prog.completed_at = attempt.submitted_at
                
    db.commit()
    db.refresh(attempt)
    return attempt

@router.get("/quizzes/{quiz_id}/attempts/me", response_model=List[QuizAttemptRead])
def get_my_attempts(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.submitted_at.desc()).all()
    return attempts

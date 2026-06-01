from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


# ─────────────────────────────────────────────────────────
# Lesson Progress (per-user, per-lesson)
# ─────────────────────────────────────────────────────────
class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="_user_lesson_uc"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    # status: not_started | in_progress | completed
    status = Column(String, nullable=False, default="not_started")
    progress_percent = Column(Integer, nullable=False, default=0)
    resume_position_seconds = Column(Integer, nullable=False, default=0)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User")
    lesson = relationship("Lesson", back_populates="progress_records")


# ─────────────────────────────────────────────────────────
# Quiz / Question / AnswerOption
# ─────────────────────────────────────────────────────────
class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    passing_score = Column(Integer, nullable=False, default=60)  # percentage
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    lesson = relationship("Lesson", back_populates="quiz")
    questions = relationship(
        "Question",
        back_populates="quiz",
        cascade="all, delete-orphan",
        order_by="Question.order_index",
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    # question_type: mcq_single | mcq_multiple | short_answer
    question_type = Column(String, nullable=False, default="mcq_single")
    points = Column(Integer, nullable=False, default=1)
    order_index = Column(Integer, nullable=False, default=0)

    quiz = relationship("Quiz", back_populates="questions")
    options = relationship(
        "AnswerOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="AnswerOption.order_index",
    )


class AnswerOption(Base):
    __tablename__ = "answer_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)
    order_index = Column(Integer, nullable=False, default=0)

    question = relationship("Question", back_populates="options")


# ─────────────────────────────────────────────────────────
# Quiz Attempt / Attempt Answer
# ─────────────────────────────────────────────────────────
class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False, default=0)
    max_score = Column(Integer, nullable=False, default=0)
    percentage = Column(Integer, nullable=False, default=0)
    passed = Column(Boolean, nullable=False, default=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    answers = relationship(
        "QuizAttemptAnswer",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )


class QuizAttemptAnswer(Base):
    __tablename__ = "quiz_attempt_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    # Stored as JSON array of ints, e.g. [12, 13]
    selected_option_ids = Column(JSON, nullable=True)
    answer_text = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    points_awarded = Column(Integer, nullable=False, default=0)

    attempt = relationship("QuizAttempt", back_populates="answers")


# ─────────────────────────────────────────────────────────
# Certificate (kept for forward compatibility — not built in Phase 2)
# ─────────────────────────────────────────────────────────
class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    certificate_url = Column(String, nullable=True)

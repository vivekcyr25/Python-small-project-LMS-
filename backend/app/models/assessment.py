from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    completed = Column(Boolean, default=False, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")
    lesson = relationship("Lesson", back_populates="progress_records")

# Alias LessonProgress to Progress for compatibility with other files
LessonProgress = Progress


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)

    course = relationship("Course")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # JSON array of strings
    correct_index = Column(Integer, nullable=False)

    quiz = relationship("Quiz", back_populates="questions")


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    certificate_url = Column(String, nullable=True)


# Dummy classes to prevent import errors in legacy routes
class AnswerOption(Base):
    __tablename__ = "answer_options_dummy"
    id = Column(Integer, primary_key=True)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts_dummy"
    id = Column(Integer, primary_key=True)

class QuizAttemptAnswer(Base):
    __tablename__ = "quiz_attempt_answers_dummy"
    id = Column(Integer, primary_key=True)

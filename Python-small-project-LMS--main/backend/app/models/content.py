from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Section(Base):
    """A course is composed of ordered Sections, each containing Lessons."""
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False, default=0)
    is_published = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    lessons = relationship(
        "Lesson",
        back_populates="section",
        cascade="all, delete-orphan",
        order_by="Lesson.order_index",
    )


class Lesson(Base):
    """An individual unit of learning. Can be a video, markdown article, PDF, or quiz."""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    # lesson_type: video | markdown | pdf | quiz
    lesson_type = Column(String, nullable=False, default="markdown")
    content_text = Column(Text, nullable=True)
    content_url = Column(String, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    order_index = Column(Integer, nullable=False, default=0)
    is_preview = Column(Boolean, nullable=False, default=False)
    is_published = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    section = relationship("Section", back_populates="lessons")
    progress_records = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")
    quiz = relationship("Quiz", back_populates="lesson", uselist=False, cascade="all, delete-orphan")

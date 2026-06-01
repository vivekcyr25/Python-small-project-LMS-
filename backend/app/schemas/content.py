from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


# ─────────────────────────────────────────────────────────
# Section
# ─────────────────────────────────────────────────────────
class SectionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: Optional[int] = 0
    is_published: bool = False


class SectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    is_published: Optional[bool] = None


class SectionRead(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str] = None
    order_index: int
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────────────────
# Lesson
# ─────────────────────────────────────────────────────────
class LessonCreate(BaseModel):
    title: str
    description: Optional[str] = None
    lesson_type: str = "markdown"  # video | markdown | pdf | quiz
    content_text: Optional[str] = None
    content_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    order_index: Optional[int] = 0
    is_preview: bool = False
    is_published: bool = False


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    lesson_type: Optional[str] = None
    content_text: Optional[str] = None
    content_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    order_index: Optional[int] = None
    is_preview: Optional[bool] = None
    is_published: Optional[bool] = None


class LessonRead(BaseModel):
    id: int
    section_id: int
    title: str
    description: Optional[str] = None
    lesson_type: str
    content_text: Optional[str] = None
    content_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    order_index: int
    is_preview: bool
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

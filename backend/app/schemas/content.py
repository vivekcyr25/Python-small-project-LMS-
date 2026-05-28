from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ModuleBase(BaseModel):
    title: str
    order: Optional[int] = 0

class ModuleCreate(ModuleBase):
    course_id: int

class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    order: Optional[int] = None

class Module(ModuleBase):
    id: int
    course_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LessonBase(BaseModel):
    title: str
    video_url: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = 0

class LessonCreate(LessonBase):
    module_id: int

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    video_url: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None

class Lesson(LessonBase):
    id: int
    module_id: int
    created_at: datetime

    class Config:
        from_attributes = True

SectionCreate = ModuleCreate
SectionUpdate = ModuleUpdate
SectionRead = Module
LessonRead = Lesson

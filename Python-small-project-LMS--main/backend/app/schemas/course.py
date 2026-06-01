from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class CourseBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    level: Optional[str] = None
    price: Optional[Decimal] = Decimal("0.00")
    is_published: Optional[bool] = False

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    level: Optional[str] = None
    price: Optional[Decimal] = None
    is_published: Optional[bool] = None

class CourseResponse(CourseBase):
    id: int
    instructor_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

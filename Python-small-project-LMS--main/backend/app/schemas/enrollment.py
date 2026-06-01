from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EnrollmentBase(BaseModel):
    course_id: int

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentResponse(EnrollmentBase):
    id: int
    student_id: int
    status: str
    enrolled_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: Optional[str] = None
    full_name: str
    role: Optional[str] = "student"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Firebase fields
    firebase_uid: Optional[str] = None
    auth_provider: Optional[str] = None
    phone_number: Optional[str] = None
    photo_url: Optional[str] = None
    email_verified: Optional[bool] = False

    class Config:
        from_attributes = True

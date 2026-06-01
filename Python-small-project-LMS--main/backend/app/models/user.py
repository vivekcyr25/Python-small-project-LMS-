from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.STUDENT.value, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Profile fields
    bio = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)

    # Learning Streak fields
    last_activity_date = Column(DateTime(timezone=True), nullable=True)
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)

    # Firebase Auth fields
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    auth_provider = Column(String, nullable=True)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    photo_url = Column(String, nullable=True)
    email_verified = Column(Boolean, default=False)


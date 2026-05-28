import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router
from app.db.session import engine
from app.db.base import Base
# Import models to ensure they are registered on Base.metadata
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.content import Module, Lesson
from app.models.assessment import LessonProgress, Quiz, Question, AnswerOption, QuizAttempt, QuizAttemptAnswer, Certificate

app = FastAPI(title="LMS API", version="1.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.include_router(api_router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the LMS API"}


from fastapi import APIRouter
from app.api.v1 import (
    auth,
    users,
    courses,
    enrollments,
    sections,
    lessons,
    progress,
    quizzes,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["enrollments"])

# Phase 2 — Course structure, learning engine, quiz engine
api_router.include_router(sections.router, tags=["sections"])
api_router.include_router(lessons.router, tags=["lessons"])
api_router.include_router(progress.router, tags=["progress"])
api_router.include_router(quizzes.router, tags=["quizzes"])

from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

# Progress Schemas
class ProgressBase(BaseModel):
    lesson_id: int
    completed: bool

class ProgressCreate(ProgressBase):
    pass

class Progress(ProgressBase):
    id: int
    user_id: int
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
class LessonProgressUpdate(BaseModel):
    status: Optional[str] = "not_started"  # not_started, in_progress, completed
    progress_percent: Optional[int] = 0
    resume_position_seconds: Optional[int] = 0

class LessonProgressRead(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    status: str
    progress_percent: int
    resume_position_seconds: int
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# AnswerOption Schemas
class AnswerOptionBase(BaseModel):
    option_text: str
    is_correct: Optional[bool] = False
    order_index: Optional[int] = 0

class AnswerOptionCreate(AnswerOptionBase):
    pass

class AnswerOptionRead(AnswerOptionBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    question_text: str
    question_type: str  # mcq_single, mcq_multiple, short_answer
    points: Optional[int] = 1
    order_index: Optional[int] = 0

class QuestionCreate(QuestionBase):
    pass

class QuestionRead(QuestionBase):
    id: int
    quiz_id: int
    options: List[AnswerOptionRead] = []

    class Config:
        from_attributes = True

# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    passing_score: Optional[int] = 60

class QuizCreate(QuizBase):
    pass

class QuizRead(QuizBase):
    id: int
    lesson_id: int
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionRead] = []

    class Config:
        from_attributes = True

# Quiz Attempt Schemas
class QuizAttemptAnswerRequest(BaseModel):
    question_id: int
    selected_option_ids: Optional[List[int]] = None
    answer_text: Optional[str] = None

class QuizSubmitRequest(BaseModel):
    answers: List[QuizAttemptAnswerRequest]

class QuizAttemptAnswerRead(BaseModel):
    id: int
    question_id: int
    selected_option_ids: Optional[List[int]] = None
    answer_text: Optional[str] = None
    is_correct: Optional[bool] = None
    points_awarded: int

    class Config:
        from_attributes = True

class QuizAttemptRead(BaseModel):
    id: int
    quiz_id: int
    user_id: int
    score: int
    max_score: int
    percentage: int
    passed: bool
    submitted_at: datetime
    answers: List[QuizAttemptAnswerRead] = []

    class Config:
        from_attributes = True

# Certificate Schemas
class CertificateBase(BaseModel):
    certificate_url: Optional[str] = None

class CertificateCreate(CertificateBase):
    course_id: int

class Certificate(CertificateBase):
    id: int
    user_id: int
    course_id: int
    issued_at: datetime
    certificate_url: Optional[str]

    class Config:
        from_attributes = True

Quiz = QuizRead
Question = QuestionRead


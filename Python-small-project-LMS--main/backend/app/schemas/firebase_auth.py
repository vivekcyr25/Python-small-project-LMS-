from pydantic import BaseModel
from typing import Optional
from app.schemas.user import UserResponse


class FirebaseLoginRequest(BaseModel):
    id_token: str


class FirebaseLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

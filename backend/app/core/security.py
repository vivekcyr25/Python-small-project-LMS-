from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Any, Union
from app.core.config import settings

# Note: bcrypt is pinned to <4.1 in requirements.txt because bcrypt >=4.1
# enforces a strict 72-byte limit that bypasses passlib's truncate_error setting.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__truncate_error=False,
)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def _truncate_to_bcrypt_limit(password: str) -> str:
    """Truncate a password so that its UTF-8 encoding is <= 72 bytes (bcrypt hard limit).
    Slicing by Python characters is not enough — non-ASCII chars can be multi-byte."""
    encoded = password.encode("utf-8")
    if len(encoded) <= 72:
        return password
    # Decode the first 72 bytes back to str, ignoring any partial multi-byte char.
    return encoded[:72].decode("utf-8", errors="ignore")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_truncate_to_bcrypt_limit(plain_password), hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(_truncate_to_bcrypt_limit(password))


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

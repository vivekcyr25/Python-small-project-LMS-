import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from typing import Any, Union
from app.core.config import settings

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
    try:
        pwd_bytes = _truncate_to_bcrypt_limit(plain_password).encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    pwd_bytes = _truncate_to_bcrypt_limit(password).encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

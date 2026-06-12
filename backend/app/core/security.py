from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    subject: str | Any,
    company_id: Optional[int] = None,
    role: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.now(timezone.utc),
    }
    if company_id is not None:
        to_encode["company_id"] = company_id
    if role is not None:
        to_encode["role"] = role
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

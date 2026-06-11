"""Tests for password hashing and JWT token generation."""
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from datetime import timedelta


def test_password_hash():
    h = get_password_hash("admin123")
    assert h != "admin123"
    assert verify_password("admin123", h)
    assert not verify_password("wrong", h)


def test_create_and_decode_token():
    token = create_access_token(1, expires_delta=timedelta(hours=1))
    assert token
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "1"


def test_expired_token():
    import time
    token = create_access_token("test", expires_delta=timedelta(seconds=1))
    time.sleep(2)
    payload = decode_access_token(token)
    assert payload is None

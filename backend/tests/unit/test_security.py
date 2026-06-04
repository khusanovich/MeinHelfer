import pytest
from jose import JWTError

from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


def test_password_hash_and_verify():
    password = "super-secret-password"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed)


def test_wrong_password_fails():
    hashed = get_password_hash("correct")
    assert not verify_password("wrong", hashed)


def test_access_token_roundtrip():
    token, expire = create_access_token("admin@example.de")
    subject = decode_access_token(token)
    assert subject == "admin@example.de"


def test_tampered_token_raises():
    token, _ = create_access_token("admin@example.de")
    bad_token = token[:-5] + "XXXXX"
    with pytest.raises(JWTError):
        decode_access_token(bad_token)

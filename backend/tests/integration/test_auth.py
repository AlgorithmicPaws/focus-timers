"""
Tests de integración — Auth endpoints.
Cubren el happy path completo y los casos de error más críticos.
"""

import pytest


REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
REFRESH_URL = "/api/v1/auth/refresh"
ME_URL = "/api/v1/users/me"

VALID_USER = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
}


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------


def test_register_returns_token(client):
    response = client.post(REGISTER_URL, json=VALID_USER)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 20


def test_register_duplicate_email_returns_409(client):
    client.post(REGISTER_URL, json=VALID_USER)
    response = client.post(REGISTER_URL, json=VALID_USER)
    assert response.status_code == 409


def test_register_missing_name_returns_422(client):
    payload = {**VALID_USER, "name": ""}
    response = client.post(REGISTER_URL, json=payload)
    assert response.status_code == 422


def test_register_invalid_email_returns_422(client):
    payload = {**VALID_USER, "email": "not-an-email"}
    response = client.post(REGISTER_URL, json=payload)
    assert response.status_code == 422


def test_register_weak_password_no_digit_returns_422(client):
    payload = {**VALID_USER, "password": "passwordonly"}
    response = client.post(REGISTER_URL, json=payload)
    assert response.status_code == 422


def test_register_short_password_returns_422(client):
    payload = {**VALID_USER, "password": "abc1"}
    response = client.post(REGISTER_URL, json=payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


def test_login_happy_path(client):
    client.post(REGISTER_URL, json=VALID_USER)
    response = client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": VALID_USER["password"]})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client):
    client.post(REGISTER_URL, json=VALID_USER)
    response = client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": "wrong999"})
    assert response.status_code == 401


def test_login_nonexistent_user_returns_401(client):
    response = client.post(LOGIN_URL, json={"email": "nobody@example.com", "password": "password123"})
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------------


def test_refresh_returns_new_token(client):
    reg = client.post(REGISTER_URL, json=VALID_USER)
    token = reg.json()["access_token"]
    response = client.post(REFRESH_URL, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_refresh_without_token_returns_401(client):
    response = client.post(REFRESH_URL)
    assert response.status_code == 401


def test_refresh_invalid_token_returns_401(client):
    response = client.post(REFRESH_URL, headers={"Authorization": "Bearer notavalidtoken"})
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /users/me
# ---------------------------------------------------------------------------


def test_get_me_returns_user_data(client):
    reg = client.post(REGISTER_URL, json=VALID_USER)
    token = reg.json()["access_token"]
    response = client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == VALID_USER["email"]
    assert data["name"] == VALID_USER["name"]
    assert "hashed_password" not in data


def test_get_me_without_token_returns_401(client):
    response = client.get(ME_URL)
    assert response.status_code == 401


def test_get_me_invalid_token_returns_401(client):
    response = client.get(ME_URL, headers={"Authorization": "Bearer bad.token.here"})
    assert response.status_code == 401

"""
Tests de integración — Sessions endpoints.
Cubren el ciclo completo: crear, listar, filtrar y eliminar sesiones,
más el aislamiento entre usuarios.
"""

from datetime import datetime, timezone


REGISTER_URL = "/api/v1/auth/register"
SESSIONS_URL = "/api/v1/sessions/"

# Payload mínimo válido para una sesión Pomodoro
POMODORO_SESSION = {
    "technique": "pomodoro",
    "task_name": "Revisar PRs",
    "started_at": "2024-01-15T10:00:00Z",
    "ended_at": "2024-01-15T10:25:00Z",
    "total_work_seconds": 1500,
    "total_break_seconds": 0,
    "completed": True,
    "day_of_week": 0,
    "hour_of_day": 10,
    "pomodoro_details": {
        "focus_interval_sec": 1500,
        "short_break_sec": 300,
        "long_break_sec": 900,
        "pomodoros_target": 4,
        "pomodoros_completed": 1,
        "pomodoro_number": 1,
        "was_voided": False,
        "strict_mode": False,
    },
}


def _register_and_token(client, email="user@example.com"):
    """Helper: registra un usuario y devuelve el header de auth."""
    resp = client.post(REGISTER_URL, json={"name": "User", "email": email, "password": "secret123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Create session
# ---------------------------------------------------------------------------


def test_create_session_happy_path(client):
    headers = _register_and_token(client)
    response = client.post(SESSIONS_URL, json=POMODORO_SESSION, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["technique"] == "pomodoro"
    assert data["total_work_seconds"] == 1500
    assert data["completed"] is True
    assert "id" in data
    assert "user_id" in data


def test_create_session_includes_pomodoro_details(client):
    headers = _register_and_token(client)
    response = client.post(SESSIONS_URL, json=POMODORO_SESSION, headers=headers)
    assert response.status_code == 201
    details = response.json()["pomodoro_details"]
    assert details is not None
    assert details["focus_interval_sec"] == 1500
    assert details["pomodoros_completed"] == 1


def test_create_session_minimal_payload(client):
    """Solo los campos obligatorios, sin pomodoro_details."""
    headers = _register_and_token(client)
    minimal = {
        "technique": "pomodoro",
        "started_at": "2024-01-15T10:00:00Z",
        "total_work_seconds": 900,
    }
    response = client.post(SESSIONS_URL, json=minimal, headers=headers)
    assert response.status_code == 201


def test_create_session_without_auth_returns_401(client):
    response = client.post(SESSIONS_URL, json=POMODORO_SESSION)
    assert response.status_code == 401


def test_create_session_negative_work_seconds_returns_422(client):
    headers = _register_and_token(client)
    bad = {**POMODORO_SESSION, "total_work_seconds": -1}
    response = client.post(SESSIONS_URL, json=bad, headers=headers)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# List sessions
# ---------------------------------------------------------------------------


def test_list_sessions_returns_created_session(client):
    headers = _register_and_token(client)
    client.post(SESSIONS_URL, json=POMODORO_SESSION, headers=headers)
    response = client.get(SESSIONS_URL, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["sessions"]) == 1
    assert data["sessions"][0]["technique"] == "pomodoro"


def test_list_sessions_empty_for_new_user(client):
    headers = _register_and_token(client)
    response = client.get(SESSIONS_URL, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["sessions"] == []


def test_list_sessions_pagination(client):
    headers = _register_and_token(client)
    # Crear 3 sesiones
    for _ in range(3):
        client.post(SESSIONS_URL, json=POMODORO_SESSION, headers=headers)
    response = client.get(SESSIONS_URL + "?limit=2&offset=0", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["sessions"]) == 2
    assert data["limit"] == 2
    assert data["offset"] == 0


def test_list_sessions_filter_by_technique(client):
    headers = _register_and_token(client)
    client.post(SESSIONS_URL, json=POMODORO_SESSION, headers=headers)
    # Filtrar por pomodoro
    response = client.get(SESSIONS_URL + "?technique=pomodoro", headers=headers)
    assert response.status_code == 200
    assert response.json()["total"] >= 1
    # Filtrar por flowtime — no debería haber ninguna
    response = client.get(SESSIONS_URL + "?technique=flowtime", headers=headers)
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_list_sessions_without_auth_returns_401(client):
    response = client.get(SESSIONS_URL)
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Delete session
# ---------------------------------------------------------------------------


def test_delete_session_happy_path(client):
    headers = _register_and_token(client)
    create_resp = client.post(SESSIONS_URL, json=POMODORO_SESSION, headers=headers)
    session_id = create_resp.json()["id"]

    delete_resp = client.delete(f"{SESSIONS_URL}{session_id}", headers=headers)
    assert delete_resp.status_code == 204

    list_resp = client.get(SESSIONS_URL, headers=headers)
    assert list_resp.json()["total"] == 0


def test_delete_nonexistent_session_returns_404(client):
    headers = _register_and_token(client)
    response = client.delete(f"{SESSIONS_URL}99999", headers=headers)
    assert response.status_code == 404


def test_delete_session_without_auth_returns_401(client):
    response = client.delete(f"{SESSIONS_URL}1")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Aislamiento entre usuarios
# ---------------------------------------------------------------------------


def test_users_cannot_see_each_others_sessions(client):
    headers_a = _register_and_token(client, "alice@example.com")
    headers_b = _register_and_token(client, "bob@example.com")

    # Alice crea una sesión
    client.post(SESSIONS_URL, json=POMODORO_SESSION, headers=headers_a)

    # Bob no debe verla
    response = client.get(SESSIONS_URL, headers=headers_b)
    assert response.json()["total"] == 0


def test_user_cannot_delete_another_users_session(client):
    headers_a = _register_and_token(client, "alice@example.com")
    headers_b = _register_and_token(client, "bob@example.com")

    # Alice crea una sesión
    create_resp = client.post(SESSIONS_URL, json=POMODORO_SESSION, headers=headers_a)
    session_id = create_resp.json()["id"]

    # Bob intenta borrarla
    response = client.delete(f"{SESSIONS_URL}{session_id}", headers=headers_b)
    assert response.status_code == 404

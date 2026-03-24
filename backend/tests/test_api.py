"""Tests for the Email Templates API."""
import os
import tempfile

import pytest
from fastapi.testclient import TestClient

# Point the DB to a temp file before importing anything that touches the database
_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_tmp.close()
os.environ["EMAIL_TEMPLATES_DB"] = _tmp.name

from app.database import DB_PATH  # noqa: E402
import app.database as db_mod  # noqa: E402

# Override DB_PATH for tests
db_mod.DB_PATH = _tmp.name

from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def _clean_db():
    """Ensure a fresh database for each test."""
    db_mod.init_db()
    conn = db_mod.get_connection()
    conn.execute("DELETE FROM templates")
    conn.commit()
    conn.close()
    yield
    # Cleanup handled by autouse


client = TestClient(app)


def test_health_endpoint_returns_ok():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_template():
    payload = {
        "name": "Test Template",
        "subject": "Hello World",
        "content": [
            {"id": "b1", "type": "text", "properties": {"content": "Hi there"}}
        ],
        "preview_text": "Preview",
    }
    response = client.post("/api/templates", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Template"
    assert data["subject"] == "Hello World"
    assert len(data["content"]) == 1
    assert data["content"][0]["type"] == "text"
    assert data["id"]
    assert data["created_at"]
    assert data["updated_at"]


def test_list_templates():
    # Create two templates
    client.post("/api/templates", json={"name": "Template A"})
    client.post("/api/templates", json={"name": "Template B"})

    response = client.get("/api/templates")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_template():
    create_resp = client.post("/api/templates", json={"name": "Get Me"})
    template_id = create_resp.json()["id"]

    response = client.get(f"/api/templates/{template_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Get Me"


def test_get_template_not_found():
    response = client.get("/api/templates/nonexistent-id")
    assert response.status_code == 404


def test_update_template():
    create_resp = client.post(
        "/api/templates", json={"name": "Original", "subject": "Old Subject"}
    )
    template_id = create_resp.json()["id"]

    response = client.put(
        f"/api/templates/{template_id}",
        json={"name": "Updated", "subject": "New Subject"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated"
    assert data["subject"] == "New Subject"


def test_update_template_partial():
    create_resp = client.post(
        "/api/templates", json={"name": "Original", "subject": "Keep This"}
    )
    template_id = create_resp.json()["id"]

    response = client.put(
        f"/api/templates/{template_id}",
        json={"name": "Changed"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Changed"
    assert data["subject"] == "Keep This"


def test_delete_template():
    create_resp = client.post("/api/templates", json={"name": "Delete Me"})
    template_id = create_resp.json()["id"]

    response = client.delete(f"/api/templates/{template_id}")
    assert response.status_code == 204

    # Verify it's gone
    get_resp = client.get(f"/api/templates/{template_id}")
    assert get_resp.status_code == 404


def test_delete_template_not_found():
    response = client.delete("/api/templates/nonexistent-id")
    assert response.status_code == 404


def test_duplicate_template():
    create_resp = client.post(
        "/api/templates",
        json={
            "name": "Original",
            "subject": "Test Subject",
            "content": [{"id": "b1", "type": "text", "properties": {"content": "Hi"}}],
        },
    )
    template_id = create_resp.json()["id"]

    response = client.post(f"/api/templates/{template_id}/duplicate")
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Original (Copy)"
    assert data["subject"] == "Test Subject"
    assert data["id"] != template_id
    assert len(data["content"]) == 1


def test_export_html():
    create_resp = client.post(
        "/api/templates",
        json={
            "name": "HTML Export",
            "subject": "Export Test",
            "content": [
                {
                    "id": "b1",
                    "type": "text",
                    "properties": {"content": "Hello from HTML", "fontSize": 16},
                },
                {
                    "id": "b2",
                    "type": "button",
                    "properties": {
                        "text": "Click Me",
                        "url": "https://example.com",
                    },
                },
                {
                    "id": "b3",
                    "type": "divider",
                    "properties": {"color": "#E8E5E0"},
                },
                {
                    "id": "b4",
                    "type": "spacer",
                    "properties": {"height": 32},
                },
                {
                    "id": "b5",
                    "type": "image",
                    "properties": {
                        "src": "https://example.com/image.jpg",
                        "alt": "Test image",
                    },
                },
            ],
        },
    )
    template_id = create_resp.json()["id"]

    response = client.get(f"/api/templates/{template_id}/html")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    html = response.text
    assert "Hello from HTML" in html
    assert "Click Me" in html
    assert "Export Test" in html
    assert "<!DOCTYPE html>" in html


def test_export_html_not_found():
    response = client.get("/api/templates/nonexistent-id/html")
    assert response.status_code == 404

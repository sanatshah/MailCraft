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
    conn.execute("DELETE FROM email_events")
    conn.execute("DELETE FROM email_messages")
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
            "name": "Weekly Newsletter",
            "subject": "Latest updates",
            "preview_text": "A preview",
            "content": [
                {"id": "b1", "type": "text", "properties": {"content": "Hello readers"}},
            ],
        },
    )
    source = create_resp.json()

    duplicate_resp = client.post(f"/api/templates/{source['id']}/duplicate")
    assert duplicate_resp.status_code == 201
    duplicate = duplicate_resp.json()

    assert duplicate["id"] != source["id"]
    assert duplicate["name"] == "Copy of Weekly Newsletter"
    assert duplicate["subject"] == source["subject"]
    assert duplicate["preview_text"] == source["preview_text"]
    assert duplicate["content"] == source["content"]
    assert duplicate["created_at"] != source["created_at"]
    assert duplicate["updated_at"] != source["updated_at"]

    duplicate_two_resp = client.post(f"/api/templates/{source['id']}/duplicate")
    assert duplicate_two_resp.status_code == 201
    assert duplicate_two_resp.json()["name"] == "Copy of Weekly Newsletter (2)"


def test_duplicate_template_not_found():
    response = client.post("/api/templates/nonexistent-id/duplicate")
    assert response.status_code == 404


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


# --- Dashboard / email analytics ---


def test_dashboard_overview_empty():
    response = client.get("/api/dashboard/overview?days=7")
    assert response.status_code == 200
    data = response.json()
    assert "overview" in data
    assert data["overview"]["messages_sent"] == 0
    assert data["overview"]["messages_failed"] == 0
    assert data["overview"]["tracked_opens"] == 0
    assert data["overview"]["period_days"] == 7
    assert data["recent_failures"] == []


def test_dashboard_overview_invalid_days():
    assert client.get("/api/dashboard/overview?days=0").status_code == 400
    assert client.get("/api/dashboard/overview?days=400").status_code == 400


def test_ingest_message_event_creates_message():
    create = client.post("/api/templates", json={"name": "Campaign A"})
    tid = create.json()["id"]
    response = client.post(
        "/api/events/message",
        json={
            "recipient": "user@example.com",
            "subject": "Hello",
            "event_type": "delivered",
            "template_id": tid,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["message_id"]
    assert body["event_id"]

    overview = client.get("/api/dashboard/overview?days=7").json()
    assert overview["overview"]["messages_sent"] == 1
    assert overview["overview"]["delivery_rate"] == 1.0


def test_ingest_failure_updates_message_and_recent_failures():
    response = client.post(
        "/api/events/message",
        json={
            "recipient": "bad@example.com",
            "subject": "Bounce test",
            "event_type": "failed",
            "failure_reason": "Mailbox full",
        },
    )
    assert response.status_code == 201
    mid = response.json()["message_id"]

    overview = client.get("/api/dashboard/overview?days=7").json()
    assert overview["overview"]["messages_failed"] == 1
    ids = [f["message_id"] for f in overview["recent_failures"]]
    assert mid in ids


def test_ingest_invalid_event_type():
    response = client.post(
        "/api/events/message",
        json={
            "recipient": "a@b.com",
            "event_type": "not_a_real_event",
        },
    )
    assert response.status_code == 400


def test_ingest_template_not_found():
    response = client.post(
        "/api/events/message",
        json={
            "recipient": "a@b.com",
            "event_type": "sent",
            "template_id": "00000000-0000-0000-0000-000000000000",
        },
    )
    assert response.status_code == 404


def test_ingest_message_id_not_found():
    response = client.post(
        "/api/events/message",
        json={
            "message_id": "00000000-0000-0000-0000-000000000000",
            "recipient": "a@b.com",
            "event_type": "sent",
        },
    )
    assert response.status_code == 404


def test_track_open_records_event():
    mid = client.post(
        "/api/events/message",
        json={
            "recipient": "open@example.com",
            "subject": "Track me",
            "event_type": "delivered",
        },
    ).json()["message_id"]

    pixel = client.get(f"/api/track/open/{mid}")
    assert pixel.status_code == 200
    assert "image/gif" in pixel.headers["content-type"]
    assert len(pixel.content) > 0

    overview = client.get("/api/dashboard/overview?days=7").json()
    assert overview["overview"]["tracked_opens"] == 1


def test_dashboard_trends_shape():
    client.post(
        "/api/events/message",
        json={
            "recipient": "trend@example.com",
            "event_type": "sent",
        },
    )
    response = client.get("/api/dashboard/trends?days=7")
    assert response.status_code == 200
    data = response.json()
    assert data["period_days"] == 7
    assert len(data["series"]) == 7
    assert all("date" in d and "sent" in d for d in data["series"])


def test_dashboard_top_templates():
    tid = client.post("/api/templates", json={"name": "Top T"}).json()["id"]
    client.post(
        "/api/events/message",
        json={
            "recipient": "x@y.com",
            "event_type": "delivered",
            "template_id": tid,
        },
    )
    response = client.get("/api/dashboard/top-templates?days=7&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["templates"]) >= 1
    assert data["templates"][0]["template_id"] == tid
    assert data["templates"][0]["send_count"] >= 1

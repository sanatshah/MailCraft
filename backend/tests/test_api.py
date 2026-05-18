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
    conn.execute("DELETE FROM content_translations")
    conn.execute("DELETE FROM content_entries")
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


# --- Content API ---


def test_content_create_list_get():
    create = client.post(
        "/api/content",
        json={
            "key": "hero.title",
            "description": "Hero",
            "translations": {"en": "Hello"},
        },
    )
    assert create.status_code == 201
    body = create.json()
    eid = body["id"]
    assert body["translations"]["en"] == "Hello"

    lst = client.get("/api/content")
    assert lst.status_code == 200
    keys = [row["key"] for row in lst.json()]
    assert "hero.title" in keys

    got = client.get(f"/api/content/{eid}")
    assert got.status_code == 200
    assert got.json()["key"] == "hero.title"


def test_content_duplicate_key_returns_409():
    assert client.post("/api/content", json={"key": "dup.key"}).status_code == 201
    dup = client.post("/api/content", json={"key": "dup.key"})
    assert dup.status_code == 409


def test_content_patch_updates_description():
    eid = client.post("/api/content", json={"key": "patch.me"}).json()["id"]
    r = client.patch(f"/api/content/{eid}", json={"description": "New desc"})
    assert r.status_code == 200
    assert r.json()["description"] == "New desc"


def test_content_patch_duplicate_key_returns_409():
    client.post("/api/content", json={"key": "alpha.one"})
    b = client.post("/api/content", json={"key": "beta.two"}).json()["id"]
    clash = client.patch(f"/api/content/{b}", json={"key": "alpha.one"})
    assert clash.status_code == 409


def test_content_put_translation_upserts():
    eid = client.post("/api/content", json={"key": "trans.key"}).json()["id"]
    r = client.put(f"/api/content/{eid}/locales/en", json={"value": "Hi"})
    assert r.status_code == 200
    assert r.json()["translations"]["en"] == "Hi"
    r2 = client.put(f"/api/content/{eid}/locales/en", json={"value": "Bye"})
    assert r2.status_code == 200
    assert r2.json()["translations"]["en"] == "Bye"


def test_content_delete_locale():
    eid = client.post(
        "/api/content",
        json={"key": "locale.del", "translations": {"en": "x"}},
    ).json()["id"]
    assert client.delete(f"/api/content/{eid}/locales/en").status_code == 204
    refreshed = client.get(f"/api/content/{eid}")
    assert "en" not in refreshed.json()["translations"]


def test_content_delete_entry_returns_204():
    eid = client.post("/api/content", json={"key": "gone.key"}).json()["id"]
    assert client.delete(f"/api/content/{eid}").status_code == 204
    assert client.get(f"/api/content/{eid}").status_code == 404


def test_content_get_returns_404_when_missing():
    assert client.get("/api/content/nonexistent-entry-id").status_code == 404


def test_content_delete_translation_returns_404_when_locale_missing():
    eid = client.post(
        "/api/content",
        json={"key": "only.en", "translations": {"en": "a"}},
    ).json()["id"]
    assert client.delete(f"/api/content/{eid}/locales/fr").status_code == 404


def test_content_delete_translation_returns_404_when_entry_missing():
    assert (
        client.delete("/api/content/nonexistent-entry-id/locales/en").status_code == 404
    )


def test_content_invalid_locale_path_returns_422():
    eid = client.post("/api/content", json={"key": "loc.val"}).json()["id"]
    bad = client.put(f"/api/content/{eid}/locales/en_US", json={"value": "x"})
    assert bad.status_code == 422

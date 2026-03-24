from __future__ import annotations

import json
import sqlite3
import os
from pathlib import Path
from typing import Any

_default_db = Path(__file__).resolve().parent.parent / "email_templates.db"
DB_PATH = Path(os.environ.get("EMAIL_TEMPLATES_DB", str(_default_db)))

_CREATE_TEMPLATES = """
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '[]',
    preview_text TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
"""

_CREATE_EMAIL_MESSAGES = """
CREATE TABLE IF NOT EXISTS email_messages (
    id TEXT PRIMARY KEY,
    template_id TEXT,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    provider_message_id TEXT,
    failure_reason TEXT,
    created_at TEXT NOT NULL,
    sent_at TEXT,
    failed_at TEXT,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
);
"""

_CREATE_EMAIL_EVENTS = """
CREATE TABLE IF NOT EXISTS email_events (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (message_id) REFERENCES email_messages(id) ON DELETE CASCADE
);
"""

_CREATE_EMAIL_EVENTS_INDEX = """
CREATE INDEX IF NOT EXISTS idx_email_events_message_id ON email_events(message_id);
"""

_CREATE_EMAIL_EVENTS_OCCURRED_INDEX = """
CREATE INDEX IF NOT EXISTS idx_email_events_occurred_at ON email_events(occurred_at);
"""

_CREATE_EMAIL_MESSAGES_TEMPLATE_INDEX = """
CREATE INDEX IF NOT EXISTS idx_email_messages_template_id ON email_messages(template_id);
"""

_CREATE_EMAIL_MESSAGES_CREATED_INDEX = """
CREATE INDEX IF NOT EXISTS idx_email_messages_created_at ON email_messages(created_at);
"""


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    conn = get_connection()
    try:
        conn.execute(_CREATE_TEMPLATES)
        conn.execute(_CREATE_EMAIL_MESSAGES)
        conn.execute(_CREATE_EMAIL_EVENTS)
        conn.execute(_CREATE_EMAIL_EVENTS_INDEX)
        conn.execute(_CREATE_EMAIL_EVENTS_OCCURRED_INDEX)
        conn.execute(_CREATE_EMAIL_MESSAGES_TEMPLATE_INDEX)
        conn.execute(_CREATE_EMAIL_MESSAGES_CREATED_INDEX)
        conn.commit()
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    d = dict(row)
    # Parse content from JSON string back to list
    if "content" in d and isinstance(d["content"], str):
        d["content"] = json.loads(d["content"])
    return d

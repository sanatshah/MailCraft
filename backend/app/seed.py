"""Seed the database with example templates if empty."""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from app.database import get_connection


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


SEED_TEMPLATES = [
    {
        "name": "Welcome Series",
        "subject": "Welcome to our family! 🎉",
        "preview_text": "We're so glad you're here",
        "content": [
            {
                "id": str(uuid.uuid4()),
                "type": "image",
                "properties": {
                    "src": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=200&fit=crop",
                    "alt": "Welcome banner",
                    "width": "100%",
                    "alignment": "center",
                    "padding": 0,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "properties": {
                    "content": "<h1 style='margin:0;'>Welcome aboard! 👋</h1>",
                    "fontSize": 24,
                    "color": "#232426",
                    "alignment": "center",
                    "padding": 24,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "properties": {
                    "content": "We're thrilled to have you join us. Here's what you can expect from our community – exclusive updates, special offers, and helpful tips delivered straight to your inbox.",
                    "fontSize": 16,
                    "color": "#555555",
                    "alignment": "center",
                    "padding": 16,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "button",
                "properties": {
                    "text": "Get Started",
                    "url": "https://example.com/start",
                    "backgroundColor": "#EF6351",
                    "textColor": "#FFFFFF",
                    "borderRadius": 6,
                    "alignment": "center",
                    "padding": 24,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "divider",
                "properties": {
                    "color": "#E8E5E0",
                    "thickness": 1,
                    "width": 80,
                    "padding": 16,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "properties": {
                    "content": "Questions? Just reply to this email — we're here to help!",
                    "fontSize": 14,
                    "color": "#999999",
                    "alignment": "center",
                    "padding": 16,
                },
            },
        ],
    },
    {
        "name": "Summer Sale",
        "subject": "☀️ Summer Sale — Up to 50% Off!",
        "preview_text": "Don't miss our biggest sale of the year",
        "content": [
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "properties": {
                    "content": "<h1 style='margin:0;color:#EF6351;'>SUMMER SALE</h1>",
                    "fontSize": 32,
                    "color": "#EF6351",
                    "alignment": "center",
                    "padding": 32,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "properties": {
                    "content": "<h2 style='margin:0;'>Up to 50% Off Everything</h2>",
                    "fontSize": 20,
                    "color": "#232426",
                    "alignment": "center",
                    "padding": 8,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "spacer",
                "properties": {"height": 16},
            },
            {
                "id": str(uuid.uuid4()),
                "type": "image",
                "properties": {
                    "src": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=300&fit=crop",
                    "alt": "Summer sale products",
                    "width": "100%",
                    "alignment": "center",
                    "padding": 16,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "button",
                "properties": {
                    "text": "Shop Now →",
                    "url": "https://example.com/sale",
                    "backgroundColor": "#EF6351",
                    "textColor": "#FFFFFF",
                    "borderRadius": 6,
                    "alignment": "center",
                    "padding": 24,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "properties": {
                    "content": "Sale ends July 31st. Free shipping on orders over $50.",
                    "fontSize": 14,
                    "color": "#999999",
                    "alignment": "center",
                    "padding": 16,
                },
            },
        ],
    },
    {
        "name": "Cart Reminder",
        "subject": "You left something behind 🛒",
        "preview_text": "Your cart is waiting for you",
        "content": [
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "properties": {
                    "content": "<h1 style='margin:0;'>Forgot something?</h1>",
                    "fontSize": 24,
                    "color": "#232426",
                    "alignment": "center",
                    "padding": 32,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "properties": {
                    "content": "Looks like you left some great items in your cart. Don't worry — we saved them for you!",
                    "fontSize": 16,
                    "color": "#555555",
                    "alignment": "center",
                    "padding": 16,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "divider",
                "properties": {
                    "color": "#E8E5E0",
                    "thickness": 1,
                    "width": 100,
                    "padding": 16,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "button",
                "properties": {
                    "text": "Complete Your Order",
                    "url": "https://example.com/cart",
                    "backgroundColor": "#232426",
                    "textColor": "#FFFFFF",
                    "borderRadius": 6,
                    "alignment": "center",
                    "padding": 24,
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "spacer",
                "properties": {"height": 24},
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "properties": {
                    "content": "Need help? Reply to this email and our team will assist you.",
                    "fontSize": 14,
                    "color": "#999999",
                    "alignment": "center",
                    "padding": 16,
                },
            },
        ],
    },
]


def seed_if_empty() -> None:
    conn = get_connection()
    try:
        count = conn.execute("SELECT COUNT(*) FROM templates").fetchone()[0]
        if count > 0:
            return

        now = _now()
        for tmpl in SEED_TEMPLATES:
            conn.execute(
                """INSERT INTO templates (id, name, subject, content, preview_text, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    str(uuid.uuid4()),
                    tmpl["name"],
                    tmpl["subject"],
                    json.dumps(tmpl["content"]),
                    tmpl["preview_text"],
                    now,
                    now,
                ),
            )
        conn.commit()
    finally:
        conn.close()

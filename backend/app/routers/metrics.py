from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.database import get_connection
from app.models import (
    DashboardOverview,
    DashboardOverviewExtended,
    DashboardTopTemplates,
    DashboardTrends,
    MessageEventIngest,
    MessageEventIngestResponse,
    RecentFailureRow,
    TopTemplateRow,
    TrendDay,
)

# 1x1 transparent GIF
_PIXEL_GIF = bytes(
    [
        0x47,
        0x49,
        0x46,
        0x38,
        0x39,
        0x61,
        0x01,
        0x00,
        0x01,
        0x00,
        0x80,
        0x00,
        0x00,
        0xFF,
        0xFF,
        0xFF,
        0x00,
        0x00,
        0x00,
        0x21,
        0xF9,
        0x04,
        0x01,
        0x00,
        0x00,
        0x00,
        0x00,
        0x2C,
        0x00,
        0x00,
        0x00,
        0x00,
        0x01,
        0x00,
        0x01,
        0x00,
        0x00,
        0x02,
        0x02,
        0x44,
        0x01,
        0x00,
        0x3B,
    ]
)

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _cutoff_iso(days: int) -> str:
    if days < 1:
        days = 1
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


def _validate_template(conn: Any, template_id: str | None) -> None:
    if template_id is None:
        return
    row = conn.execute("SELECT id FROM templates WHERE id = ?", (template_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Template not found")


def _apply_event_to_message(
    conn: Any,
    message_id: str,
    event_type: str,
    occurred_at: str,
    failure_reason: str | None,
    provider_message_id: str | None,
) -> None:
    row = conn.execute(
        "SELECT status, sent_at FROM email_messages WHERE id = ?",
        (message_id,),
    ).fetchone()
    if row is None:
        return
    status = row["status"]
    sent_at = row["sent_at"]

    updates: dict[str, Any] = {}

    if event_type == "failed":
        updates["status"] = "failed"
        updates["failed_at"] = occurred_at
        if failure_reason:
            updates["failure_reason"] = failure_reason
    elif event_type == "delivered":
        if status != "failed":
            updates["status"] = "delivered"
        if not sent_at:
            updates["sent_at"] = occurred_at
    elif event_type in ("sent", "accepted"):
        if status not in ("failed", "delivered"):
            updates["status"] = "sent"
        if not sent_at:
            updates["sent_at"] = occurred_at

    if provider_message_id:
        updates["provider_message_id"] = provider_message_id

    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [message_id]
        conn.execute(
            f"UPDATE email_messages SET {set_clause} WHERE id = ?",  # noqa: S608
            values,
        )


dashboard_router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
events_router = APIRouter(prefix="/api/events", tags=["events"])
track_router = APIRouter(prefix="/api/track", tags=["track"])


@events_router.post("/message", response_model=MessageEventIngestResponse, status_code=201)
async def ingest_message_event(body: MessageEventIngest) -> MessageEventIngestResponse:
    event_type = body.event_type.strip().lower()
    allowed = frozenset(
        {"accepted", "sent", "delivered", "failed", "opened", "clicked"}
    )
    if event_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid event_type. Allowed: {sorted(allowed)}",
        )

    occurred_at = body.occurred_at or _now_iso()
    event_id = str(uuid.uuid4())

    conn = get_connection()
    try:
        _validate_template(conn, body.template_id)

        if body.message_id:
            row = conn.execute(
                "SELECT id FROM email_messages WHERE id = ?", (body.message_id,)
            ).fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Message not found")
            message_id = body.message_id
        else:
            message_id = str(uuid.uuid4())
            now = _now_iso()
            conn.execute(
                """INSERT INTO email_messages (
                    id, template_id, recipient, subject, status,
                    provider_message_id, failure_reason, created_at, sent_at, failed_at
                ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, NULL, NULL)""",
                (
                    message_id,
                    body.template_id,
                    body.recipient,
                    body.subject,
                    body.provider_message_id,
                    body.failure_reason,
                    now,
                ),
            )

        conn.execute(
            """INSERT INTO email_events (id, message_id, event_type, occurred_at, metadata)
               VALUES (?, ?, ?, ?, ?)""",
            (
                event_id,
                message_id,
                event_type,
                occurred_at,
                json.dumps(body.metadata),
            ),
        )

        if event_type != "opened" and event_type != "clicked":
            _apply_event_to_message(
                conn,
                message_id,
                event_type,
                occurred_at,
                body.failure_reason,
                body.provider_message_id,
            )

        conn.commit()
        return MessageEventIngestResponse(message_id=message_id, event_id=event_id)
    finally:
        conn.close()


@track_router.get("/open/{message_id}")
async def track_open(message_id: str) -> Response:
    occurred_at = _now_iso()
    event_id = str(uuid.uuid4())
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id FROM email_messages WHERE id = ?", (message_id,)
        ).fetchone()
        if row is not None:
            conn.execute(
                """INSERT INTO email_events (id, message_id, event_type, occurred_at, metadata)
                   VALUES (?, ?, 'opened', ?, '{}')""",
                (event_id, message_id, occurred_at),
            )
            conn.commit()
    finally:
        conn.close()

    return Response(
        content=_PIXEL_GIF,
        media_type="image/gif",
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
        },
    )


def _overview_metrics(conn: Any, cutoff: str) -> tuple[int, int, int, int, float | None, float | None]:
    # Distinct messages with a send-like event in window
    sent_rows = conn.execute(
        """
        SELECT COUNT(DISTINCT e.message_id) FROM email_events e
        WHERE e.event_type IN ('accepted', 'sent', 'delivered')
          AND e.occurred_at >= ?
        """,
        (cutoff,),
    ).fetchone()
    messages_sent = int(sent_rows[0] or 0)

    failed_rows = conn.execute(
        """
        SELECT COUNT(DISTINCT e.message_id) FROM email_events e
        WHERE e.event_type = 'failed' AND e.occurred_at >= ?
        """,
        (cutoff,),
    ).fetchone()
    messages_failed = int(failed_rows[0] or 0)

    open_rows = conn.execute(
        """
        SELECT COUNT(*) FROM email_events e
        WHERE e.event_type = 'opened' AND e.occurred_at >= ?
        """,
        (cutoff,),
    ).fetchone()
    tracked_opens = int(open_rows[0] or 0)

    tmpl = conn.execute("SELECT COUNT(*) FROM templates").fetchone()
    templates_count = int(tmpl[0] or 0)

    delivered_n = conn.execute(
        """
        SELECT COUNT(DISTINCT message_id) FROM email_events
        WHERE event_type = 'delivered' AND occurred_at >= ?
        """,
        (cutoff,),
    ).fetchone()[0]
    delivered_n = int(delivered_n or 0)

    delivery_rate: float | None = None
    if messages_sent > 0:
        delivery_rate = round(delivered_n / messages_sent, 4)

    open_rate: float | None = None
    if delivered_n > 0:
        open_rate = round(tracked_opens / delivered_n, 4)
    elif messages_sent > 0:
        open_rate = round(tracked_opens / messages_sent, 4)

    return (
        messages_sent,
        messages_failed,
        tracked_opens,
        templates_count,
        delivery_rate,
        open_rate,
    )


@dashboard_router.get("/overview", response_model=DashboardOverviewExtended)
async def dashboard_overview(days: int = 7) -> DashboardOverviewExtended:
    if days < 1 or days > 366:
        raise HTTPException(status_code=400, detail="days must be between 1 and 366")
    cutoff = _cutoff_iso(days)
    conn = get_connection()
    try:
        (
            messages_sent,
            messages_failed,
            tracked_opens,
            templates_count,
            delivery_rate,
            open_rate,
        ) = _overview_metrics(conn, cutoff)

        fail_rows = conn.execute(
            """
            SELECT id, recipient, subject, failure_reason, failed_at
            FROM email_messages
            WHERE status = 'failed' AND failed_at IS NOT NULL
            ORDER BY failed_at DESC
            LIMIT 10
            """,
        ).fetchall()

        recent_failures = [
            RecentFailureRow(
                message_id=r["id"],
                recipient=r["recipient"],
                subject=r["subject"] or "",
                failure_reason=r["failure_reason"],
                failed_at=r["failed_at"],
            )
            for r in fail_rows
        ]

        overview = DashboardOverview(
            period_days=days,
            messages_sent=messages_sent,
            messages_failed=messages_failed,
            tracked_opens=tracked_opens,
            templates_count=templates_count,
            delivery_rate=delivery_rate,
            open_rate=open_rate,
        )
        return DashboardOverviewExtended(
            overview=overview,
            recent_failures=recent_failures,
        )
    finally:
        conn.close()


@dashboard_router.get("/trends", response_model=DashboardTrends)
async def dashboard_trends(days: int = 7) -> DashboardTrends:
    if days < 1 or days > 90:
        raise HTTPException(status_code=400, detail="days must be between 1 and 90")
    end = datetime.now(timezone.utc).date()
    start = end - timedelta(days=days - 1)
    conn = get_connection()
    try:
        series: list[TrendDay] = []
        d = start
        while d <= end:
            day_str = d.isoformat()

            sent = conn.execute(
                """
                SELECT COUNT(DISTINCT message_id) FROM email_events
                WHERE event_type IN ('accepted', 'sent', 'delivered')
                  AND date(occurred_at) = date(?)
                """,
                (day_str,),
            ).fetchone()[0]
            failed = conn.execute(
                """
                SELECT COUNT(DISTINCT message_id) FROM email_events
                WHERE event_type = 'failed'
                  AND date(occurred_at) = date(?)
                """,
                (day_str,),
            ).fetchone()[0]
            opens = conn.execute(
                """
                SELECT COUNT(*) FROM email_events
                WHERE event_type = 'opened'
                  AND date(occurred_at) = date(?)
                """,
                (day_str,),
            ).fetchone()[0]

            series.append(
                TrendDay(
                    date=day_str,
                    sent=int(sent or 0),
                    failed=int(failed or 0),
                    opens=int(opens or 0),
                )
            )
            d += timedelta(days=1)

        return DashboardTrends(period_days=days, series=series)
    finally:
        conn.close()


@dashboard_router.get("/top-templates", response_model=DashboardTopTemplates)
async def dashboard_top_templates(days: int = 7, limit: int = 5) -> DashboardTopTemplates:
    if days < 1 or days > 366:
        raise HTTPException(status_code=400, detail="days must be between 1 and 366")
    if limit < 1 or limit > 50:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 50")
    cutoff = _cutoff_iso(days)
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT m.template_id,
                   COUNT(DISTINCT CASE WHEN e.event_type IN ('accepted','sent','delivered')
                        THEN e.message_id END) AS send_count
            FROM email_events e
            JOIN email_messages m ON m.id = e.message_id
            WHERE m.template_id IS NOT NULL
              AND e.occurred_at >= ?
            GROUP BY m.template_id
            ORDER BY send_count DESC
            LIMIT ?
            """,
            (cutoff, limit),
        ).fetchall()

        templates: list[TopTemplateRow] = []
        for r in rows:
            tid = r["template_id"]
            name_row = conn.execute(
                "SELECT name FROM templates WHERE id = ?", (tid,)
            ).fetchone()
            name = name_row["name"] if name_row else "(deleted template)"
            open_row = conn.execute(
                """
                SELECT COUNT(*) FROM email_events e
                JOIN email_messages m ON m.id = e.message_id
                WHERE m.template_id = ?
                  AND e.event_type = 'opened'
                  AND e.occurred_at >= ?
                """,
                (tid, cutoff),
            ).fetchone()
            open_count = int(open_row[0] or 0)
            templates.append(
                TopTemplateRow(
                    template_id=tid,
                    template_name=name,
                    send_count=int(r["send_count"] or 0),
                    open_count=open_count,
                )
            )

        return DashboardTopTemplates(period_days=days, templates=templates)
    finally:
        conn.close()

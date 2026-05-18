from __future__ import annotations

import re
import sqlite3
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.database import get_connection
from app.models import (
    ContentEntryCreate,
    ContentEntryResponse,
    ContentEntryUpdate,
    TranslationUpsert,
)

router = APIRouter(prefix="/api/content", tags=["content"])

_LOCALE_RX = re.compile(r"^[a-zA-Z0-9-]+$")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _effective_updated_at(entry_updated: str, trans_times: list[str]) -> str:
    if not trans_times:
        return entry_updated
    return max([entry_updated] + trans_times)


def _validate_locale(locale: str) -> None:
    if not _LOCALE_RX.fullmatch(locale):
        raise HTTPException(status_code=422, detail="Invalid locale")


def _entry_to_response(conn: sqlite3.Connection, entry_row: sqlite3.Row) -> ContentEntryResponse:
    entry_id = entry_row["id"]
    trans_rows = conn.execute(
        "SELECT locale, value, updated_at FROM content_translations WHERE entry_id = ?",
        (entry_id,),
    ).fetchall()
    translations = {r["locale"]: r["value"] for r in trans_rows}
    times = [r["updated_at"] for r in trans_rows]
    eff = _effective_updated_at(entry_row["updated_at"], times)
    return ContentEntryResponse(
        id=entry_row["id"],
        key=entry_row["key"],
        description=entry_row["description"],
        translations=translations,
        created_at=entry_row["created_at"],
        updated_at=eff,
    )


def _sort_entries_newest_first(entries: list[ContentEntryResponse]) -> list[ContentEntryResponse]:
    return sorted(entries, key=lambda e: e.updated_at, reverse=True)


@router.get("", response_model=list[ContentEntryResponse])
async def list_content_entries() -> list[ContentEntryResponse]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM content_entries ORDER BY updated_at DESC",
        ).fetchall()
        out = [_entry_to_response(conn, r) for r in rows]
        return _sort_entries_newest_first(out)
    finally:
        conn.close()


@router.post("", response_model=ContentEntryResponse, status_code=201)
async def create_content_entry(body: ContentEntryCreate) -> ContentEntryResponse:
    entry_id = str(uuid.uuid4())
    now = _now()
    conn = get_connection()
    try:
        try:
            conn.execute(
                """INSERT INTO content_entries (id, key, description, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (entry_id, body.key, body.description or "", now, now),
            )
        except sqlite3.IntegrityError as exc:
            raise HTTPException(
                status_code=409,
                detail="Content key already exists",
            ) from exc

        for loc, val in body.translations.items():
            conn.execute(
                """INSERT INTO content_translations (id, entry_id, locale, value, updated_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (str(uuid.uuid4()), entry_id, loc, val, now),
            )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM content_entries WHERE id = ?", (entry_id,)
        ).fetchone()
        assert row is not None
        return _entry_to_response(conn, row)
    finally:
        conn.close()


@router.get("/{entry_id}", response_model=ContentEntryResponse)
async def get_content_entry(entry_id: str) -> ContentEntryResponse:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM content_entries WHERE id = ?", (entry_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Content entry not found")
        return _entry_to_response(conn, row)
    finally:
        conn.close()


@router.patch("/{entry_id}", response_model=ContentEntryResponse)
async def patch_content_entry(entry_id: str, body: ContentEntryUpdate) -> ContentEntryResponse:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT * FROM content_entries WHERE id = ?", (entry_id,)
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="Content entry not found")

        updates: dict[str, str] = {}
        if body.key is not None:
            clash = conn.execute(
                "SELECT id FROM content_entries WHERE key = ? AND id != ?",
                (body.key, entry_id),
            ).fetchone()
            if clash is not None:
                raise HTTPException(status_code=409, detail="Content key already exists")
            updates["key"] = body.key
        if body.description is not None:
            updates["description"] = body.description

        if updates:
            updates["updated_at"] = _now()
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            values = list(updates.values()) + [entry_id]
            try:
                conn.execute(
                    f"UPDATE content_entries SET {set_clause} WHERE id = ?",  # noqa: S608
                    values,
                )
            except sqlite3.IntegrityError as exc:
                raise HTTPException(
                    status_code=409,
                    detail="Content key already exists",
                ) from exc
            conn.commit()

        row = conn.execute(
            "SELECT * FROM content_entries WHERE id = ?", (entry_id,)
        ).fetchone()
        assert row is not None
        return _entry_to_response(conn, row)
    finally:
        conn.close()


@router.put("/{entry_id}/locales/{locale}", response_model=ContentEntryResponse)
async def upsert_translation(
    entry_id: str,
    locale: str,
    body: TranslationUpsert,
) -> ContentEntryResponse:
    _validate_locale(locale)
    conn = get_connection()
    try:
        entry = conn.execute(
            "SELECT id FROM content_entries WHERE id = ?", (entry_id,)
        ).fetchone()
        if entry is None:
            raise HTTPException(status_code=404, detail="Content entry not found")

        now = _now()
        existing = conn.execute(
            "SELECT id FROM content_translations WHERE entry_id = ? AND locale = ?",
            (entry_id, locale),
        ).fetchone()
        if existing:
            conn.execute(
                """UPDATE content_translations SET value = ?, updated_at = ?
                   WHERE id = ?""",
                (body.value, now, existing["id"]),
            )
        else:
            conn.execute(
                """INSERT INTO content_translations (id, entry_id, locale, value, updated_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (str(uuid.uuid4()), entry_id, locale, body.value, now),
            )
        conn.commit()

        row = conn.execute(
            "SELECT * FROM content_entries WHERE id = ?", (entry_id,)
        ).fetchone()
        assert row is not None
        return _entry_to_response(conn, row)
    finally:
        conn.close()


@router.delete("/{entry_id}/locales/{locale}", status_code=204)
async def delete_translation(entry_id: str, locale: str) -> None:
    _validate_locale(locale)
    conn = get_connection()
    try:
        entry = conn.execute(
            "SELECT id FROM content_entries WHERE id = ?", (entry_id,)
        ).fetchone()
        if entry is None:
            raise HTTPException(status_code=404, detail="Content entry not found")

        cur = conn.execute(
            "DELETE FROM content_translations WHERE entry_id = ? AND locale = ?",
            (entry_id, locale),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Translation not found")
        conn.commit()
    finally:
        conn.close()


@router.delete("/{entry_id}", status_code=204)
async def delete_content_entry(entry_id: str) -> None:
    conn = get_connection()
    try:
        cur = conn.execute("DELETE FROM content_entries WHERE id = ?", (entry_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Content entry not found")
        conn.commit()
    finally:
        conn.close()

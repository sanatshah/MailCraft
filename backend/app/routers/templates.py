from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

from app.database import get_connection, row_to_dict
from app.models import TemplateCreate, TemplateResponse, TemplateUpdate

router = APIRouter(prefix="/api/templates", tags=["templates"])


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_duplicate_name(original_name: str, existing_names: set[str]) -> str:
    base_name = f"Copy of {original_name}"
    if base_name not in existing_names:
        return base_name

    copy_index = 2
    while f"{base_name} ({copy_index})" in existing_names:
        copy_index += 1
    return f"{base_name} ({copy_index})"


def _generate_duplicate_name(conn, original_name: str) -> str:
    base_name = f"Copy of {original_name}"
    rows = conn.execute(
        "SELECT name FROM templates WHERE name = ? OR name LIKE ?",
        (base_name, f"{base_name} (%)"),
    ).fetchall()
    existing_names = {row["name"] for row in rows}
    return _build_duplicate_name(original_name, existing_names)


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

@router.get("", response_model=list[TemplateResponse])
async def list_templates() -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM templates ORDER BY updated_at DESC"
        ).fetchall()
        return [row_to_dict(r) for r in rows]
    finally:
        conn.close()


@router.post("", response_model=TemplateResponse, status_code=201)
async def create_template(body: TemplateCreate) -> dict:
    template_id = str(uuid.uuid4())
    now = _now()
    conn = get_connection()
    try:
        conn.execute(
            """INSERT INTO templates (id, name, subject, content, preview_text, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                template_id,
                body.name,
                body.subject,
                json.dumps(body.content),
                body.preview_text,
                now,
                now,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM templates WHERE id = ?", (template_id,)
        ).fetchone()
        return row_to_dict(row)
    finally:
        conn.close()


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str) -> dict:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM templates WHERE id = ?", (template_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Template not found")
        return row_to_dict(row)
    finally:
        conn.close()


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(template_id: str, body: TemplateUpdate) -> dict:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT * FROM templates WHERE id = ?", (template_id,)
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="Template not found")

        updates: dict = {}
        if body.name is not None:
            updates["name"] = body.name
        if body.subject is not None:
            updates["subject"] = body.subject
        if body.content is not None:
            updates["content"] = json.dumps(body.content)
        if body.preview_text is not None:
            updates["preview_text"] = body.preview_text

        if updates:
            updates["updated_at"] = _now()
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            values = list(updates.values()) + [template_id]
            conn.execute(
                f"UPDATE templates SET {set_clause} WHERE id = ?",  # noqa: S608
                values,
            )
            conn.commit()

        row = conn.execute(
            "SELECT * FROM templates WHERE id = ?", (template_id,)
        ).fetchone()
        return row_to_dict(row)
    finally:
        conn.close()


@router.delete("/{template_id}", status_code=204)
async def delete_template(template_id: str) -> None:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM templates WHERE id = ?", (template_id,)
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="Template not found")
        conn.execute("DELETE FROM templates WHERE id = ?", (template_id,))
        conn.commit()
    finally:
        conn.close()


@router.post("/{template_id}/duplicate", response_model=TemplateResponse, status_code=201)
async def duplicate_template(template_id: str) -> dict:
    conn = get_connection()
    try:
        source_row = conn.execute(
            "SELECT * FROM templates WHERE id = ?", (template_id,)
        ).fetchone()
        if source_row is None:
            raise HTTPException(status_code=404, detail="Template not found")

        duplicated_id = str(uuid.uuid4())
        now = _now()
        duplicated_name = _generate_duplicate_name(conn, source_row["name"])

        conn.execute(
            """INSERT INTO templates (id, name, subject, content, preview_text, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                duplicated_id,
                duplicated_name,
                source_row["subject"],
                source_row["content"],
                source_row["preview_text"],
                now,
                now,
            ),
        )
        conn.commit()

        duplicated_row = conn.execute(
            "SELECT * FROM templates WHERE id = ?", (duplicated_id,)
        ).fetchone()
        return row_to_dict(duplicated_row)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# HTML Export
# ---------------------------------------------------------------------------

def _block_to_html(block: dict) -> str:
    """Convert a single block dict to an HTML table row for email."""
    block_type = block.get("type", "")
    props = block.get("properties", {})

    if block_type == "text":
        text = props.get("content", "")
        color = props.get("color", "#232426")
        font_size = props.get("fontSize", 16)
        align = props.get("alignment", "left")
        padding = props.get("padding", 16)
        return f"""<tr>
  <td style="padding:{padding}px;color:{color};font-size:{font_size}px;text-align:{align};font-family:Arial,Helvetica,sans-serif;line-height:1.5;">
    {text}
  </td>
</tr>"""

    if block_type == "image":
        src = props.get("src", "")
        alt = props.get("alt", "")
        width = props.get("width", "100%")
        align = props.get("alignment", "center")
        padding = props.get("padding", 16)
        link = props.get("linkUrl", "")
        img_tag = f'<img src="{src}" alt="{alt}" width="{width}" style="display:block;max-width:100%;height:auto;" />'
        if link:
            img_tag = f'<a href="{link}" target="_blank">{img_tag}</a>'
        return f"""<tr>
  <td style="padding:{padding}px;text-align:{align};">
    {img_tag}
  </td>
</tr>"""

    if block_type == "button":
        text = props.get("text", "Click Here")
        url = props.get("url", "#")
        bg = props.get("backgroundColor", "#EF6351")
        text_color = props.get("textColor", "#FFFFFF")
        radius = props.get("borderRadius", 4)
        align = props.get("alignment", "center")
        padding = props.get("padding", 16)
        return f"""<tr>
  <td style="padding:{padding}px;text-align:{align};">
    <a href="{url}" target="_blank" style="display:inline-block;background-color:{bg};color:{text_color};text-decoration:none;padding:12px 32px;border-radius:{radius}px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:600;">
      {text}
    </a>
  </td>
</tr>"""

    if block_type == "divider":
        color = props.get("color", "#E8E5E0")
        thickness = props.get("thickness", 1)
        width_pct = props.get("width", 100)
        padding = props.get("padding", 16)
        return f"""<tr>
  <td style="padding:{padding}px;">
    <hr style="border:none;border-top:{thickness}px solid {color};width:{width_pct}%;margin:0 auto;" />
  </td>
</tr>"""

    if block_type == "spacer":
        height = props.get("height", 32)
        return f"""<tr>
  <td style="height:{height}px;line-height:{height}px;font-size:1px;">&nbsp;</td>
</tr>"""

    if block_type == "columns":
        columns = props.get("columns", [])
        gap = props.get("gap", 16)
        padding = props.get("padding", 16)
        col_count = len(columns) if columns else 2
        col_width = f"{100 // col_count}%"
        cols_html = ""
        for col in columns:
            col_content = col.get("content", "")
            cols_html += f'<td style="width:{col_width};padding:0 {gap // 2}px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;">{col_content}</td>'
        return f"""<tr>
  <td style="padding:{padding}px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{cols_html}</tr></table>
  </td>
</tr>"""

    return ""


@router.get("/{template_id}/html", response_class=HTMLResponse)
async def export_html(template_id: str) -> str:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM templates WHERE id = ?", (template_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Template not found")

        template = row_to_dict(row)
        blocks = template.get("content", [])
        blocks_html = "\n".join(_block_to_html(b) for b in blocks)

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{template['subject'] or template['name']}</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F5F5;">
<tr>
<td align="center" style="padding:24px 0;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">
{blocks_html}
</table>
</td>
</tr>
</table>
</body>
</html>"""
    finally:
        conn.close()

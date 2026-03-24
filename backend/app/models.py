from __future__ import annotations

from pydantic import BaseModel


class TemplateCreate(BaseModel):
    name: str
    subject: str = ""
    content: list[dict] = []
    preview_text: str = ""


class TemplateUpdate(BaseModel):
    name: str | None = None
    subject: str | None = None
    content: list[dict] | None = None
    preview_text: str | None = None


class TemplateResponse(BaseModel):
    id: str
    name: str
    subject: str
    content: list[dict]
    preview_text: str
    created_at: str
    updated_at: str

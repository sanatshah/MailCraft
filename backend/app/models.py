from __future__ import annotations

import re
from typing import Any

from pydantic import BaseModel, Field, field_validator


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


# --- Email analytics / dashboard ---


class MessageEventIngest(BaseModel):
    message_id: str | None = None
    template_id: str | None = None
    recipient: str
    subject: str = ""
    event_type: str
    occurred_at: str | None = None
    failure_reason: str | None = None
    provider_message_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class MessageEventIngestResponse(BaseModel):
    message_id: str
    event_id: str


class DashboardOverview(BaseModel):
    period_days: int
    messages_sent: int
    messages_failed: int
    tracked_opens: int
    templates_count: int
    delivery_rate: float | None
    open_rate: float | None


class TrendDay(BaseModel):
    date: str
    sent: int
    failed: int
    opens: int


class DashboardTrends(BaseModel):
    period_days: int
    series: list[TrendDay]


class TopTemplateRow(BaseModel):
    template_id: str
    template_name: str
    send_count: int
    open_count: int


class DashboardTopTemplates(BaseModel):
    period_days: int
    templates: list[TopTemplateRow]


class RecentFailureRow(BaseModel):
    message_id: str
    recipient: str
    subject: str
    failure_reason: str | None
    failed_at: str | None


class DashboardOverviewExtended(BaseModel):
    overview: DashboardOverview
    recent_failures: list[RecentFailureRow]


# --- CMS content entries ---


_CONTENT_KEY_PATTERN = r"^[a-zA-Z0-9._-]+$"
_LOCALE_PATTERN = r"^[a-zA-Z0-9-]+$"


class ContentEntryCreate(BaseModel):
    key: str = Field(pattern=_CONTENT_KEY_PATTERN)
    description: str = ""
    translations: dict[str, str] = Field(default_factory=dict)

    @field_validator("translations")
    @classmethod
    def validate_translation_locales(cls, v: dict[str, str]) -> dict[str, str]:
        rx = re.compile(_LOCALE_PATTERN)
        for loc in v:
            if not rx.fullmatch(loc):
                raise ValueError(f"Invalid locale: {loc}")
        return v


class ContentEntryUpdate(BaseModel):
    key: str | None = None
    description: str | None = None

    @field_validator("key")
    @classmethod
    def validate_key_optional(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not re.fullmatch(_CONTENT_KEY_PATTERN, v):
            raise ValueError("Invalid content key")
        return v


class TranslationUpsert(BaseModel):
    value: str


class ContentEntryResponse(BaseModel):
    id: str
    key: str
    description: str
    translations: dict[str, str]
    created_at: str
    updated_at: str

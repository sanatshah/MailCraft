# Mailcraft data layer — reference

## Environment

| Variable | Effect |
|----------|--------|
| `EMAIL_TEMPLATES_DB` | Path to SQLite file; defaults to `backend/email_templates.db` |

## Core tables (conceptual)

Defined in `database.py` (exact columns in source):

- **templates** — Email template records (`id`, `name`, `subject`, `content`, `preview_text`, timestamps).
- **email_messages** — Outbound message queue/history linked to `template_id`.
- **email_events** — Event log rows associated with messages (delivery lifecycle).

## Seeding

- `seed_if_empty()` in `app/seed.py` runs from the app **lifespan** in `app/app_factory.py` after `init_db()` when the database is empty.
- Keep seed IDs stable if tests or the UI depend on them.

## Local maintenance

- To reset from scratch: stop the backend, delete `email_templates.db`, restart—schema and seed reapply.
- For production-like experiments, point `EMAIL_TEMPLATES_DB` at a copy path so you do not clobber shared dev data.

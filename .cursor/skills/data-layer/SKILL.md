---
name: data-layer
description: >-
  Works with Mailcraft's SQLite data layer: schema in code, seeding, and env
  overrides. Use when changing tables, migrations-by-DDL, seed data, or
  debugging local `email_templates.db` for this repository.
---

# Mailcraft data layer

## Quick rules

1. **Schema source of truth**: DDL and helpers live in `backend/app/database.py` (tables created on startup if missing).
2. **DB file**: Default `backend/email_templates.db`; override with `EMAIL_TEMPLATES_DB`.
3. **Seeding**: `seed_if_empty()` runs in the FastAPI **lifespan** handler (`app_factory`) after `init_db()`—update schema and seed together when adding required data.
4. **Git**: The `.db` file may appear as modified locally; only commit intentional data changes.

## Workflow

1. Read existing `CREATE TABLE` blocks and follow the same style (IF NOT EXISTS, explicit columns).
2. If you add columns, decide whether existing rows need defaults or a one-off migration script (this repo uses simple SQLite; document manual steps if needed).
3. Extend seed data only when it helps local dev or tests.

## Deep reference

For table summaries and env notes, read [reference.md](reference.md).

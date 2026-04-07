---
name: backend-api
description: >-
  Extends and tests the Mailcraft FastAPI backend (routers, models, SQLite).
  Use when adding or changing API routes, request/response shapes, app factory
  wiring, or backend tests in this repository.
---

# Mailcraft backend API

## Quick rules

1. **Entry point**: `app.main:app` delegates to `create_app()` in `app/app_factory.py`—register new routers there.
2. **Routers**: Live under `app/routers/`; keep route prefixes consistent with existing `/api/...` patterns.
3. **New endpoints**: Add or extend tests in `backend/tests/` (workspace rule: new API surface should be covered by tests).
4. **Dependencies**: Editable install from `backend/` with `pip install -e .` (dev extras: `pip install -e '.[dev]'`).

## Workflow

1. Inspect an existing router (e.g. `app/routers/templates.py`) for patterns: Pydantic models, status codes, error shapes.
2. Implement the handler; reuse `app/database.py` helpers and `app/models.py` where applicable.
3. Wire the router in `app/app_factory.py` if it is new.
4. Run `pytest` from `backend/` with the venv activated.

## Deep reference

For file map, testing snippets, and environment variables, read [reference.md](reference.md).

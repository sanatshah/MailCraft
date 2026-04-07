# Backend Code Review Instructions

## Architecture

- The app uses a factory pattern (`create_app` in `app/app_factory.py`). Avoid instantiating `FastAPI()` elsewhere.
- DB initialization and seeding happen in the lifespan handler. Do not call `init_db()` or `seed_if_empty()` at module import time.
- Route handlers are sync functions hitting a sync SQLite connection. If async I/O is introduced (e.g. `httpx`, file I/O), ensure it doesn't mix blocking SQLite calls on the async event loop without `run_in_executor`.

## Database

- All connections must come from `app.database.get_connection()` which sets `row_factory=sqlite3.Row`, enables foreign keys, and uses WAL journal mode.
- Use parameterized queries (`?` placeholders) for all SQL. Flag any string formatting or f-string interpolation in SQL statements as a critical security issue.
- Schema migrations are applied in `init_db()`. New tables or columns must be added there with `IF NOT EXISTS` guards so the migration is idempotent.
- The `content` column on `templates` stores JSON as text. Always `json.loads`/`json.dumps` when reading/writing — never assume it's already a Python object.
- Watch for missing `conn.close()` or failure to close connections in error paths. Prefer `try/finally` or context managers.

## API Design

- All routers use `prefix="/api/..."` and `tags=[...]`. New routers must follow this pattern and be registered in `app/routers/__init__.py`.
- Request and response models are Pydantic classes in `app/models.py`. Avoid using raw dicts as response bodies — define a model.
- Return appropriate HTTP status codes: 201 for creation, 404 for missing resources, 422 for validation errors (FastAPI default). Flag endpoints that return 200 for everything.
- `row_to_dict` in the template router parses the JSON `content` field. Any new dict-conversion helpers should handle JSON fields consistently.

## Error Handling

- Flag bare `except:` or `except Exception:` blocks that silently swallow errors. Errors should be logged or re-raised as `HTTPException` with a meaningful status code and detail message.
- Database errors (e.g. constraint violations, missing tables) should return 4xx/5xx with context, not crash with an unhandled 500.

## Testing

- Tests live in `backend/tests/` and run with `pytest`. The test suite uses a temp DB via `EMAIL_TEMPLATES_DB` env var and module-level patching of `DB_PATH`.
- The `autouse` fixture clears tables between tests. New tables must be added to the cleanup fixture to prevent test pollution.
- New API endpoints require test coverage: happy path, validation errors, and not-found cases at minimum.
- Do not introduce test dependencies beyond what's in `pyproject.toml` `[project.optional-dependencies.dev]` without updating the manifest.

## Style

- Use `from __future__ import annotations` at the top of new modules for consistent forward-reference behavior.
- Timestamps are always UTC ISO (`datetime.now(timezone.utc).isoformat()`). Flag `datetime.now()` without timezone or `datetime.utcnow()` (deprecated in 3.12).
- Keep imports organized: stdlib, third-party, local — one blank line between groups.

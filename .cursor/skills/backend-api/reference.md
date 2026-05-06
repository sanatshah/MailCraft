# Mailcraft backend — reference

## Layout

| Path | Role |
|------|------|
| `app/main.py` | ASGI app export (`app = create_app()`) |
| `app/app_factory.py` | App construction, middleware, router includes |
| `app/database.py` | SQLite path, schema DDL, connection helpers |
| `app/models.py` | Pydantic / shared models |
| `app/seed.py` | Initial data when DB is empty |
| `app/routers/*.py` | HTTP routes (`health`, `templates`, `metrics` — dashboard, events ingest, open tracking pixel) |
| `tests/test_api.py` | API tests |

## Database path

- Default file: `backend/email_templates.db` (resolved relative to the `backend` package parent).
- Override: set env var `EMAIL_TEMPLATES_DB` to an absolute or relative path.

## Tests

From `backend/` with venv active:

```bash
pytest
pytest tests/test_api.py -k "some_keyword"
```

Prefer `TestClient` against `app.main:app` (see existing tests) so routes are exercised end-to-end.

## Adding a router

1. Create `app/routers/my_feature.py` with an `APIRouter(prefix="/api/...", tags=[...])`.
2. In `app_factory`, `include_router` with the same style as existing routers.
3. Add tests that hit the new paths and assert status + JSON body.

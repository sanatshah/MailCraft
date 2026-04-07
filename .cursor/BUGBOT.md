# Code Review Instructions

## Project Overview

Mailcraft is an email template builder with a React 19 + TypeScript frontend (Vite 7) and a FastAPI + SQLite backend. The frontend proxies `/api` requests to the backend at port 8002.

## General

- Flag any secrets, credentials, or API keys committed in plain text.
- Watch for changes that break the frontend/backend API contract. The frontend types in `frontend/src/types/index.ts` must stay aligned with backend Pydantic models in `backend/app/models.py`.
- Ensure new dependencies are added to the correct manifest (`frontend/package.json` or `backend/pyproject.toml`) and not pinned to an unnecessarily narrow version range.

## Frontend

- TypeScript strict mode is enabled (`noUnusedLocals`, `noUnusedParameters`, `strict`). Do not approve changes that weaken `tsconfig.app.json` strictness without justification.
- ESLint 9 flat config is enforced. Flag any new `eslint-disable` comments that suppress rules without an explanatory comment.
- React 19 is in use. Watch for deprecated lifecycle patterns or legacy APIs.
- The `api` client in `frontend/src/api/client.ts` is the single point for backend communication. Flag any raw `fetch`/`XMLHttpRequest` calls that bypass it.
- Components use co-located `.css` files and CSS custom properties from `frontend/src/styles/variables.css`. Flag inline styles or hardcoded color/spacing values that should reference tokens.
- Drag-and-drop uses `@dnd-kit`. Ensure accessibility attributes (`aria-*`, keyboard handling) are preserved when modifying DnD interactions.
- Tests use Vitest + React Testing Library. New user-facing features or bug fixes should include or update tests. Prefer querying by role or `data-testid` over DOM structure.

## Backend

- All API routes live under `/api`. New routers must be registered in `app/routers/__init__.py` via `register_routers`.
- SQLite is the database layer (sync `sqlite3`, WAL mode, foreign keys ON). Flag any change that:
  - Opens its own connection instead of using `get_connection()` from `app/database.py`.
  - Disables or ignores foreign key constraints.
  - Uses string interpolation/concatenation for SQL (SQL injection risk) — parameterized queries only.
- Pydantic models in `app/models.py` define the API schema. Reject breaking changes to response shapes without a migration or versioning plan.
- Timestamps must use UTC ISO format (`datetime.now(timezone.utc).isoformat()`). Flag naive datetimes.
- Tests use `pytest` + `httpx` `TestClient`. New endpoints must have corresponding test coverage in `backend/tests/`.

## Cross-Cutting Concerns

- CORS is currently `allow_origins=["*"]`. If a PR tightens this, verify it doesn't break the Vite dev proxy or any deployed frontend origin.
- The SQLite DB path is configurable via `EMAIL_TEMPLATES_DB` env var. Hardcoded paths to the DB file are a bug.
- Template `content` is stored as serialized JSON text in SQLite. Flag changes that assume a fixed schema for this JSON without validating/parsing it.

---
name: debug-local
description: >-
  Systematically debugs local Mailcraft dev issues: backend not reachable,
  proxy failures, SQLite locks, and test failures. Use when the user hits
  errors running the app locally or when API calls from the UI fail.
---

# Mailcraft local debugging

## 1. Confirm services

| Check | Command / action |
|-------|------------------|
| Backend up | `curl -s http://127.0.0.1:8002/api/health` → `{"status":"ok"}` |
| Frontend up | Open `http://localhost:5174` |
| Ports | Backend **8002**, frontend **5174** (see `AGENTS.md`) |

If health fails, start backend from `backend/` with venv + `uvicorn` (see `run-local` skill).

## 2. UI cannot reach API

- **Symptom**: Network error, 404 on `/api/...` from the browser.
- **Checks**:
  1. Backend health (above).
  2. `frontend/vite.config.ts` — `proxy['/api'].target` must be `http://localhost:8002`.
  3. Restart Vite after editing `vite.config.ts`.

## 3. Backend import or dependency errors

- Run from `backend/` with `.venv` activated.
- Reinstall: `pip install -e .` (dev: `pip install -e '.[dev]'`).

## 4. SQLite / database

- **Wrong file**: Set `EMAIL_TEMPLATES_DB` intentionally or remove override.
- **Stale schema**: Compare `app/database.py` DDL with expectations; for a clean slate, stop server, delete `email_templates.db`, restart (dev only).

## 5. Tests

- Backend: `pytest` from `backend/`, venv on; use `-k` to narrow.
- Frontend: `npm run test` in `frontend/`; fix jsdom or mock issues in `src/setupTests.ts` if setup-related.

## 6. Still stuck

Capture: exact error text, which command or URL failed, and whether backend health passes. That trio usually localizes the fault to proxy vs app vs DB.

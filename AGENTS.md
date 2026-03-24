# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Mailcraft is a drag-and-drop email template builder with two services:

| Service | Directory | Port | Start command |
|---------|-----------|------|---------------|
| Backend (FastAPI) | `backend/` | 8002 | `cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8002` |
| Frontend (Vite + React) | `frontend/` | 5174 | `cd frontend && npm run dev` |

The frontend proxies `/api` requests to the backend (configured in `frontend/vite.config.ts`). The backend uses an embedded SQLite database (`backend/email_templates.db`) that is auto-created and seeded on first startup — no external database or Docker is needed.

### Running services

See `.cursor/skills/run/SKILL.md` for the canonical startup steps. Start the backend first, then the frontend. Verify with `curl -s http://127.0.0.1:8002/api/health`.

### Lint / Test / Build

| Check | Command | Directory |
|-------|---------|-----------|
| Backend tests | `source .venv/bin/activate && pytest` | `backend/` |
| Frontend lint | `npm run lint` | `frontend/` |
| Frontend tests | `npm run test` | `frontend/` |
| Frontend build | `npm run build` | `frontend/` |

### Gotchas

- The system Python on the VM may lack `python3.12-venv`. The update script installs it via `apt` if missing.
- Backend dependencies must be installed with `pip install -e '.[dev]'` (editable + dev extras) to get `pytest` and `httpx` for testing.
- If the backend port 8002 is already in use, the frontend proxy will fail silently — check backend is running before debugging frontend API errors.

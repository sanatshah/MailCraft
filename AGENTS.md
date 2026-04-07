# Mailcraft – Agent Instructions

## Cursor Cloud specific instructions

### Architecture

Mailcraft is a two-service monorepo (no monorepo tooling): a **FastAPI backend** (Python, SQLite) and a **Vite + React frontend** (TypeScript). There are no external service dependencies — SQLite is file-based and embedded.

### Running services

See `README.md` "Run locally" for standard commands. Key points:

| Service | Directory | Port | Command |
|---------|-----------|------|---------|
| Backend | `backend/` | 8002 | `source .venv/bin/activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8002` |
| Frontend | `frontend/` | 5174 | `npm run dev` |

The frontend proxies `/api` to `http://localhost:8002` via `vite.config.ts`. If the backend port changes, update the proxy target.

On first start, the backend auto-creates `backend/email_templates.db` and seeds it if empty.

### Lint / Test / Build

| Check | Directory | Command |
|-------|-----------|---------|
| Backend tests | `backend/` | `source .venv/bin/activate && pytest` |
| Frontend lint | `frontend/` | `npx eslint .` |
| Frontend tests | `frontend/` | `npm run test` |
| Frontend build | `frontend/` | `npm run build` |

### Gotchas

- The VM's system Python 3.12 does not ship `python3.12-venv` by default. The update script installs it via `apt`. If venv creation fails with "ensurepip is not available", run `sudo apt-get install -y python3.12-venv`.
- The backend venv lives at `backend/.venv`. Always activate it before running backend commands.
- The frontend uses `npm` (lockfile: `package-lock.json`).

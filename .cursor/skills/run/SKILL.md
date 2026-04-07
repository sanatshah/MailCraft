---
name: run-local
description: Starts the Mailcraft stack locally—FastAPI backend on port 8002 and Vite React frontend on port 5174 with /api proxied to the backend. Use when the user asks to run, start, bring up, or develop the mailcraft app, dev servers, or local environment.
---

# Run Mailcraft locally

## What runs where

| Service   | Directory  | Port | Notes                                      |
|-----------|------------|------|--------------------------------------------|
| Frontend  | `frontend` | 5174 | Vite; proxies `/api` → `http://localhost:8002` |
| Backend   | `backend`  | 8002 | FastAPI (`app.main:app`); SQLite at `backend/email_templates.db` |

## Prerequisites

- **Node.js** (current LTS is fine) for the frontend
- **Python 3.10+** (repo pins **3.12** in `mise.toml` if using [mise](https://mise.jdx.dev/))

## Steps (two terminals)

**Terminal 1 — backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload --host 127.0.0.1 --port 8002
```

Wait until Uvicorn reports the app is running. On first start, the app initializes SQLite and seeds empty DB if needed.

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev
```

## Verify

- API health: `curl -s http://127.0.0.1:8002/api/health` → `{"status":"ok"}`
- UI: open **http://localhost:5174**

## Common issues

- **API errors from the UI**: Confirm the backend is on **8002** (matches `frontend/vite.config.ts` proxy target).
- **Module not found (backend)**: Run commands from `backend` with the venv activated after `pip install -e .`.
- **Port in use**: Stop the other process or change the port; if you change the backend port, update `vite.config.ts` `server.proxy['/api'].target` to match.

## Optional

- **Backend tests** (from `backend`, venv on): `pip install -e '.[dev]'` then `pytest`
- **Frontend tests**: `npm run test` in `frontend`

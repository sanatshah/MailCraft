# Mailcraft

Mailcraft is a local email template and analytics app: a **React + Vite** frontend whose home page shows an **email metrics dashboard** (sends, failures, opens, trends), plus routes to **build templates** from blocks (text, images, buttons, dividers, spacers, columns). A **FastAPI** API stores templates and message/event data in **SQLite**, renders templates as HTML for email, and exposes endpoints to **ingest provider events** and **serve an open-tracking pixel**.

## Repository layout

| Path | Role |
|------|------|
| `frontend/` | Vite + React + TypeScript UI |
| `backend/` | FastAPI app (`app.main:app`), SQLite at `backend/email_templates.db` |

## Prerequisites

- **Node.js** (current LTS is fine) for the frontend
- **Python 3.10+** (the repo pins **3.12** in `mise.toml` if you use [mise](https://mise.jdx.dev/))

## Run locally

Use two terminals so the API and UI run together. The dev server proxies `/api` to the backend.

### Backend (port 8002)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload --host 127.0.0.1 --port 8002
```

On first start the app initializes the database and seeds if empty.

### Frontend (port 5174)

```bash
cd frontend
npm install
npm run dev
```

### Check it works

- Health: `curl -s http://127.0.0.1:8002/api/health` → `{"status":"ok"}`
- App: open [http://localhost:5174](http://localhost:5174) (home dashboard; use the sidebar for **Templates** and the template editor)

If the UI cannot reach the API, confirm the backend is on **8002** (see `frontend/vite.config.ts` proxy target). If you change the backend port, update that proxy to match.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/templates` | List templates |
| `POST` | `/api/templates` | Create template |
| `GET` | `/api/templates/{id}` | Get template |
| `PUT` | `/api/templates/{id}` | Update template |
| `DELETE` | `/api/templates/{id}` | Delete template |
| `GET` | `/api/templates/{id}/html` | Render template as HTML (email-oriented layout) |
| `POST` | `/api/events/message` | Ingest a lifecycle event (`accepted`, `sent`, `delivered`, `failed`, `opened`, `clicked`); creates or updates `email_messages` / `email_events` |
| `GET` | `/api/track/open/{message_id}` | Returns a 1×1 transparent GIF and records an `opened` event when embedded in HTML mail |
| `GET` | `/api/dashboard/overview` | Query `days` (1–366): KPIs, rates, and recent failures |
| `GET` | `/api/dashboard/trends` | Query `days` (1–90): per-day sent / failed / open counts |
| `GET` | `/api/dashboard/top-templates` | Query `days` (1–366) and `limit` (1–50): templates ranked by send volume |

Interactive docs are available at [http://127.0.0.1:8002/docs](http://127.0.0.1:8002/docs) while the backend is running.

## Tests

**Backend** (from `backend` with the venv active):

```bash
pip install -e '.[dev]'
pytest
```

**Frontend** (from `frontend`):

```bash
npm run test
```

## Production-style builds

```bash
cd frontend && npm run build
```

Serve the built assets with your preferred static host; keep `/api` routed to the FastAPI app.

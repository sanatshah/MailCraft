# Mailcraft

Mailcraft is a local email template editor: a **React + Vite** frontend for building templates from blocks (text, images, buttons, dividers, spacers, columns), backed by a **FastAPI** API that stores templates in **SQLite**, renders them as HTML for email, and exposes optional **dashboard** and **message event** APIs backed by the same database.

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
- App: open [http://localhost:5174](http://localhost:5174)

If the UI cannot reach the API, confirm the backend is on **8002** (see `frontend/vite.config.ts` proxy target). If you change the backend port, update that proxy to match.

## API overview

Interactive docs are available at [http://127.0.0.1:8002/docs](http://127.0.0.1:8002/docs) while the backend is running.

### Templates

Each template has a **name**, **subject**, **content** (JSON array of blocks), and optional **preview_text** (preheader text for inbox clients). Create and update bodies accept these fields per the OpenAPI schema.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/templates` | List templates |
| `POST` | `/api/templates` | Create template |
| `GET` | `/api/templates/{id}` | Get template |
| `PUT` | `/api/templates/{id}` | Update template |
| `DELETE` | `/api/templates/{id}` | Delete template |
| `GET` | `/api/templates/{id}/html` | Render template as HTML (email-oriented layout; returns `text/html`) |

In the template editor, **Export HTML** saves the template, loads this HTML from the API, and opens it in an in-app preview modal.

### Dashboard

Used by the home dashboard UI. All routes accept a `days` query parameter (defaults and maxima are enforced per endpoint—see `/docs`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard/overview` | Period summary (sends, failures, opens, rates) plus recent failures |
| `GET` | `/api/dashboard/trends` | Daily series of sends, failures, and opens |
| `GET` | `/api/dashboard/top-templates` | Templates ranked by send volume (`limit` query optional) |

### Message events and tracking

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/events/message` | Ingest mail-provider lifecycle events (e.g. accepted, sent, delivered, failed, opened, clicked) and correlate them with templates/messages |
| `GET` | `/api/track/open/{message_id}` | Tracking pixel that records an **opened** event and returns a 1×1 GIF |

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

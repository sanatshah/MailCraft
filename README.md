# Mailcraft

Mailcraft is a local email template editor: a **React + Vite** frontend for building templates from blocks (text, images, buttons, dividers, spacers, columns), backed by a **FastAPI** API that stores templates in **SQLite** and can render them as HTML for email. The home page includes an **email metrics dashboard** (sends, failures, opens, trends, and top templates) backed by event ingestion APIs.

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
- App: open [http://localhost:5174](http://localhost:5174) (home is the metrics dashboard; `/templates` lists templates; `/templates/{id}` is the block editor; `/account` is the account placeholder page)

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
| `GET` | `/api/dashboard/overview` | Dashboard summary for the last `days` (1–366); query: `?days=7` |
| `GET` | `/api/dashboard/trends` | Per-day sent / failed / opens for `days` (1–90) |
| `GET` | `/api/dashboard/top-templates` | Top templates by send volume; query: `?days=7&limit=5` (limit 1–50) |
| `POST` | `/api/events/message` | Ingest provider-style events (`accepted`, `sent`, `delivered`, `failed`, `opened`, `clicked`) for a message / template |
| `GET` | `/api/track/open/{message_id}` | Tracking pixel: records an `opened` event and returns a 1×1 transparent GIF |

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

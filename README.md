# Mailcraft

Mailcraft is a local email template editor: a **React + Vite** frontend for building templates from blocks (text, images, buttons, dividers, spacers, columns), backed by a **FastAPI** API that stores templates in **SQLite** and can render them as HTML for email. The template editor includes a **Preview email** action that saves the template, fetches rendered HTML from the API, and opens it in a preview modal.

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

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/templates` | List templates |
| `POST` | `/api/templates` | Create template |
| `GET` | `/api/templates/{id}` | Get template |
| `PUT` | `/api/templates/{id}` | Update template |
| `DELETE` | `/api/templates/{id}` | Delete template |
| `GET` | `/api/templates/{id}/html` | Render template as HTML (email-oriented layout) |

The home page dashboard and email analytics use these additional endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/events/message` | Ingest provider lifecycle events for a message (`event_type`: accepted, sent, delivered, failed, opened, clicked) |
| `GET` | `/api/track/open/{message_id}` | Return a 1×1 GIF and record an open for that message id |
| `GET` | `/api/dashboard/overview?days=N` | Summary KPIs and recent failures (`days`: 1–366) |
| `GET` | `/api/dashboard/trends?days=N` | Daily send/delivery trend series (`days`: 1–90) |
| `GET` | `/api/dashboard/top-templates?days=N&limit=M` | Top templates by send volume (`days`: 1–366, `limit`: 1–50) |

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

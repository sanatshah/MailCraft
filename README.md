# Mailcraft

Mailcraft is a local email template editor: a **React + Vite** frontend for building templates from blocks (text, images, buttons, dividers, spacers, columns), backed by a **FastAPI** API that stores templates in **SQLite** and can render them as HTML for email.

## Repository layout

| Path | Role |
|------|------|
| `frontend/` | Vite + React + TypeScript UI (MailCraft) |
| `backend/` | FastAPI app (`app.main:app`), SQLite at `backend/email_templates.db` |
| `game/` | Vite + React + TypeScript game (Cursor Cats) |

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

---

## 🐱 Cursor Cats — Interactive Learning Game

**Cursor Cats** is a browser-based game that teaches users how to use Cursor through a narrative-driven, level-based experience. Players adopt and train a virtual AI cat companion, unlocking abilities that map to real Cursor features.

### Run the game

```bash
cd game
npm install
npm run dev
```

Open [http://localhost:5175](http://localhost:5175)

### Game structure

| World | Theme | Levels |
|-------|-------|--------|
| 1 — Kitten Academy | Agent Interaction (Ask, Plan, Agent, Debug, Models) | 5 + Boss |
| 2 — Grooming Salon | Agent Customization (Rules, MCPs, Context, Scoping) | 4 + Boss |
| 3 — Cat Colony | Agent Orchestration (Background, Tasks, Automation, Review) | 4 + Boss |
| Final Boss | The Cursor Cat Championship | 1 |

**Total: 16 levels + 1 final challenge**

### Test & build

```bash
cd game
npm run test    # vitest (46 tests)
npm run lint    # eslint
npm run build   # production build
```

### How it works

- Standalone Vite + React + TypeScript app — no backend needed
- Game state persisted in localStorage via Zustand
- All agent interactions are pre-scripted with typing animations
- ASCII art cat avatar with collectible accessories
- XP / rank progression system (Stray Kitten → Cursor Cat Master)

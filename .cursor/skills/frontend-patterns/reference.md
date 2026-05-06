# Mailcraft frontend — reference

## App routes (high level)

- **`/`** — Loads dashboard metrics via `/api/dashboard/*`.
- **`/templates`** — Template CRUD against `/api/templates`.
- **`/templates/:id`** — Editor; **Export HTML** calls `GET /api/templates/:id/html` and shows the result in a modal.

## Vite config highlights

- **Port**: `server.port` is `5174`.
- **Proxy**: `/api` → `http://localhost:8002`, `changeOrigin: true`.
- **Vitest**: `environment: 'jsdom'`, `setupFiles: './src/setupTests.ts'`.

## Commands (from `frontend/`)

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run test` | Vitest |
| `npx eslint .` | Lint |

## API usage

- Browser code should call `/api/...` so the dev server proxies to FastAPI.
- CORS is not required for same-origin `/api` in dev when using the proxy.

## Troubleshooting

- **404 or network errors on `/api`**: Backend not running or wrong port; confirm `curl http://127.0.0.1:8002/api/health`.
- **Stale proxy**: Restart Vite after changing `vite.config.ts`.

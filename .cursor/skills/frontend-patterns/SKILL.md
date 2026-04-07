---
name: frontend-patterns
description: >-
  Builds and adjusts the Mailcraft Vite + React frontend: dev server, API proxy,
  Vitest, and ESLint. Use when editing UI, fetch paths, frontend tests, or
  Vite configuration for this repository.
---

# Mailcraft frontend patterns

## Quick rules

1. **Dev server**: `frontend/` → `npm run dev` (port **5174**).
2. **API calls**: Use paths under `/api/...` so Vite proxies to `http://localhost:8002` (see `vite.config.ts`).
3. **If the backend port changes**: Update `server.proxy['/api'].target` in `vite.config.ts` to match.
4. **Quality gates**: `npx eslint .`, `npm run test`, `npm run build` from `frontend/`.

## Workflow

1. Prefer existing components and hooks in `frontend/src/` before adding new abstractions.
2. Keep fetch URLs relative (`/api/...`) unless there is a deliberate exception (e.g. documented env-based base URL).
3. After behavior changes, run tests and lint locally.

## Deep reference

For proxy details, test setup, and build commands, read [reference.md](reference.md).

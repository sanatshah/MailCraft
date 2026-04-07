---
name: ship-checklist
description: >-
  Pre-merge verification for Mailcraft changes across backend and frontend.
  Use before opening a PR, before merging, or when the user asks for a release
  or ship checklist for this repository.
---

# Mailcraft ship checklist

Run what applies to your diff. Skip rows that are unrelated.

## Backend (if Python or API changed)

- [ ] `cd backend && source .venv/bin/activate && pytest` — all green
- [ ] New or changed routes have test coverage in `backend/tests/`
- [ ] No accidental commits of secrets or local-only config

## Frontend (if TS/React changed)

- [ ] `cd frontend && npx eslint .` — clean
- [ ] `npm run test` — green for affected areas
- [ ] `npm run build` — succeeds

## Cross-cutting

- [ ] `AGENTS.md` / ports still accurate if you changed dev URLs or proxy targets
- [ ] SQLite: only commit `email_templates.db` when the change is intentional for the team

## PR hygiene

- Description states **what** changed and **why** (one short paragraph is enough)
- Link related issue or ticket if your team uses one

---
name: git-messages
description: >-
  Writes concise, conventional commit messages and branch names for Mailcraft
  work. Use when the user asks for a commit message, squash message, or naming
  help for git changes in this repository.
---

# Mailcraft git messages

## Commit format

Use **Conventional Commits**-style prefixes when they fit:

- `feat:` — user-visible behavior or API additions
- `fix:` — bug fixes
- `chore:` — tooling, deps, formatting-only refactors
- `test:` — tests only
- `docs:` — README, comments that are primarily documentation

**Subject line**: imperative mood, ~72 characters, no trailing period.

```
feat(templates): add preview text to template editor

Validate preview length on the client; API already accepts preview_text.
```

## Body (optional)

Use when the **why** is not obvious from the subject:

- One short paragraph or bullet list
- Mention breaking changes or follow-up work explicitly

## Branch names

Prefer `type/short-topic` or `issue/TICKET-short-topic`, lowercase with hyphens.

Examples: `fix/api-health-timeout`, `feat/template-duplication`

## Scope hints for this repo

Use scopes like `backend`, `frontend`, `api`, `db`, or a feature name (`templates`, `metrics`) when it clarifies the blast radius.

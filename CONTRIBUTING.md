# Contributing

## Issue-First Workflow

Start with a GitHub issue. One issue maps to one branch or worktree.

## Branch Naming

Use short scoped branch names:

- `product/prd-foundation`
- `frontend/ticket-ui`
- `backend/ticket-api`
- `analytics/classification`
- `database/initial-schema`
- `infrastructure/docker-ci`
- `qa/integration-tests`
- `docs/demo-portfolio`

## Commit Format

Use conventional commits where practical:

- `docs: ...`
- `feat: ...`
- `fix: ...`
- `test: ...`
- `chore: ...`

## Pull Requests

PRs should include:

- Linked issue.
- Scope summary.
- Tests or validation run.
- Security/privacy notes.
- Screenshots for UI work when available.
- Explicit non-goals.

## Tests

Implementation changes require relevant tests. Planning-only changes require validation that documents are readable, links are valid, and no secrets are present.

## Review

Do not merge failed code. Do not merge without reviewing affected files and test output.

## Worktrees

Use separate worktrees for parallel workstreams. Avoid two workstreams modifying the same file at the same time.

## No-Secret Policy

Never commit real `.env` files, tokens, passwords, cookies, sessions, Gmail content, job-search private data, or production credentials.

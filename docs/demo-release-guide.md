# Demo Release Guide

Current roadmap mode: `PORTFOLIO_FIRST_V0_1`.

Issue #27 completes the local portfolio demo package for the implemented
ResolveHub v0.1 workflow. The package is local-first and uses fictional demo
data only. It does not create a public production deployment.

## Local Stack

Use the root Compose topology:

```bash
docker compose up --build
```

Expected local services:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:18080/api/health` by default. Override
  with `BACKEND_PORT` when another host port is needed.
- Analytics health: `http://localhost:8000/analytics/health`
- PostgreSQL: `localhost:15432` by default. Override with `POSTGRES_PORT`
  when another host port is needed.

The frontend, backend, analytics, and PostgreSQL services each have a Compose
health or availability check suitable for local smoke validation.

## Demo Dataset

The canonical demo seed manifest is `tests/demo-seed-data.json`.

It defines fictional requester, support agent, team lead, and admin personas,
fictional tickets, expected dashboard coverage, and the current analytics
deferral rule. Account credentials are represented by
`generated-at-demo-reset`; no fixed personal passwords, tokens, cookies, or
session material are stored in the repository.

## Reset

Reset local containers and persisted demo data with:

```bash
docker compose down --volumes
docker compose up --build
```

This reset path clears local Compose volumes, including the PostgreSQL demo
volume and dependency caches. Recreate any local `.env` from `.env.example`
after reviewing placeholder values.

## Smoke Checks

After the stack reports healthy, verify:

```bash
curl http://localhost:5173
curl http://localhost:18080/api/health
curl http://localhost:8000/analytics/health
docker compose exec postgres pg_isready -U resolvehub_local -d resolvehub
```

Then run the local release-package validator:

```bash
node scripts/validate-demo-release.js
```

## Demo Script

1. Open `http://localhost:5173`.
2. Show the ticket workspace with fictional support requests.
3. Create or inspect the laptop dock support ticket.
4. Move a ticket through the Kanban status controls.
5. Review dashboard status, category, priority, and trend summaries.
6. Explain that backend auth/RBAC, ticket workflow, comments, activity history,
   dashboard APIs, dashboard UI, and Issue #26 quality gates are merged.
7. Explain that #23 is optional stretch, while #24 and #25 are deferred to v0.2.

## Release Guardrails

- Use fictional data only.
- Do not commit real `.env` files.
- Do not publish production credentials or personal demo passwords.
- Do not claim public production launch from this local package.
- Keep analytics examples clearly labeled unless #23 is separately completed.

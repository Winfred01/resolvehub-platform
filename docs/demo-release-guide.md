# Demo Release Guide

Current roadmap mode: `ANALYTICS_ASSISTED_V0_2`.

Issue #27 completed the local portfolio demo package for the implemented
ResolveHub v0.1 workflow. The v0.2 demo package extends that baseline with
fictional analytics-assisted triage scenarios after #23, #24, #25, and the
analytics-specific quality gates merged. The package is local-first and uses
fictional demo data only. It does not create a public production deployment.

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
fictional tickets, expected dashboard coverage, and v0.2 analytics examples for
category, priority, duplicate, low-confidence, and analytics-unavailable paths.
Account credentials are represented by `generated-at-demo-reset`; no fixed
personal passwords, tokens, cookies, or session material are stored in the
repository.

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
node scripts/validate-quality-gates.js
node scripts/validate-analytics-assisted-v0.2-roadmap.js
```

## Demo Script

1. Open `http://localhost:5173`.
2. Show the ticket workspace with fictional support requests.
3. Create or inspect a fictional analytics-ready support ticket.
4. Move a ticket through the Kanban status controls.
5. Review dashboard status, category, priority, and trend summaries.
6. Show advisory category and priority suggestions with confidence and
   explanation.
7. Stage an accepted category or priority suggestion and confirm ticket truth is
   not changed until the normal ticket update action.
8. Review duplicate candidates and record an explicit duplicate review
   decision.
9. Show the analytics-unavailable fallback path and confirm the ticket workflow
   remains usable.
10. Explain that #23, #24, #25, and PR #59 quality gates are merged while v0.2
    completion still requires this release package to merge.

## Release Guardrails

- Use fictional data only.
- Do not commit real `.env` files.
- Do not publish production credentials or personal demo passwords.
- Do not claim public production launch from this local package.
- Keep analytics examples fictional, advisory, explainable, and overrideable.
- Do not add external AI provider calls, opaque ML training, autonomous ticket
  mutation, automatic closure, or automatic duplicate merging.

# Deployment Plan

Current roadmap mode: `ANALYTICS_ASSISTED_V0_2`.

Current status: Docker Compose, CI foundations, #22 dashboard UI, scoped #26
validation, #27 local portfolio release packaging, #23 category/priority
suggestions, #24 duplicate suggestions, #25 workflow integration, and PR #59
analytics-specific quality gates are merged. The current v0.2 release package
adds demo documentation, fictional analytics scenarios, and validation for the
analytics-assisted local demo.

## Demo Hosting Options

- Frontend: static hosting such as GitHub Pages, Netlify, Vercel, or equivalent.
- Backend: small container service or Java-friendly PaaS.
- Analytics: small Python service host.
- PostgreSQL: managed free-tier database or local Docker demo database.

## Recommended MVP Demo Path

Use Docker Compose locally first. After local smoke tests pass, prepare
portfolio release notes, screenshots, and a demo script. Choose a low-cost
hosted frontend and backend option with managed PostgreSQL only if the demo
needs to be public.

The local release package is documented in `docs/demo-release-guide.md`,
`docs/v0.1-release-notes.md`, and `docs/v0.2-release-notes.md`.

## Environment Variables

Use deployment secrets for database URL, application secrets, analytics service URL, CORS origins, and demo account controls. Never commit real values.

## Migrations

Run database migrations during deployment or as a controlled release step.

## Health Checks

- Frontend: `http://localhost:5173`.
- Backend: `http://localhost:18080/api/health` by default, or the configured
  `BACKEND_PORT`.
- Analytics: `/analytics/health`.
- PostgreSQL: `docker compose exec postgres pg_isready -U resolvehub_local -d resolvehub`.

Analytics health is part of the v0.2 stack smoke test. Backend and frontend
flows must still tolerate an unavailable analytics service without blocking the
core ticket workflow.

## Logging

Log request IDs, status codes, errors, and audit events. Do not log tokens, passwords, private ticket content beyond safe operational metadata, or session material.

## Rollback

Keep previous image or release available. Database rollback requires migration strategy review before production.

## Cost And Free-Tier Limits

Free-tier services may sleep, throttle, or reset data. The demo plan must disclose these limits.

## Demo Reset

Demo data should be resettable and fictional. No real user data is allowed.
Use `tests/demo-seed-data.json` as the canonical seed manifest and reset local
state with:

```bash
docker compose down --volumes
docker compose up --build
```

## CORS And HTTPS

Require HTTPS for hosted demo. Limit CORS to configured frontend origin.

## Deployment Secrets

All deployment secrets must be stored in the hosting provider or GitHub Actions secrets. They must not be printed in logs.

## v0.2 Analytics Deployment Planning

The v0.2 deployment plan keeps analytics service configuration explicit and
optional-failure-safe. Backend and frontend deployments must tolerate an
unavailable analytics service without blocking the core ticket workflow. Any
hosted demo must keep analytics secrets in managed configuration and must not
log private ticket content or recommendation input bodies.

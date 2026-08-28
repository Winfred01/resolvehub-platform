# Deployment Plan

Current roadmap mode: `PORTFOLIO_FIRST_V0_1`.

Current status: Docker Compose, CI foundations, #22 dashboard UI, and scoped
#26 validation are merged. Issue #27 completes the local portfolio demo release
package with health checks, fictional seed manifest, reset instructions, and
release documentation. Full #24/#25 analytics completion is not a v0.1 release
prerequisite.

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

The local Issue #27 release package is documented in
`docs/demo-release-guide.md` and `docs/v0.1-release-notes.md`.

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

Analytics health can remain part of the stack smoke test even when #23/#24/#25
feature work is deferred.

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

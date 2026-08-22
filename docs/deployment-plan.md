# Deployment Plan

Current roadmap mode: `PORTFOLIO_FIRST_V0_1`.

Current status: Docker Compose and CI foundations exist, but the final
portfolio demo release package is not complete. The v0.1 demo path depends on
#22 dashboard UI, scoped #26 validation, and scoped #27 demo/release work. Full
#24/#25 analytics completion is not a v0.1 release prerequisite.

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

## Environment Variables

Use deployment secrets for database URL, application secrets, analytics service URL, CORS origins, and demo account controls. Never commit real values.

## Migrations

Run database migrations during deployment or as a controlled release step.

## Health Checks

- Backend: `/actuator/health` or equivalent.
- Analytics: `/analytics/health`.
- Frontend: static asset availability.

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

## CORS And HTTPS

Require HTTPS for hosted demo. Limit CORS to configured frontend origin.

## Deployment Secrets

All deployment secrets must be stored in the hosting provider or GitHub Actions secrets. They must not be printed in logs.

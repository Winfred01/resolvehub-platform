# Deployment Plan

Current status: planning only. No deployment has been created.

## Demo Hosting Options

- Frontend: static hosting such as GitHub Pages, Netlify, Vercel, or equivalent.
- Backend: small container service or Java-friendly PaaS.
- Analytics: small Python service host.
- PostgreSQL: managed free-tier database or local Docker demo database.

## Recommended MVP Demo Path

Use Docker Compose locally first. After local smoke tests pass, choose a low-cost hosted frontend and backend option with managed PostgreSQL if the demo needs to be public.

## Environment Variables

Use deployment secrets for database URL, application secrets, analytics service URL, CORS origins, and demo account controls. Never commit real values.

## Migrations

Run database migrations during deployment or as a controlled release step.

## Health Checks

- Backend: `/actuator/health` or equivalent.
- Analytics: `/analytics/health`.
- Frontend: static asset availability.

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

# Observability Plan

## Goals

- Understand system health.
- Debug failed requests.
- Track ticket workflow events.
- Support demo reliability.

## Planned Signals

- Backend request logs with request ID.
- Error logs with safe stack context.
- Database migration logs.
- Analytics service health logs.
- Audit logs for ticket and role changes.
- Dashboard metrics endpoint timing.

## Metrics

- Request count and latency.
- Error rate.
- Ticket creation count.
- Ticket status transition count.
- Analytics suggestion response time.

## Tracing

Use request IDs across frontend, backend, and analytics calls. Distributed tracing is post-MVP unless needed for debugging.

## Privacy

Do not log passwords, tokens, cookies, sessions, private user content, or secrets.

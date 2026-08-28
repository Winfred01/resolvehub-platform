# Interview Notes

## Project Narrative

ResolveHub is a technical support and issue management platform MVP. The design
emphasizes practical support workflows, audit history, role-based access,
analytics boundaries, and portfolio-ready engineering discipline.

## Engineering Themes

- Scope control: MVP before enterprise ITSM features.
- Security-first planning: no secrets, role matrix, audit logs, input validation.
- Evidence-based claims: planning documents do not imply implementation.
- Workstream separation: frontend, backend, analytics, database, infrastructure, QA, docs.
- Local demo discipline: Docker Compose health checks, resettable fictional
  seed data, and release validation before portfolio claims.

## Questions To Prepare

- Why use a modular monolith backend instead of many microservices?
- How should analytics suggestions avoid becoming unreviewed truth?
- What role boundaries matter most?
- How would you test authorization?
- How would you keep demo data safe?

## Current Demo Position

The core ticket workflow, dashboard, and scoped quality gates are implemented
and merged before Issue #27. The portfolio demo package is local-first, uses
fictional data, and does not claim a public production deployment. #23 remains
optional stretch; #24 and #25 are deferred to v0.2.

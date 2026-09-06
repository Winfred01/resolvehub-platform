# Demo Plan

Current roadmap mode: `ANALYTICS_ASSISTED_V0_2`.

## Demo Story

The demo should show a requester creating a support ticket, an agent triaging it,
a team lead reviewing dashboard metrics, and an admin reviewing role/audit
boundaries. The v0.2 pass adds deterministic advisory analytics suggestions to
the ticket workflow without hidden mutation.

Portfolio-first v0.1 remains the preserved baseline. v0.2 adds merged #23
category/priority suggestions, #24 duplicate suggestions, #25 ticket workflow
integration, and PR #59 analytics-specific quality gates.

## Demo Data

All demo data must be fictional. Demo users, tickets, categories, comments, and
analytics suggestions must not use real customer, employer, job-search, Gmail,
browser-session, private-address, phone-number, credential, token, cookie, or
personal data. The canonical seed manifest is `tests/demo-seed-data.json`.

## Demo Accounts

Do not hardcode fixed personal passwords. Demo credentials should be generated
by deployment or provided through a safe public demo mechanism. The seed
manifest uses `generated-at-demo-reset` for all demo accounts.

## Reset

The demo is resettable to a known fictional dataset:

```bash
docker compose down --volumes
docker compose up --build
```

Validate the package with:

```bash
node scripts/validate-demo-release.js
node scripts/validate-quality-gates.js
node scripts/validate-analytics-assisted-v0.2-roadmap.js
```

## Script

1. Log in as requester.
2. Create ticket.
3. Log in as agent.
4. Triage and comment.
5. Move ticket through workflow.
6. Review Kanban state.
7. Log in as lead.
8. Review dashboard.
9. Log in as admin.
10. Review role management and audit notes.
11. Inspect an analytics-ready ticket.
12. Review the advisory category and priority suggestion with confidence and
    explanation.
13. Accept a suggestion and confirm it is staged for normal ticket update.
14. Review duplicate candidates and record an explicit duplicate review.
15. Show low-confidence or analytics-unavailable fallback while the ticket
    workflow remains usable.

Analytics suggestions are not autonomous decisions. The demo must show `ACCEPT`,
`IGNORE`, and `OVERRIDE` paths as explicit user review actions.

## Screenshots

Screenshots should include ticket list, ticket detail with advisory analytics,
Kanban, dashboard, and admin role/audit screen after implementation exists.

## Health Checks

Local smoke verification for Issue #27:

```bash
curl http://localhost:5173
curl http://localhost:18080/api/health
curl http://localhost:8000/analytics/health
docker compose exec postgres pg_isready -U resolvehub_local -d resolvehub
```

## v0.2 Analytics Scenarios

The v0.2 demo extends the completed v0.1 flow with fictional suggestion
scenarios after #23, #24, #25, and PR #59 analytics-specific quality gates. The
demo must show recommendations as advisory, explainable, and overrideable,
including a graceful analytics-service failure path.

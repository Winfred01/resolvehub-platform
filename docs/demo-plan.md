# Demo Plan

Current roadmap mode: `PORTFOLIO_FIRST_V0_1`.

## Demo Story

The demo should show a requester creating a support ticket, an agent triaging it, a team lead reviewing dashboard metrics, and an admin managing roles.

Full analytics workflow integration is not required for the Portfolio-first v0.1
demo. Category/priority suggestions may be shown only if optional Issue #23 is
enabled and completed before release. Duplicate suggestions and full analytics
workflow integration are v0.2 work.

## Demo Data

All demo data must be fictional. Demo users, tickets, categories, comments, and
analytics suggestions must not use real customer, employer, job-search, Gmail,
or personal data. The Issue #27 seed manifest is `tests/demo-seed-data.json`.

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

Optional stretch step: review category/priority suggestion if #23 is completed
and included in the release.

## Screenshots

Future screenshots should include ticket list, ticket detail, Kanban, dashboard, and admin role screen after implementation exists.

## Health Checks

Local smoke verification for Issue #27:

```bash
curl http://localhost:5173
curl http://localhost:18080/api/health
curl http://localhost:8000/analytics/health
docker compose exec postgres pg_isready -U resolvehub_local -d resolvehub
```

## v0.2 Demo Planning

The v0.2 demo should extend the completed v0.1 flow with fictional suggestion
scenarios after #23, #24, #25, analytics-specific quality gates, and v0.2 release
docs have merged. The demo must show recommendations as advisory, explainable,
and overrideable, including a graceful analytics-service failure path.

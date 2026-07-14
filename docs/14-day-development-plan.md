# 14-Day Development Plan

## Day 1: Product Foundation

- Goals: PRD, repository audit, milestone plan, issue plan.
- Issues: docs foundation, PRD, GitHub planning.
- Done: docs validated, no secrets.
- Tests: planning validation.
- Risks: scope creep.
- Dependencies: repository access.

## Day 2: Contracts And Wireframes

- Goals: user stories, wireframes, schema, API contract.
- Issues: user story set, API contract, database plan.
- Done: endpoints and tables reviewed.
- Tests: docs links and contract review.
- Risks: ambiguous role permissions.
- Dependencies: PRD.

## Day 3: Backend Foundation

- Goals: Spring Boot scaffold, PostgreSQL config, migration tool decision.
- Issues: backend scaffold, database migrations, health endpoint.
- Done: app starts locally.
- Tests: unit and smoke tests.
- Risks: over-scaffolding.
- Dependencies: API and schema.

## Day 4: Backend Auth

- Goals: registration, login, logout, role model.
- Issues: auth endpoints, password hashing, role authorization.
- Done: auth paths tested.
- Tests: controller and security tests.
- Risks: broken access control.
- Dependencies: backend foundation.

## Day 5: Ticket API

- Goals: create/view/edit tickets, validation, status transitions.
- Issues: ticket CRUD, transition rules.
- Done: core ticket endpoints tested.
- Tests: integration tests.
- Risks: weak audit history.
- Dependencies: auth and schema.

## Day 6: Comments And Activity

- Goals: comments, activities, assignments.
- Issues: comments endpoint, activity endpoint, assignment logic.
- Done: ticket history visible via API.
- Tests: audit assertions.
- Risks: missing actor attribution.
- Dependencies: ticket API.

## Day 7: Frontend Foundation

- Goals: React TypeScript scaffold, routes, layout, API client.
- Issues: frontend scaffold, design tokens, routing.
- Done: app starts with placeholder screens.
- Tests: component smoke tests.
- Risks: UI before API stability.
- Dependencies: API contract.

## Day 8: Ticket UI

- Goals: ticket list, forms, detail, comments.
- Issues: create ticket UI, detail UI, filters.
- Done: core workflow usable locally.
- Tests: component tests.
- Risks: inaccessible forms.
- Dependencies: frontend foundation.

## Day 9: Kanban And Dashboard UI

- Goals: Kanban workflow, dashboard foundation.
- Issues: Kanban, dashboard summary, responsive layout.
- Done: role-aware screens.
- Tests: accessibility tests.
- Risks: keyboard support.
- Dependencies: ticket UI.

## Day 10: Analytics Service

- Goals: FastAPI scaffold, health, category suggestion.
- Issues: analytics scaffold, classify endpoint.
- Done: backend can call analytics service.
- Tests: Pytest and contract tests.
- Risks: suggestions overclaim intelligence.
- Dependencies: API contract.

## Day 11: Analytics Integration

- Goals: duplicate suggestion, priority recommendation, suggestion storage.
- Issues: duplicates, priority, suggestion persistence.
- Done: suggestions visible and reviewable.
- Tests: integration tests.
- Risks: false confidence.
- Dependencies: analytics foundation.

## Day 12: Quality And Security

- Goals: integration tests, E2E smoke, error handling, security hardening, accessibility.
- Issues: QA suite, security tests, audit logging.
- Done: critical paths tested.
- Tests: full local test suite.
- Risks: flaky E2E tests.
- Dependencies: implemented workflows.

## Day 13: Docker And CI

- Goals: Docker Compose, GitHub Actions, deployment plan refinement.
- Issues: Docker, CI, health checks.
- Done: local stack smoke test and CI green.
- Tests: Docker smoke.
- Risks: environment drift.
- Dependencies: app scaffolds.

## Day 14: Portfolio Release Prep

- Goals: final QA, v0.1.0 notes, README, screenshots, demo script, resume bullets, interview notes.
- Issues: docs polish, demo data, release notes.
- Done: demo-ready package without secrets.
- Tests: final validation and secret scan.
- Risks: overstating incomplete work.
- Dependencies: working MVP.

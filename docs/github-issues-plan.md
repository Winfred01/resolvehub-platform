# GitHub Issues Plan

Use these planned issues for GitHub setup. Each issue should include summary, acceptance criteria, tests, dependencies, labels, milestone, suggested workstream, and out-of-scope notes.

## Labels

`type:feature`, `type:documentation`, `type:infrastructure`, `type:test`, `type:security`, `area:frontend`, `area:backend`, `area:analytics`, `area:database`, `area:infrastructure`, `area:docs`, `priority:p0`, `priority:p1`, `priority:p2`, `status:blocked`, `good first issue`.

## Issues

1. Repository structure and safety baseline
   - Milestone: v0.1 Foundation and Architecture
   - Labels: type:documentation, area:docs, priority:p0
   - Workstream: product/prd
   - Acceptance: root structure, no secrets, validation script.
   - Tests: planning validation.
   - Out of scope: application implementation.
2. Product PRD and user stories
   - Milestone: v0.1 Foundation and Architecture
   - Labels: type:documentation, area:docs, priority:p0
   - Workstream: product/prd
   - Acceptance: PRD and at least 25 stories.
   - Tests: docs validation.
3. API contract and backend boundaries
   - Milestone: v0.1 Foundation and Architecture
   - Labels: type:documentation, area:backend, priority:p0
   - Workstream: backend/core-api
   - Acceptance: endpoint contracts and error model.
   - Tests: contract review.
4. Database schema and migration plan
   - Milestone: v0.1 Foundation and Architecture
   - Labels: type:documentation, area:database, priority:p0
   - Workstream: database/schema
   - Acceptance: tables, keys, indexes, retention.
   - Tests: schema review.
5. Frontend scaffold
   - Milestone: v0.1 Core Ticket Workflow
   - Labels: type:feature, area:frontend, priority:p0
   - Workstream: frontend/core-ui
   - Acceptance: React TypeScript app starts.
   - Tests: frontend smoke.
6. Backend scaffold
   - Milestone: v0.1 Core Ticket Workflow
   - Labels: type:feature, area:backend, priority:p0
   - Workstream: backend/core-api
   - Acceptance: Spring Boot app starts with health endpoint.
   - Tests: backend smoke.
7. Analytics scaffold
   - Milestone: v0.1 Analytics and Dashboard
   - Labels: type:feature, area:analytics, priority:p1
   - Workstream: analytics/service
   - Acceptance: FastAPI health endpoint.
   - Tests: Pytest smoke.
8. Docker Compose foundation
   - Milestone: v0.1 Quality, Deployment and Portfolio
   - Labels: type:infrastructure, area:infrastructure, priority:p1
   - Workstream: infrastructure/deployment
   - Acceptance: local stack plan becomes executable.
   - Tests: Docker smoke.
9. CI foundation
   - Milestone: v0.1 Quality, Deployment and Portfolio
   - Labels: type:infrastructure, area:infrastructure, priority:p1
   - Workstream: infrastructure/deployment
   - Acceptance: lint/test placeholders wired.
   - Tests: CI run.
10. User registration
    - Milestone: v0.1 Core Ticket Workflow
    - Labels: type:feature, area:backend, priority:p0
    - Workstream: backend/core-api
    - Acceptance: register endpoint with validation.
    - Tests: unit and controller tests.
11. Login and logout
    - Milestone: v0.1 Core Ticket Workflow
    - Labels: type:feature, area:backend, priority:p0
    - Workstream: backend/core-api
    - Acceptance: login/logout and current user.
    - Tests: security tests.
12. Role authorization
    - Milestone: v0.1 Core Ticket Workflow
    - Labels: type:security, area:backend, priority:p0
    - Workstream: backend/core-api
    - Acceptance: role matrix enforced.
    - Tests: authorization tests.
13. Ticket create/view/edit APIs
    - Milestone: v0.1 Core Ticket Workflow
    - Labels: type:feature, area:backend, priority:p0
    - Workstream: backend/core-api
    - Acceptance: core ticket endpoints.
    - Tests: integration tests.
14. Ticket filters and search
    - Milestone: v0.1 Core Ticket Workflow
    - Labels: type:feature, area:backend, priority:p1
    - Workstream: backend/core-api
    - Acceptance: filter/search endpoints.
    - Tests: query tests.
15. Categories, priority, assignments
    - Milestone: v0.1 Core Ticket Workflow
    - Labels: type:feature, area:backend, priority:p1
    - Workstream: backend/core-api
    - Acceptance: category and assignment workflows.
    - Tests: integration tests.
16. Comments and activity history
    - Milestone: v0.1 Core Ticket Workflow
    - Labels: type:feature, area:backend, priority:p0
    - Workstream: backend/core-api
    - Acceptance: comments and audit records.
    - Tests: audit tests.
17. Kanban workflow UI
    - Milestone: v0.1 Core Ticket Workflow
    - Labels: type:feature, area:frontend, priority:p1
    - Workstream: frontend/core-ui
    - Acceptance: status transitions accessible without drag-only UI.
    - Tests: component and accessibility tests.
18. Dashboard summary metrics
    - Milestone: v0.1 Analytics and Dashboard
    - Labels: type:feature, area:frontend, priority:p1
    - Workstream: frontend/core-ui
    - Acceptance: dashboard summary and charts.
    - Tests: component tests.
19. Analytics category suggestion
    - Milestone: v0.1 Analytics and Dashboard
    - Labels: type:feature, area:analytics, priority:p1
    - Workstream: analytics/service
    - Acceptance: category suggestion contract.
    - Tests: Pytest.
20. Analytics priority recommendation
    - Milestone: v0.1 Analytics and Dashboard
    - Labels: type:feature, area:analytics, priority:p1
    - Workstream: analytics/service
    - Acceptance: priority suggestion contract.
    - Tests: Pytest.
21. Analytics duplicate suggestion
    - Milestone: v0.1 Analytics and Dashboard
    - Labels: type:feature, area:analytics, priority:p2
    - Workstream: analytics/service
    - Acceptance: duplicate candidates with confidence.
    - Tests: Pytest and contract tests.
22. E2E and accessibility test suite
    - Milestone: v0.1 Quality, Deployment and Portfolio
    - Labels: type:test, area:frontend, priority:p1
    - Workstream: qa/test-suite
    - Acceptance: core Playwright paths and accessibility checks.
    - Tests: E2E.
23. Security hardening and audit logging
    - Milestone: v0.1 Quality, Deployment and Portfolio
    - Labels: type:security, area:backend, priority:p0
    - Workstream: qa/test-suite
    - Acceptance: secret scan, auth tests, audit events.
    - Tests: security tests.
24. Demo data, screenshots, and script
    - Milestone: v0.1 Quality, Deployment and Portfolio
    - Labels: type:documentation, area:docs, priority:p1
    - Workstream: docs/portfolio
    - Acceptance: fictional data and demo script.
    - Tests: privacy scan.
25. Deployment plan and smoke checks
    - Milestone: v0.1 Quality, Deployment and Portfolio
    - Labels: type:infrastructure, area:infrastructure, priority:p1
    - Workstream: infrastructure/deployment
    - Acceptance: demo deployment checklist.
    - Tests: smoke tests.
26. v0.1 release notes and portfolio review
    - Milestone: v0.1 Quality, Deployment and Portfolio
    - Labels: type:documentation, area:docs, priority:p1
    - Workstream: docs/portfolio
    - Acceptance: release notes, resume bullets, interview notes.
    - Tests: docs validation and no overclaim scan.

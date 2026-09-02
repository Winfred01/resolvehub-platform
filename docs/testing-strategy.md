# Testing Strategy

Current roadmap mode: `PORTFOLIO_FIRST_V0_1`.

## Frontend

- Unit tests for utility logic with Vitest.
- Component tests with React Testing Library.
- Accessibility tests for forms, navigation, tables, and Kanban.
- Visual smoke checks for responsive layouts.

## Backend

- Unit tests for services and validators.
- Spring Boot controller tests for API behavior.
- Integration tests with Testcontainers and PostgreSQL.
- Authorization tests for every role boundary.

## Database

- Migration tests.
- Constraint tests.
- Seed data safety checks.

## Analytics

- Pytest tests for the analytics health endpoint.
- Category and priority suggestion tests apply if optional Issue #23 is enabled
  before v0.1.
- Duplicate suggestion tests are implemented for Issue #24. Backend/frontend
  analytics integration tests are implemented for Issue #25.

## API Contract

- Request/response schema tests.
- Error code tests.
- Pagination and idempotency tests.

## End-To-End

- Portfolio-first v0.1 Playwright smoke tests cover requester ticket creation,
  keyboard-operable Kanban status controls, dashboard filters, and chart text
  equivalents for the implemented demo workflow.
- Backend role-boundary tests cover requester, support role, lead, and admin
  authorization behavior until frontend session integration exists.
- Analytics suggestion display is not a required v0.1 E2E path unless #23 is
  explicitly enabled as a stretch goal.

## Docker Smoke Tests

- Build containers.
- Start local stack.
- Check backend and analytics health endpoints.
- Verify frontend can reach backend.

## Security Checks

- Secret scan.
- Dependency scan.
- Basic static analysis.
- Role authorization regression tests.
- Authentication and authorization security regressions covering password hash
  storage, session token hash storage, logout revocation, expired sessions,
  uniform login failures, malformed bearer headers, role escalation attempts,
  and sensitive-field response scans.
- Login and registration rate-limit regression tests should be added when the
  backend introduces enforceable rate-limiting middleware.

## CI Gates

Current gates: docs/privacy validators, Issue #26 quality-gate inventory,
frontend lint/component/accessibility tests/build/audit, Playwright E2E smoke,
backend Maven tests/package, analytics health tests, and Docker Compose config.

## Validation Tiers

### Tier 1: Read-only reconciliation

For unchanged external blockers, run only lightweight Git/GitHub state checks.
Do not run full test suites or create repository run-log commits.

### Tier 2: Documentation and governance changes

Run planning validation, roadmap-mode validation, GitHub metadata/privacy
validation, `git diff --check`, and targeted secret scans.

### Tier 3: Scoped implementation

Run tests relevant to the changed workstream and any directly affected shared
contracts.

### Tier 4: Release candidate

Run full required v0.1 validation: backend, frontend, included analytics
components, security, accessibility, E2E, Docker, CI/release checks, and secret
scans.

## Test Data

All test and demo data must be fictional. Do not use real customer, employer, Gmail, job-search, or personal data.

## Coverage Targets

Initial targets: 70% service-layer coverage, critical authorization paths fully covered, and at least one E2E test per core workflow.

## Flaky Test Handling

Quarantine flaky tests only with a tracking issue. Do not ignore failing security or authorization tests.

## v0.2 Analytics-specific Gates

The v0.2 analytics-specific gates start only after #25 is merged. Issue #25 adds
backend tests for suggestion retrieval, audit-only review decisions, hidden/self
duplicate rejection, and analytics-service failure fallback, plus frontend tests
for advisory accept, ignore, override, and failure states. The follow-up quality
workstream should broaden malformed response, timeout, E2E smoke, accessibility,
and privacy checks proving recommendation handling does not expose private
ticket bodies, comments, credentials, tokens, sessions, Gmail data, browser
data, job-search data, or real customer data.

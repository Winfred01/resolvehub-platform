# Testing Strategy

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

- Pytest tests for category suggestion, duplicate suggestion, priority recommendation, and health endpoint behavior.
- Contract tests between backend and analytics service.

## API Contract

- Request/response schema tests.
- Error code tests.
- Pagination and idempotency tests.

## End-To-End

- Playwright tests for login, ticket creation, ticket update, comments, search, dashboard, and logout.

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

## CI Gates

Planned gates: lint, unit tests, integration tests, E2E smoke, Docker smoke, dependency scan, secret scan, and docs validation.

## Test Data

All test and demo data must be fictional. Do not use real customer, employer, Gmail, job-search, or personal data.

## Coverage Targets

Initial targets: 70% service-layer coverage, critical authorization paths fully covered, and at least one E2E test per core workflow.

## Flaky Test Handling

Quarantine flaky tests only with a tracking issue. Do not ignore failing security or authorization tests.

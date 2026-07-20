# ResolveHub

ResolveHub is a planned full-stack technical support and issue management platform for demonstrating practical support workflow design, ticket operations, analytics-assisted triage, and portfolio-ready engineering documentation.

Current status: **Planning foundation with initial frontend/backend scaffolds, database migration foundation, and backend registration slice**.

This repository now contains an initial React TypeScript frontend scaffold, a Spring Boot backend scaffold with health and registration endpoints, and documented PostgreSQL/Flyway migration foundations. It does not yet contain login/session handling, ticket APIs, a FastAPI analytics service, PostgreSQL production database, deployed demo, or complete cross-service test suite.

## Problem

Small support teams often need a clear place to collect support requests, triage them, assign work, track status, document activity, and review support trends without adopting an oversized enterprise system. ResolveHub is planned as a focused MVP for that workflow.

## MVP Features

- Authentication and role-based authorization.
- Ticket creation, viewing, editing, filtering, searching, assignment, comments, and activity history.
- Kanban-style ticket workflow.
- Dashboard metrics for volume, status, priority, category, response, and resolution trends.
- Analytics service contracts for category suggestion, priority recommendation, and duplicate detection.
- Accessibility, validation, logging, tests, Docker planning, CI planning, and demo planning.

## Non-Goals For v0.1.0

- Realtime chat.
- Native mobile apps.
- Payments or enterprise billing.
- Large microservice architecture.
- Unrestricted AI chatbot.
- Production-scale machine learning.
- Sensitive customer data ingestion.
- Third-party ticket migration.

## Planned Tech Stack

- Frontend: React, TypeScript.
- Backend: Java, Spring Boot.
- Analytics: Python, FastAPI.
- Database: PostgreSQL.
- Infrastructure: Docker, Docker Compose, GitHub Actions.

These are planning choices. They do not mean the code has already been implemented.

## High-Level Architecture

The planned system has a browser frontend, a Spring Boot API, a PostgreSQL database, and a small FastAPI analytics service. The backend remains the source of truth for users, tickets, comments, activity history, and authorization.

See [ARCHITECTURE.md](ARCHITECTURE.md).

## Repository Structure

- `frontend/`: initial React TypeScript client scaffold with placeholder routes.
- `backend/`: Spring Boot API scaffold with health and registration endpoints plus package boundaries.
- `analytics-service/`: planned Python FastAPI analytics service.
- `database/`: PostgreSQL schema planning and migration foundation notes.
- `infrastructure/`: planned Docker and deployment notes.
- `docs/`: product, API, security, testing, demo, and planning documents.
- `tests/`: planned cross-service and end-to-end test assets.
- `scripts/`: repository validation helpers.
- `.github/`: issue templates and future workflow definitions.

## Local Setup

The frontend scaffold has its own local commands under `frontend/`, the backend
scaffold has commands under `backend/`, and the database foundation has a
validation script under `scripts/`. Other workstreams remain planned. The
developer workflow is:

1. Clone this repository.
2. Create a feature branch for one GitHub issue.
3. Install only the dependencies required by that workstream.
4. Run the relevant tests and validation before opening a PR.

For the current frontend scaffold:

```powershell
cd frontend
npm install
npm run lint
npm run test:run
npm run build
```

For the current backend scaffold:

```powershell
cd backend
mvn test
mvn spring-boot:run
```

The backend currently exposes `GET /api/health` and `POST /api/auth/register`.
Registration stores BCrypt password hashes only and uses local in-memory H2
persistence until the production PostgreSQL migration work is implemented.

For the current database foundation:

```powershell
node scripts/validate-database-foundation.js
```

## Planned Docker Setup

Docker Compose is planned for a local demo stack with frontend, backend, analytics service, and PostgreSQL. No production deployment is configured in this planning stage.

## Testing Strategy

The planned test strategy includes frontend unit/component/accessibility tests, Spring Boot unit and integration tests, database tests, Pytest for analytics, API contract tests, Playwright end-to-end tests, Docker smoke tests, and security checks.

See [docs/testing-strategy.md](docs/testing-strategy.md).

## Security

No real secrets, private user data, Gmail data, job-search trackers, browser sessions, employer confidential data, or production credentials should be committed. Demo data must be fictional.

See [SECURITY.md](SECURITY.md) and [docs/security-model.md](docs/security-model.md).

## Roadmap

The 14-day plan is documented in [docs/14-day-development-plan.md](docs/14-day-development-plan.md). The first implementation stage after this planning phase should select one issue, one branch, and a small tested change.

## Contributing

Use an issue-first workflow. Each issue should be implemented on a separate branch or worktree and merged by PR only after tests and review.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License. See [LICENSE](LICENSE).

## Not Yet Completed

- Analytics, Docker, and CI implementation scaffolds.
- Login, logout, sessions, and authorization implementation.
- Ticket APIs.
- Database migrations.
- Analytics implementation.
- CI/CD.
- Online demo.
- Screenshots.
- Production deployment.

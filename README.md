# ResolveHub

ResolveHub is a full-stack technical support and issue management platform for
demonstrating practical support workflow design, ticket operations, role-aware
authorization, dashboard reporting, and portfolio-ready engineering practice.

Completed baseline roadmap mode: `PORTFOLIO_FIRST_V0_1`.

Current live roadmap mode: `ANALYTICS_ASSISTED_V0_2`.

Current status: Portfolio-first v0.1 is complete on `origin/main`. The v0.2
roadmap is active, Issue #23 adds category/priority suggestions, and Issue #24
adds duplicate ticket suggestions.

## Problem

Small support teams need a clear place to collect support requests, triage
them, assign work, track status, document activity, and review support trends
without adopting an oversized enterprise system. ResolveHub is a focused MVP
for that workflow.

## Portfolio-first v0.1 Roadmap

The original 14-day plan remains historical context. The active roadmap is now:

```text
#21 Dashboard APIs
-> #21 PR / review / merge
-> #22 Dashboard UI
-> documentation/status refresh
-> scoped #26 QA/accessibility/security/E2E
-> scoped #27 Docker/demo/portfolio release
-> v0.1
```

Analytics scope:

- `#23`: optional stretch goal for v0.1; valid v0.2 capability if deferred.
- `#24`: deferred to v0.2.
- `#25`: deferred to v0.2.

Full #23/#24/#25 analytics completion is no longer required before a credible
portfolio-focused v0.1 release. See
[docs/portfolio-first-v0.1-roadmap.md](docs/portfolio-first-v0.1-roadmap.md).

## Analytics-assisted v0.2 Roadmap

The proposed v0.2 theme is `EXPLAINABLE_ANALYTICS_ASSISTED_TRIAGE_V0_2`.
It promotes #23, #24, and #25 into a serial `V0_2_CORE` path after the completed
v0.1 baseline:

```text
#23 Category and Priority Suggestion Service
-> #24 Duplicate Ticket Suggestion
-> #25 Integrate Analytics Suggestions with Ticket Workflow
-> Analytics-specific v0.2 Quality / Security / E2E
-> v0.2 Demo / Documentation / Release
-> v0.2 COMPLETE
```

Recommendations must stay deterministic, explainable, advisory, human-reviewed,
overrideable, privacy-safe, and resilient to analytics-service failure. The v0.2
roadmap does not authorize autonomous ticket mutation, automatic closure,
external AI provider calls, opaque ML training pipelines, real private data, or
hidden recommendation acceptance.

## Current Implementation Matrix

| Capability | State | Source |
|---|---|---|
| React/TypeScript frontend scaffold | MERGED | `origin/main` |
| Spring Boot backend scaffold | MERGED | `origin/main` |
| Authentication/RBAC backend | MERGED | `origin/main` |
| Ticket create/detail/list/update/search/filter backend | MERGED | `origin/main` |
| Assignment, comments, and activity history backend | MERGED | `origin/main` |
| Ticket frontend workflow | MERGED | `origin/main` |
| Kanban workflow | MERGED | `origin/main` |
| Dashboard backend APIs | MERGED | `origin/main` |
| Dashboard frontend | MERGED | `origin/main` via PR #48 |
| FastAPI analytics scaffold and health endpoint | MERGED | `origin/main` |
| Category/priority suggestion service | IMPLEMENTED_V0_2_CORE | issue #23 |
| Duplicate suggestion | IMPLEMENTED_V0_2_CORE | issue #24 |
| Full analytics workflow integration | PROPOSED_V0_2_CORE | issue #25 |
| Docker Compose foundation | MERGED | `origin/main` |
| GitHub Actions CI | MERGED | `origin/main` |
| Integrated E2E/accessibility/security release gates | MERGED | `origin/main` via PR #51 |
| Docker demo and portfolio release package | MERGED | `origin/main` via PR #52 |

## MVP Features

- Authentication and role-based authorization.
- Ticket creation, viewing, editing, filtering, searching, assignment,
  comments, and activity history.
- Kanban-style ticket workflow.
- Dashboard metrics for volume, status, priority, category, and trends.
- Portfolio-focused documentation, quality gates, Docker demo flow, and
  release notes.
- Deterministic advisory category, priority, and duplicate suggestions for v0.2
  triage.

## Non-Goals For Portfolio-first v0.1

- Realtime chat.
- Native mobile apps.
- Payments or enterprise billing.
- Large microservice architecture.
- Unrestricted AI chatbot.
- Production-scale machine learning.
- Sensitive customer data ingestion.
- Third-party ticket migration.
- Duplicate suggestion and full analytics workflow integration.

## Tech Stack

- Frontend: React, TypeScript.
- Backend: Java, Spring Boot.
- Analytics: Python, FastAPI.
- Database: PostgreSQL target with local H2 slices where current MVP backend
  implementation requires it.
- Infrastructure: Docker, Docker Compose, GitHub Actions.

## High-Level Architecture

The system has a browser frontend, a Spring Boot API, a PostgreSQL-oriented
database plan with local MVP persistence slices, and a small FastAPI analytics
service. The backend remains the source of truth for users, tickets, comments,
activity history, and authorization.

See [ARCHITECTURE.md](ARCHITECTURE.md).

## Repository Structure

- `frontend/`: React TypeScript client with ticket workspace and Kanban.
- `backend/`: Spring Boot API for auth/RBAC, ticket workflows, comments, and
  activity history.
- `analytics-service/`: FastAPI service scaffold with health endpoint.
- `database/`: PostgreSQL schema planning and migration foundation notes.
- `infrastructure/`: Docker and deployment notes.
- `docs/`: product, API, security, testing, demo, roadmap, and planning docs.
- `tests/`: cross-service and end-to-end test planning assets.
- `scripts/`: repository validation helpers.
- `.github/`: issue templates and CI workflow definitions.

## Local Setup

Frontend:

```powershell
cd frontend
npm install
npm run lint
npm run test:run
npm run build
```

Backend:

```powershell
cd backend
mvn test
mvn spring-boot:run
```

Analytics service:

```powershell
cd analytics-service
python -m pip install -e .[test]
python -m pytest
python -m uvicorn resolvehub_analytics.main:app --app-dir src --reload
```

Planning and metadata validation:

```powershell
node scripts/validate-planning-foundation.js
node scripts/validate-github-metadata-state.js
node scripts/validate-portfolio-first-roadmap.js
node scripts/validate-quality-gates.js
node scripts/validate-demo-release.js
```

Local demo release validation:

```powershell
docker compose -f docker-compose.yml config
docker compose up --build
curl http://localhost:5173
curl http://localhost:18080/api/health
curl http://localhost:8000/analytics/health
docker compose down --volumes
```

See [docs/demo-release-guide.md](docs/demo-release-guide.md) and
[docs/v0.1-release-notes.md](docs/v0.1-release-notes.md).

## Security

No real secrets, private user data, Gmail data, job-search trackers, browser
sessions, employer confidential data, production credentials, private
addresses, phone numbers, or application answers should be committed. Demo data
must be fictional.

See [SECURITY.md](SECURITY.md) and [docs/security-model.md](docs/security-model.md).

## Roadmap

The authoritative current roadmap is
[docs/portfolio-first-v0.1-roadmap.md](docs/portfolio-first-v0.1-roadmap.md).
The original 14-day plan is retained as a historical baseline in
[docs/14-day-development-plan.md](docs/14-day-development-plan.md).

## Contributing

Use an issue-first workflow. Each implementation issue should be handled on a
separate branch or worktree and merged by PR only after tests and review.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License. See [LICENSE](LICENSE).

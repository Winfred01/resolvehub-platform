# AGENTS.md

## Project Goal

ResolveHub is a technical support and issue management platform. The project is currently in planning and repository foundation.

## Workflow Boundaries

- Work on one GitHub issue at a time.
- Use a dedicated branch or worktree per issue.
- Keep changes small and scoped.
- Include tests or validation for every implementation change.
- Do not auto-merge failed code.
- Do not commit secrets.
- Do not commit job-search private data, Gmail content, browser sessions, or application answers.

## Technical Boundaries

- Frontend: React and TypeScript.
- Backend: Java and Spring Boot.
- Analytics: Python and FastAPI.
- Database: PostgreSQL.
- Infrastructure: Docker and GitHub Actions.

These are intended boundaries for future work. Planning documents are not proof that these technologies have been implemented.

## File Ownership Guidance

- Frontend workstream: `frontend/`.
- Backend workstream: `backend/`.
- Analytics workstream: `analytics-service/`.
- Database workstream: `database/`.
- Infrastructure workstream: `infrastructure/` and `.github/workflows/`.
- QA workstream: `tests/`.
- Docs workstream: `docs/` and root documentation.

Multiple workstreams should not modify the same file at the same time. If a conflict appears, stop and record the conflict before proceeding.

## Security Requirements

Never commit:

- `.env` files with real values.
- Tokens, keys, passwords, cookies, or sessions.
- Real user profiles.
- Real job-search information.
- Employer confidential data.
- Browser session files.
- Gmail content.
- Production database credentials.

Use fictional demo data only.

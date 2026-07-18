# Database

PostgreSQL is the planned ResolveHub datastore. This directory records the
database foundation and future migration workspace, but it does not create a
production database or apply schema changes yet.

## Current Foundation

- Migration tool: Flyway, integrated through Spring Boot in a future backend
  issue.
- Planned migration path: `backend/src/main/resources/db/migration/`.
- Local database target: PostgreSQL 16 or newer for local development and demo
  smoke tests.
- Schema source of truth for this stage: `docs/database-schema.md`.
- Migration strategy: `docs/database-migration-strategy.md`.

## Local Setup Expectations

The database workstream should use local-only credentials supplied by environment
variables or untracked `.env` files. Do not commit real connection strings,
passwords, dumps, browser sessions, Gmail content, or job-search data.

Future local development should set:

- `RESOLVEHUB_DB_HOST`
- `RESOLVEHUB_DB_PORT`
- `RESOLVEHUB_DB_NAME`
- `RESOLVEHUB_DB_USER`
- `RESOLVEHUB_DB_PASSWORD`

## Future Migration Smoke Command

After Flyway and PostgreSQL dependencies are added to the backend, the expected
smoke command is:

```powershell
cd backend
mvn test
```

That future test pass should verify that migrations can run against an isolated
test database or Testcontainers-backed PostgreSQL instance. This issue does not
add those dependencies or create migration SQL files.

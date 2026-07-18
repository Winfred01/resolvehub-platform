# Database Migration Strategy

ResolveHub will use PostgreSQL with Flyway migrations managed by the Spring Boot
backend. Issue #6 defines the foundation and review checklist only; it does not
create production schema state.

## Tool Choice

Flyway is the initial migration tool because it is simple, works directly with
Spring Boot, and fits the MVP need for ordered SQL migrations with clear review
history.

Liquibase remains a future option if the project needs richer change metadata,
generated rollback descriptions, or database-platform abstraction. That extra
complexity is not needed for the current MVP.

## Ownership Boundaries

- The backend owns database schema migrations because it owns persistence and
  authorization rules.
- SQL migration files should live in `backend/src/main/resources/db/migration/`.
- Database notes and schema planning remain in `database/` and `docs/`.
- Docker and CI workstreams may start PostgreSQL containers, but should not own
  application schema changes.
- Analytics should read or receive approved data through backend contracts, not
  write directly to core ticket tables.

## Naming Convention

Future Flyway files should use:

```text
V<version>__<short_description>.sql
```

Examples:

- `V1__create_identity_tables.sql`
- `V2__create_ticket_tables.sql`
- `V3__create_activity_and_audit_tables.sql`

Use lowercase descriptions with underscores. Keep each migration focused enough
to review safely.

## Environment Contract

Local and test database settings must come from environment variables or
untracked local files. Do not commit real credentials.

Expected variables:

- `RESOLVEHUB_DB_HOST`
- `RESOLVEHUB_DB_PORT`
- `RESOLVEHUB_DB_NAME`
- `RESOLVEHUB_DB_USER`
- `RESOLVEHUB_DB_PASSWORD`

Future Spring configuration should map those variables into datasource settings
with safe local defaults only where the default is non-secret.

## Initial Schema Work Items

The planned schema in `docs/database-schema.md` should become migrations in this
order:

1. Enable required PostgreSQL extensions for UUID generation if needed.
2. Create user identity and role tables.
3. Create category and ticket tables.
4. Create assignment, comment, and activity tables.
5. Create analytics suggestion storage.
6. Create session or refresh token storage with token hashes only.
7. Create audit log storage.
8. Add indexes and uniqueness constraints alongside their owning tables.

## Review Checklist

Before the first SQL migration is merged:

- Confirm each table has an owner issue and test coverage.
- Confirm destructive changes are avoided or explicitly justified.
- Confirm token, password, and session fields store hashes only.
- Confirm demo seed data is fictional and resettable.
- Confirm local migration tests do not require production services.
- Confirm secret and privacy scans pass.

## Current Non-Goals

- No production database provisioning.
- No SQL migration implementation in this issue.
- No Docker Compose PostgreSQL service in this issue.
- No seeded data implementation in this issue.
- No real user, employer, Gmail, browser-session, or job-search data.

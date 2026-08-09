# Database Schema Plan

Database: PostgreSQL. ID strategy: UUID primary keys. All core tables include `created_at` and `updated_at`. Soft delete uses `deleted_at` where user-facing records should remain auditable.

## Enums

- `role`: `REQUESTER`, `AGENT`, `TEAM_LEAD`, `ADMIN`
- `ticket_status`: `OPEN`, `TRIAGED`, `IN_PROGRESS`, `WAITING_ON_REQUESTER`, `RESOLVED`, `CLOSED`
- `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

## Tables

### users

- PK: `id uuid`
- Columns: `email`, `password_hash`, `display_name`, `active`, `created_at`, `updated_at`, `deleted_at`
- Unique: `email`
- Indexes: `email`, `active`
- Audit: role changes recorded separately

### roles

- PK: `id uuid`
- Columns: `user_id`, `role`, `created_at`
- FK: `user_id -> users.id`
- Unique: `user_id, role`
- Audit: role grants and removals logged

### tickets

- PK: `id uuid`
- Columns: `title`, `description`, `status`, `priority`, `category_id`, `requester_id`, `current_assignee_id`, `version`, `created_at`, `updated_at`, `deleted_at`
- FK: category, creator, assignee
- Indexes: `status`, `priority`, `category_id`, `current_assignee_id`, `created_at`
- Retention: soft delete only for MVP

### ticket_comments

- PK: `id uuid`
- Columns: `ticket_id`, `author_id`, `body`, `created_at`, `updated_at`, `deleted_at`
- FK: ticket and author
- Indexes: `ticket_id`, `author_id`, `created_at`

The current local H2 MVP comment slice persists `ticket_id`, `author_id`, trimmed
`body`, `created_at`, and `updated_at`, then reads comments oldest-first with
zero-based pagination. Soft delete and PostgreSQL foreign-key migration files
remain future work.

### ticket_activities

- PK: `id uuid`
- Columns: `ticket_id`, `actor_id`, `action`, `changed_fields`, `created_at`
- FK: ticket and actor
- Indexes: `ticket_id`, `created_at`
- Audit: append-only

The current local H2 MVP slice writes `TICKET_CREATED`, `TICKET_UPDATED`,
`TICKET_ASSIGNED`, and `TICKET_COMMENTED` activity rows for ticket mutations.
The read API returns rows oldest-first with zero-based pagination. The
`changed_fields` column stores safe comma-separated field names only, not
before/after values, descriptions, comment bodies, credentials, tokens,
passwords, or password hashes. PostgreSQL foreign-key migrations, normalized
assignment history, richer before/after summaries, and production retention jobs
remain future work.

The current local H2 MVP list/search slice also maps nullable
`current_assignee_id` for filtering assigned queues. No assignment mutation API
is included in the search slice.

### categories

- PK: `id uuid`
- Columns: `name`, `description`, `active`, `created_at`, `updated_at`
- Unique: `name`

The local H2 MVP currently uses a fixed in-code category catalog instead of a
runtime category table. Implemented IDs are `account-access`, `billing`,
`general`, `hardware`, `network`, `privacy`, and `workflow`. Future PostgreSQL
migrations should move this catalog into the planned categories table and keep
ticket `category_id` constrained to valid category rows.

### ticket_assignments

- PK: `id uuid`
- Columns: `ticket_id`, `assigned_to`, `assigned_by`, `created_at`, `ended_at`
- FK: ticket and users
- Indexes: `ticket_id`, `assigned_to`

The assignment slice updates `tickets.current_assignee_id` directly and records a
minimal `TICKET_ASSIGNED` row in `ticket_activities`. The planned
`ticket_assignments` table remains the future normalized history model for
PostgreSQL migrations and richer assignment lifecycle reporting.

### analytics_suggestions

- PK: `id uuid`
- Columns: `ticket_id`, `suggestion_type`, `payload`, `confidence`, `accepted`, `created_at`
- FK: ticket
- Indexes: `ticket_id`, `suggestion_type`
- Retention: keep with ticket audit trail

### sessions_or_refresh_tokens

- PK: `id uuid`
- Columns: `user_id`, `token_hash`, `expires_at`, `revoked_at`, `created_at`
- FK: user
- Indexes: `user_id`, `expires_at`
- Security: store hashes only

### audit_logs

- PK: `id uuid`
- Columns: `actor_id`, `event_type`, `entity_type`, `entity_id`, `metadata`, `created_at`
- Indexes: `actor_id`, `event_type`, `created_at`
- Retention: define before production

## Migration Tool Candidate

Flyway is the initial candidate for Spring Boot/PostgreSQL migrations. Liquibase remains an alternative if richer rollback metadata becomes necessary.

## Migration Readiness

Issue #6 selects Flyway as the initial migration approach and keeps the current
schema plan as migration-ready documentation, not applied database state. See
`docs/database-migration-strategy.md` for ownership boundaries, naming rules,
environment expectations, and the initial migration work-item order.

Future migrations should be introduced by scoped backend/database issues under
`backend/src/main/resources/db/migration/` after PostgreSQL test behavior is in
place. This stage intentionally avoids SQL migration files, production database
provisioning, and seeded data.

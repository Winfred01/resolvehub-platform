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
- Columns: `title`, `description`, `status`, `priority`, `category_id`, `created_by`, `current_assignee_id`, `created_at`, `updated_at`, `deleted_at`
- FK: category, creator, assignee
- Indexes: `status`, `priority`, `category_id`, `current_assignee_id`, `created_at`
- Retention: soft delete only for MVP

### ticket_comments

- PK: `id uuid`
- Columns: `ticket_id`, `author_id`, `body`, `created_at`, `updated_at`, `deleted_at`
- FK: ticket and author
- Indexes: `ticket_id`, `author_id`

### ticket_activities

- PK: `id uuid`
- Columns: `ticket_id`, `actor_id`, `action`, `changed_fields`, `created_at`
- FK: ticket and actor
- Indexes: `ticket_id`, `created_at`
- Audit: append-only

### categories

- PK: `id uuid`
- Columns: `name`, `description`, `active`, `created_at`, `updated_at`
- Unique: `name`

### ticket_assignments

- PK: `id uuid`
- Columns: `ticket_id`, `assigned_to`, `assigned_by`, `created_at`, `ended_at`
- FK: ticket and users
- Indexes: `ticket_id`, `assigned_to`

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

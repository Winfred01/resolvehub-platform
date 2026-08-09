# ResolveHub Backend

Spring Boot API foundation for ResolveHub.

## Scope

This scaffold includes backend startup, configuration boundaries, package ownership, a public-safe health endpoint, initial user registration, local MVP login/logout sessions, the first role-based authorization boundary, ticket create/detail APIs, ticket list/search, ticket update workflow, fixed ticket categories, the first assignment workflow slice, ticket comment creation/listing, and ticket activity-history reads. It does not implement analytics integration, production PostgreSQL connectivity, or SQL migrations.

## Package Boundaries

- `com.resolvehub.backend.auth`: registration, future login, logout, and current-user endpoints.
- `com.resolvehub.backend.tickets`: ticket creation, search, update, assignment, comments endpoint routing, and detail APIs.
- `com.resolvehub.backend.comments`: ticket comment persistence and response contracts.
- `com.resolvehub.backend.activity`: ticket activity persistence and audit-history response contracts.
- `com.resolvehub.backend.health`: scaffold health endpoint.
- `com.resolvehub.backend.config`: backend configuration properties.

## Requirements

- Java 17.
- Maven 3.9 or a compatible Maven wrapper added later.

## Commands

Run from this directory:

```bash
mvn test
mvn spring-boot:run
```

Register a local requester account:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"requester@example.test","password":"StrongPass123","displayName":"Example Requester"}'
```

Registration uses validation, BCrypt password hashing, a unique email constraint,
and an in-memory H2 database for this local MVP slice. It returns a safe user
summary without password or password hash fields. PostgreSQL migrations and
production database credentials remain out of scope.

Login with the registered account:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"requester@example.test","password":"StrongPass123"}'
```

Login returns an opaque bearer token, an expiry timestamp, and a safe user
summary. The raw token is returned only in the login response; the backend stores
only a SHA-256 token hash in the local H2 session table. Tokens expire after two
hours in this MVP slice.

Read the current user:

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <token-from-login>"
```

Logout revokes the active local session:

```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer <token-from-login>"
```

Administrators can change a user's single MVP role:

```bash
curl -X PATCH http://localhost:8080/api/users/<user-id>/role \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"AGENT"}'
```

Supported roles are `REQUESTER`, `AGENT`, `TEAM_LEAD`, and `ADMIN`. The
authorization matrix defaults unmapped protected actions to deny, returns 401
for missing or invalid bearer tokens, and returns 403 for authenticated users
without the required role. Only `ADMIN` can change roles in this MVP slice.

Update a ticket:

```bash
curl -X PATCH http://localhost:8080/api/tickets/<ticket-id> \
  -H "Authorization: Bearer <token-from-login>" \
  -H "Content-Type: application/json" \
  -d '{"status":"TRIAGED","priority":"HIGH","version":0}'
```

Requester accounts may update only their own open ticket text/category fields.
Support roles may update text fields, category, priority, and allowed workflow
status transitions. A stale supplied `version` returns 409. Ticket creation and
update mutations write minimal activity rows with field-name summaries only.

Read the fixed MVP ticket category catalog:

```bash
curl http://localhost:8080/api/ticket-categories \
  -H "Authorization: Bearer <token-from-login>"
```

Assign or unassign a ticket:

```bash
curl -X PATCH http://localhost:8080/api/tickets/<ticket-id>/assignment \
  -H "Authorization: Bearer <token-from-login>" \
  -H "Content-Type: application/json" \
  -d '{"assigneeId":"<support-user-id>","version":0}'
```

`AGENT` users can self-assign only. `TEAM_LEAD` and `ADMIN` users can assign to
active support users or clear the assignment with `"assigneeId": null`.
Assignment changes write a minimal `TICKET_ASSIGNED` activity row.

Add a ticket comment:

```bash
curl -X POST http://localhost:8080/api/tickets/<ticket-id>/comments \
  -H "Authorization: Bearer <token-from-login>" \
  -H "Content-Type: application/json" \
  -d '{"body":"Fictional follow-up context for the support team."}'
```

List ticket comments:

```bash
curl 'http://localhost:8080/api/tickets/<ticket-id>/comments?page=0&size=20' \
  -H "Authorization: Bearer <token-from-login>"
```

Comment visibility uses the same boundary as ticket detail: requesters can
comment on and read their own tickets, while support roles can comment on and
read visible tickets. Empty comments are rejected, comment bodies are capped at
4000 characters, comments are returned oldest-first, and comment mutations write
a minimal `TICKET_COMMENTED` activity row.

List ticket activity history:

```bash
curl 'http://localhost:8080/api/tickets/<ticket-id>/activities?page=0&size=20' \
  -H "Authorization: Bearer <token-from-login>"
```

Activity visibility uses the same boundary as ticket detail. Activity records
are append-only through ticket workflows in this MVP slice and cannot be created
or edited directly through the API. Responses expose `id`, `ticketId`,
`actorId`, `action`, `changedFields`, and `createdAt`; field summaries never
include comment bodies, ticket descriptions, tokens, credentials, or password
data. Activities are returned oldest-first with zero-based pagination.

After startup, verify the health endpoint:

```bash
curl http://localhost:8080/api/health
```

Expected response shape:

```json
{
  "status": "UP",
  "service": "resolvehub-backend",
  "checkedAt": "2026-07-15T00:00:00Z"
}
```

## Safety Notes

- Use fictional demo data only.
- Keep secrets in environment variables or managed deployment configuration.
- Do not log tokens, credentials, plaintext passwords, password hashes, Gmail content, browser sessions, job-search data, or private user data.

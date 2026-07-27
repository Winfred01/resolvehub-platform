# ResolveHub Backend

Spring Boot API foundation for ResolveHub.

## Scope

This scaffold includes backend startup, configuration boundaries, package ownership, a public-safe health endpoint, initial user registration, local MVP login/logout sessions, and the first role-based authorization boundary. It does not implement ticket CRUD, comments, analytics integration, production PostgreSQL connectivity, or SQL migrations.

## Package Boundaries

- `com.resolvehub.backend.auth`: registration, future login, logout, and current-user endpoints.
- `com.resolvehub.backend.tickets`: future ticket creation, search, update, and detail APIs.
- `com.resolvehub.backend.comments`: future ticket comment creation and listing APIs.
- `com.resolvehub.backend.activity`: future ticket activity and audit-history APIs.
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

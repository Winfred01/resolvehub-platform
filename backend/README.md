# ResolveHub Backend

Spring Boot API foundation for ResolveHub.

## Scope

This scaffold includes backend startup, configuration boundaries, package ownership, a public-safe health endpoint, and initial user registration. It does not implement login, ticket CRUD, comments, role authorization, analytics integration, production PostgreSQL connectivity, or SQL migrations.

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

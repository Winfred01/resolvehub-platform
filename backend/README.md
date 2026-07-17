# ResolveHub Backend

Spring Boot API foundation for ResolveHub.

## Scope

This scaffold is intentionally limited to backend startup, configuration boundaries, package ownership, and a public-safe health endpoint. It does not implement registration, login, ticket CRUD, comments, role authorization, analytics integration, or persistence.

## Package Boundaries

- `com.resolvehub.backend.auth`: future registration, login, logout, and current-user endpoints.
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
- Do not log tokens, credentials, Gmail content, browser sessions, job-search data, or private user data.

# Security Model

## Authentication

Use email/password for MVP. Passwords must be hashed with a modern adaptive password hashing algorithm through the backend framework.

## Authorization Matrix

| Action | Requester | Agent | Team Lead | Admin |
|---|---:|---:|---:|---:|
| Create own ticket | yes | yes | yes | yes |
| View own ticket | yes | yes | yes | yes |
| View all tickets | no | yes | yes | yes |
| Update ticket workflow | limited | yes | yes | yes |
| Reassign tickets | no | limited | yes | yes |
| Change roles | no | no | no | yes |
| View dashboard | no | limited | yes | yes |

## Token Or Session Handling

The MVP backend uses opaque bearer session tokens. The raw token is returned once
at login, only a SHA-256 token hash is stored server-side, and logout revokes the
active session record. Tokens must be short-lived, stored safely by clients, and
never logged. A future browser-facing release can replace this with secure
HTTP-only cookie sessions plus CSRF protection.

## CSRF And CORS

If cookie sessions are used, add CSRF protection. CORS should allow only configured frontend origins.

## Input Validation

Validate all request bodies on the backend. Validate UI inputs for user experience, but never rely only on frontend validation.

## Injection And XSS Protection

Use parameterized database access. Escape and sanitize user-generated display content. Avoid rendering raw HTML from ticket fields.

## Secure Headers

Add security headers through backend or deployment edge: content type options, frame options, referrer policy, and content security policy where practical.

## Rate Limiting

Rate limit login, registration, password reset, and analytics-heavy endpoints.

## Audit Logs

Record role changes, ticket status changes, assignments, soft deletes, login security events, and analytics suggestion acceptance.

## Secret Management

Secrets come from environment variables or managed deployment secrets. Real secrets must not be committed.

## Dependency Scanning

Future CI should scan JavaScript, Java, Python, and container dependencies.

## Docker Security

Use non-root containers where practical, minimal images, pinned versions, and no secrets baked into images.

## Database Least Privilege

Use a dedicated application database user with only required privileges.

## Demo Account Safety

Demo data must be fictional. Demo credentials should be generated or safely exposed for demo only, never reused from personal passwords.

## Data Retention

Before production use, define retention for tickets, comments, analytics suggestions, sessions, and audit logs.

## Incident Response

If a secret or private data leak is suspected, stop deployment, rotate credentials, audit history, and document the issue without copying the sensitive value.

## Threat Model

Primary MVP threats: credential stuffing, broken access control, injection, XSS, exposed secrets, over-permissive CORS, accidental real data in demo, and missing audit trails.

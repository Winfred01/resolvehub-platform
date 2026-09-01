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

The backend authorization foundation represents these role boundaries in code
through the `REQUESTER`, `AGENT`, `TEAM_LEAD`, and `ADMIN` roles. Protected
actions require a valid bearer session before role checks run. Missing or
invalid credentials return 401; authenticated users without the required role
return 403. New protected permissions default to deny until explicitly mapped.
The MVP role-change endpoint is admin-only.

The ticket update workflow keeps requester updates owner-limited: requesters can
edit only their own open ticket text/category fields and cannot change priority
or status. Support roles with ticket workflow permission can update ticket text,
category, priority, and allowed workflow status transitions. Ticket update
mutations write minimal changed-field activity rows with field-name summaries
only.

Ticket list/search uses the same visibility boundary as ticket detail:
requesters receive only tickets where they are the requester, while `AGENT`,
`TEAM_LEAD`, and `ADMIN` can list all tickets through the explicit
`VIEW_ALL_TICKETS` permission. Filters use parameterized JPA criteria and do not
expose passwords, password hashes, tokens, sessions, or activity internals in
ticket responses.

Ticket category and assignment workflow uses a fixed MVP category catalog and
validates category IDs before create, update, or search filters are applied.
Authenticated users can read the category catalog. `AGENT` users can self-assign
tickets only, while `TEAM_LEAD` and `ADMIN` can assign tickets to active support
users or clear the assignment. Requesters cannot assign tickets. Assignment
mutations write a minimal `TICKET_ASSIGNED` activity row and do not expose
passwords, password hashes, tokens, sessions, or activity internals in ticket
responses.

Ticket comments use the same visibility boundary as ticket detail: owner
requesters can read and create comments on their own tickets, and support roles
with all-ticket visibility can read and create comments on visible tickets.
Comment responses expose commenter UUIDs and timestamps only, never password,
password hash, token, or session fields. Comment creation writes a minimal
`TICKET_COMMENTED` activity row without exposing activity internals through the
comment API.

Ticket activity history uses the same visibility boundary as ticket detail:
owner requesters and support roles with all-ticket visibility can read activity
for visible tickets. Activity responses expose actor UUIDs, action names,
safe field-name summaries, and timestamps only. They do not expose ticket
descriptions, comment bodies, credentials, tokens, sessions, passwords, password
hashes, or raw before/after values. Activity rows are append-only through ticket
workflow operations in this MVP slice; there is no public create, update, or
delete activity endpoint.

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

Before production use, define retention for tickets, comments, analytics suggestions, sessions, and audit logs. MVP ticket activity rows are retained with their tickets; production retention, export, and purge policy remain future work.

## Incident Response

If a secret or private data leak is suspected, stop deployment, rotate credentials, audit history, and document the issue without copying the sensitive value.

## Threat Model

Primary MVP threats: credential stuffing, broken access control, injection, XSS, exposed secrets, over-permissive CORS, accidental real data in demo, and missing audit trails.

## Analytics-Assisted Triage Guardrails

Analytics-assisted triage must remain advisory and human-reviewed. Suggestions
must include confidence and explanation fields, be deterministic for fixtures,
and never automatically mutate category, priority, duplicate state, status,
assignment, or closure. Analytics requests and logs should use minimum necessary
safe fields and must not store or expose credentials, tokens, sessions, private
ticket bodies, comment bodies, Gmail content, browser-session data, job-search
data, private addresses, phone numbers, or real customer/employer data. Backend
and frontend flows must keep ticket work usable when analytics is unavailable or
low confidence.

Duplicate suggestions use safe normalized title, token-overlap, category, and
priority signals only. Responses expose candidate IDs, confidence, matching
signal names, and generic explanations; they do not echo ticket titles,
descriptions, comments, credentials, tokens, sessions, or raw request bodies,
and they do not log ticket content.

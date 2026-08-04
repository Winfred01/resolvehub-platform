# API Contract

Base path: `/api` for Spring Boot backend. Analytics service uses `/analytics`.

All protected endpoints require authentication. Pagination uses `page`, `size`, and `sort` where list responses may grow.

## Authentication

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `POST /api/auth/register` | Create account | Public | n/a | email, password, displayName | user summary | 400,409 | email format, password policy | duplicate email blocked |
| `POST /api/auth/login` | Start session/token | Public | n/a | email, password | token/session, user | 400,401,429 | required fields | repeated failed login rate-limited |
| `POST /api/auth/logout` | End session/token | Required | all | none | success | 401 | active credential | safe to repeat |
| `GET /api/auth/me` | Current user | Required | all | none | user summary | 401 | active credential | read-only |

Current MVP backend implementation uses opaque bearer session tokens. Login
returns the raw token once, while the backend stores only a SHA-256 token hash
with a two-hour expiry and a revocation timestamp. Logout revokes the matching
active session. Rate limiting is planned for the CI/security-test follow-up and
is not yet enforced in-process.

## Tickets

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `POST /api/tickets` | Create ticket | Required | requester, agent, lead, admin | title, description, categoryId, priority | ticket | 400,401,403 | required fields, enum values | client request id recommended |
| `GET /api/tickets` | List tickets | Required | all | filters, page, size | paged tickets | 401,403 | allowed filters | read-only |
| `GET /api/tickets/{id}` | View ticket | Required | allowed actor | id | ticket detail | 401,403,404 | UUID | read-only |
| `PATCH /api/tickets/{id}` | Update ticket | Required | agent, lead, admin, owner-limited | patch fields | ticket | 400,401,403,404,409 | allowed status transitions | version check |
| `DELETE /api/tickets/{id}` | Soft close ticket | Required | lead, admin | reason | closed ticket | 401,403,404 | reason required | safe if already closed |
| `GET /api/tickets/search` | Search tickets | Required | all | q, filters, page | paged tickets | 401,403 | query length | read-only |

Implemented ticket create/detail fields for the initial Issue #13 slice:

- Request fields: `title` (required, max 120), `description` (required, max 4000), `categoryId` (required, max 80), and `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- Response fields: `id`, `title`, `description`, `categoryId`, `priority`, `status`, `version`, `requesterId`, `createdAt`, and `updatedAt`.
- New tickets start with status `OPEN`.
- Ticket detail visibility is owner-limited for requesters and available to support roles allowed to view all tickets.
- The create timestamp is persisted in the ticket row; full audit/activity rows remain planned for Issue #18.

Implemented ticket update fields for the initial Issue #14 slice:

- `PATCH /api/tickets/{id}` accepts partial `title`, `description`, `categoryId`, `priority`, `status`, and optional `version`.
- Owner requesters may update `title`, `description`, and `categoryId` only while their ticket is `OPEN`.
- `AGENT`, `TEAM_LEAD`, and `ADMIN` may update text fields, category, priority, and workflow status.
- Valid status transitions are `OPEN -> TRIAGED|IN_PROGRESS|CLOSED`, `TRIAGED -> IN_PROGRESS|WAITING_ON_REQUESTER|CLOSED`, `IN_PROGRESS -> WAITING_ON_REQUESTER|RESOLVED|CLOSED`, `WAITING_ON_REQUESTER -> IN_PROGRESS|RESOLVED|CLOSED`, and `RESOLVED -> IN_PROGRESS|CLOSED`; `CLOSED` is terminal.
- If `version` is supplied and stale, the backend returns 409.
- Update activity rows are written with the changed field names; full activity read APIs remain planned for Issue #18.

Implemented ticket list/search fields for the initial Issue #15 slice:

- `GET /api/tickets` accepts `q`, `status`, `priority`, `categoryId`, `assigneeId`, `page`, `size`, `sort`, and `direction`.
- `q` searches ticket title and description with case-insensitive containment and a 120-character limit.
- `status` uses `OPEN`, `TRIAGED`, `IN_PROGRESS`, `WAITING_ON_REQUESTER`, `RESOLVED`, or `CLOSED`; `priority` uses `LOW`, `MEDIUM`, `HIGH`, or `URGENT`.
- `page` is zero-based, `size` defaults to 20 and is capped at 100, and empty results return an empty `content` list with paging metadata.
- Allowed sort fields are `createdAt`, `updatedAt`, `priority`, `status`, and `title`; `direction` may be `asc` or `desc`.
- Requesters receive only their own tickets. `AGENT`, `TEAM_LEAD`, and `ADMIN` can list all tickets.
- `assigneeId` filters the nullable `currentAssigneeId` field only; assignment mutation remains planned for the dedicated assignment issue.

## Comments

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `POST /api/tickets/{id}/comments` | Add comment | Required | allowed actor | body | comment | 400,401,403,404 | body length | client request id recommended |
| `GET /api/tickets/{id}/comments` | List comments | Required | allowed actor | page, size | comments | 401,403,404 | UUID | read-only |

## Activity

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `GET /api/tickets/{id}/activities` | View audit history | Required | agent, lead, admin, owner-limited | page, size | activity records | 401,403,404 | UUID | read-only |

## Users

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `GET /api/users` | List assignable users | Required | agent, lead, admin | role filter | users | 401,403 | filter enum | read-only |
| `PATCH /api/users/{id}/role` | Change role | Required | admin | role | user | 400,401,403,404 | role enum | audit logged |

Role changes use one MVP role value from `REQUESTER`, `AGENT`, `TEAM_LEAD`, or
`ADMIN`. Missing or invalid bearer credentials return 401 before authorization
checks. Authenticated non-admins receive 403 for role changes. Unknown target
users return 404 without exposing sensitive fields.

## Dashboard

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `GET /api/dashboard/summary` | Summary metrics | Required | lead, admin | date range | counts | 401,403 | date range | read-only |
| `GET /api/dashboard/trends` | Trend metrics | Required | lead, admin | date range, granularity | time series | 401,403 | granularity enum | read-only |

## Analytics

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `POST /analytics/classify` | Suggest category | Service auth | backend | title, description | category, confidence | 400,401,503 | text length | deterministic best effort |
| `POST /analytics/duplicates` | Suggest duplicates | Service auth | backend | ticket text, candidate ids | candidates | 400,401,503 | candidate cap | no mutation |
| `POST /analytics/priority` | Recommend priority | Service auth | backend | ticket fields | priority, confidence | 400,401,503 | enum values | no mutation |
| `GET /analytics/health` | Health check | Internal/public-safe | ops | none | status | 503 | n/a | read-only |

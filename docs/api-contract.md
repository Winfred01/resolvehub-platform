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
| `GET /api/ticket-categories` | List ticket categories | Required | all | none | categories | 401 | fixed MVP catalog | read-only |
| `GET /api/tickets/{id}` | View ticket | Required | allowed actor | id | ticket detail | 401,403,404 | UUID | read-only |
| `PATCH /api/tickets/{id}` | Update ticket | Required | agent, lead, admin, owner-limited | patch fields | ticket | 400,401,403,404,409 | allowed status transitions | version check |
| `PATCH /api/tickets/{id}/assignment` | Assign ticket | Required | agent self-assign, lead, admin | assigneeId, version | ticket | 400,401,403,404,409 | assignable user | version check |
| `DELETE /api/tickets/{id}` | Soft close ticket | Required | lead, admin | reason | closed ticket | 401,403,404 | reason required | safe if already closed |
| `GET /api/tickets/search` | Search tickets | Required | all | q, filters, page | paged tickets | 401,403 | query length | read-only |

Implemented ticket create/detail fields for the initial Issue #13 slice:

- Request fields: `title` (required, max 120), `description` (required, max 4000), `categoryId` (required, max 80 and present in the fixed MVP category catalog), and `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- Response fields: `id`, `title`, `description`, `categoryId`, `priority`, `status`, `version`, `requesterId`, `createdAt`, and `updatedAt`.
- New tickets start with status `OPEN`.
- Ticket detail visibility is owner-limited for requesters and available to support roles allowed to view all tickets.
- Ticket creation writes a minimal `TICKET_CREATED` activity row with field-name summaries only.

Implemented ticket update fields for the initial Issue #14 slice:

- `PATCH /api/tickets/{id}` accepts partial `title`, `description`, `categoryId`, `priority`, `status`, and optional `version`.
- Owner requesters may update `title`, `description`, and `categoryId` only while their ticket is `OPEN`.
- `AGENT`, `TEAM_LEAD`, and `ADMIN` may update text fields, category, priority, and workflow status.
- Valid status transitions are `OPEN -> TRIAGED|IN_PROGRESS|CLOSED`, `TRIAGED -> IN_PROGRESS|WAITING_ON_REQUESTER|CLOSED`, `IN_PROGRESS -> WAITING_ON_REQUESTER|RESOLVED|CLOSED`, `WAITING_ON_REQUESTER -> IN_PROGRESS|RESOLVED|CLOSED`, and `RESOLVED -> IN_PROGRESS|CLOSED`; `CLOSED` is terminal.
- If `version` is supplied and stale, the backend returns 409.
- Update activity rows are written with changed field names only; field values are not copied into audit records.

Implemented ticket list/search fields for the initial Issue #15 slice:

- `GET /api/tickets` accepts `q`, `status`, `priority`, `categoryId`, `assigneeId`, `page`, `size`, `sort`, and `direction`.
- `q` searches ticket title and description with case-insensitive containment and a 120-character limit.
- `status` uses `OPEN`, `TRIAGED`, `IN_PROGRESS`, `WAITING_ON_REQUESTER`, `RESOLVED`, or `CLOSED`; `priority` uses `LOW`, `MEDIUM`, `HIGH`, or `URGENT`.
- `page` is zero-based, `size` defaults to 20 and is capped at 100, and empty results return an empty `content` list with paging metadata.
- Allowed sort fields are `createdAt`, `updatedAt`, `priority`, `status`, and `title`; `direction` may be `asc` or `desc`.
- Requesters receive only their own tickets. `AGENT`, `TEAM_LEAD`, and `ADMIN` can list all tickets.
- `assigneeId` filters the nullable `currentAssigneeId` field.

Implemented ticket category and assignment fields for the initial Issue #16 slice:

- `GET /api/ticket-categories` returns the fixed MVP catalog for authenticated users: `account-access`, `billing`, `general`, `hardware`, `network`, `privacy`, and `workflow`.
- Ticket create/update/search category IDs must match the fixed catalog; unknown category IDs return 400.
- `PATCH /api/tickets/{id}/assignment` accepts `assigneeId` and optional `version`. `assigneeId: null` clears the current assignment.
- `AGENT` users may self-assign only. `TEAM_LEAD` and `ADMIN` may assign tickets to active support users or clear assignments.
- Assignable users must be active and have `AGENT`, `TEAM_LEAD`, or `ADMIN` role. Requesters and unknown users are rejected.
- Assignment changes update `currentAssigneeId` and write a minimal `TICKET_ASSIGNED` activity row with changed field `currentAssigneeId`.

## Comments

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `POST /api/tickets/{id}/comments` | Add comment | Required | allowed actor | body | comment | 400,401,403,404 | body length | client request id recommended |
| `GET /api/tickets/{id}/comments` | List comments | Required | allowed actor | page, size | comments | 401,403,404 | UUID | read-only |

Implemented ticket comment fields for the initial Issue #17 slice:

- `POST /api/tickets/{id}/comments` accepts `body` (required, max 4000). Leading and trailing whitespace is trimmed; blank comments return 400.
- Response fields are `id`, `ticketId`, `commenterId`, `body`, `createdAt`, and `updatedAt`.
- Comment visibility uses the same boundary as ticket detail: owner requesters and support roles with all-ticket visibility can read and create comments on the ticket.
- `GET /api/tickets/{id}/comments` accepts zero-based `page` and `size`; `size` defaults to 20 and is capped at 100.
- Comments are returned oldest-first with paged `content`, `page`, `size`, `totalElements`, `totalPages`, and `empty` metadata.
- Comment creation writes a minimal `TICKET_COMMENTED` activity row with changed field `comment`; comment body text is not copied into audit records.

## Activity

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `GET /api/tickets/{id}/activities` | View audit history | Required | agent, lead, admin, owner-limited | page, size | activity records | 401,403,404 | UUID | read-only |

Implemented activity-history fields for the initial Issue #18 slice:

- `GET /api/tickets/{id}/activities` accepts zero-based `page` and `size`; `size` defaults to 20 and is capped at 100.
- Activity visibility uses the same boundary as ticket detail: owner requesters and support roles with all-ticket visibility can read activity for the ticket.
- Response records expose `id`, `ticketId`, `actorId`, `action`, `changedFields`, and `createdAt`.
- Activities are returned oldest-first with paged `content`, `page`, `size`, `totalElements`, `totalPages`, and `empty` metadata.
- Core mutation events are `TICKET_CREATED`, `TICKET_UPDATED`, `TICKET_ASSIGNED`, and `TICKET_COMMENTED`.
- `changedFields` contains safe field names only, never ticket descriptions, comment bodies, credentials, tokens, sessions, passwords, or password hashes.
- No public create, update, or delete activity endpoint exists; activity rows are appended only by ticket workflows.

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

Implemented dashboard fields for the initial Issue #21 slice:

- `GET /api/dashboard/summary` accepts optional `from` and `to` query parameters as ISO-8601 instants.
- Summary responses expose `totalTickets`, `openTickets`, `inProgressTickets`, `resolvedTickets`, `closedTickets`, `statusDistribution`, `categoryDistribution`, and `priorityDistribution`.
- `GET /api/dashboard/trends` accepts optional `from`, `to`, and `granularity`; `granularity` defaults to `DAILY` and may be `DAILY` or `WEEKLY`.
- Trend responses expose `granularity` and ordered `buckets`; each bucket includes `bucketStart`, `createdTickets`, and `statusMovements`.
- Ticket creations are grouped from ticket `createdAt` values. Status movements are grouped from `TICKET_UPDATED` activity rows whose safe field summary includes `status`.
- Dashboard endpoints require `TEAM_LEAD` or `ADMIN` through `VIEW_DASHBOARD`; missing credentials return 401 and lower roles return 403.
- Dashboard responses expose aggregate counts only. They do not include ticket descriptions, comment bodies, requester identities, assignee identities, credentials, tokens, sessions, passwords, or password hashes.

## Analytics

| Endpoint | Purpose | Auth | Roles | Request | Response | Errors | Validation | Idempotency |
|---|---|---|---|---|---|---|---|---|
| `POST /analytics/classify` | Suggest category | Service auth | backend | title, description | category, confidence | 400,401,503 | text length | deterministic best effort |
| `POST /analytics/suggestions/duplicates` | Suggest duplicates | Service auth target / local service boundary | backend | ticket, candidates | ranked duplicate candidates | 422,503 | candidate cap, safe field types | advisory only, no mutation |
| `POST /analytics/priority` | Recommend priority | Service auth | backend | ticket fields | priority, confidence | 400,401,503 | enum values | no mutation |
| `POST /analytics/suggestions/triage` | Suggest category and priority | Service auth target / local service boundary | backend | title, description | category, priority, confidence, explanation, low_confidence, advisory | 422,503 | field types and text length | advisory only, no mutation |
| `GET /analytics/health` | Health check | Internal/public-safe | ops | none | status | 503 | n/a | read-only |

Implemented category and priority suggestion fields for the v0.2 Issue #23
slice:

- `POST /analytics/suggestions/triage` accepts optional `title` and
  `description` fields. `title` is capped at 120 characters and `description`
  is capped at 4000 characters.
- Response fields are `category`, `priority`, `confidence`, `explanation`,
  `low_confidence`, and `advisory`.
- `category` uses the fixed MVP catalog:
  `account-access`, `billing`, `general`, `hardware`, `network`, `privacy`,
  and `workflow`.
- `priority` uses `LOW`, `MEDIUM`, `HIGH`, or `URGENT`.
- Suggestions are deterministic for test fixtures and use explainable
  token/phrase-aware keyword rules rather than machine learning, substring-only
  matching, or external AI provider calls.
- Minimal or uncertain requests return safe fallback values with
  `low_confidence: true`.
- Suggestion responses are advisory, require human review, and do not mutate
  ticket category, priority, status, assignment, closure, or duplicate state.
- The analytics service does not persist private ticket content and does not
  echo submitted ticket body text in the response.

Implemented duplicate suggestion fields for the v0.2 Issue #24 slice:

- `POST /analytics/suggestions/duplicates` accepts a `ticket` object and up to
  25 `candidates`.
- `ticket` accepts optional `id`, `title`, `description`, `category`,
  `priority`, and `status` fields. Candidate `id` is required; candidate
  `title`, `description`, `category`, `priority`, and `status` are optional.
- Text limits match the local ticket contract: `title` is capped at 120
  characters, `description` at 4000 characters, and IDs at 80 characters.
- Response fields are `candidates`, `low_confidence`, and `advisory`.
- Each returned candidate contains `candidate_id`, `confidence`,
  `matching_signals`, and safe generic `explanation` entries.
- Matching uses deterministic normalized-title, safe token-overlap, category,
  and priority signals. The endpoint excludes candidates whose ID matches the
  source ticket ID and sorts ties by candidate ID for stable fixtures.
- Empty candidate lists, unrelated candidates, or uncertain matches return an
  empty or low-confidence advisory response without mutating ticket state.
- Duplicate suggestions do not close, merge, update, assign, or otherwise
  mutate tickets.
- The analytics service does not persist private ticket content, echo submitted
  ticket title or description text in the response, or log request bodies.

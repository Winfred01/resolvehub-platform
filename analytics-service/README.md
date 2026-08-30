# Analytics Service

FastAPI service for ResolveHub analytics. The service exposes a health endpoint
and a deterministic, advisory category/priority suggestion endpoint for v0.2
triage assistance.

## Local Setup

Install the service and test dependencies from this directory:

```powershell
python -m pip install -e .[test]
```

Run the smoke test:

```powershell
python -m pytest
```

Start the development server:

```powershell
python -m uvicorn resolvehub_analytics.main:app --app-dir src --reload
```

Check health:

```powershell
curl http://127.0.0.1:8000/analytics/health
```

The health response includes `status`, `service`, and `checked_at`.

Request a category and priority suggestion:

```powershell
curl -X POST http://127.0.0.1:8000/analytics/suggestions/triage `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"VPN outage for all users\",\"description\":\"Production network is down.\"}"
```

The response includes `category`, `priority`, `confidence`, `explanation`,
`low_confidence`, and `advisory`.

## Current Scope

- Implemented: `GET /analytics/health`.
- Implemented: `POST /analytics/suggestions/triage` for deterministic category
  and priority suggestions.
- Prepared: FastAPI app factory and package boundary.
- Not implemented: duplicate detection, backend integration, or ticket mutation.

All analytics test data must remain fictional and must not include real customer, employer, Gmail, browser-session, job-search, or personal data.

## v0.2 Roadmap Boundary

The v0.2 roadmap promotes analytics suggestions into `V0_2_CORE` work while
keeping this service deterministic and explainable. Issue #23 should add
category and priority suggestions with confidence, explanation, safe fallback,
and no private ticket-content storage. Issue #24 should add duplicate candidate
matching with ranked candidates, confidence, explanation, normalized safe
fields, advisory behavior, and privacy-safe logging. Do not add ML training,
external AI provider calls, automatic ticket mutation, or real private data.

Issue #23 implements category and priority suggestions with deterministic
token/phrase-aware keyword scoring. Low-confidence, minimal, unavailable, or
uncertain inputs use safe fallback values and remain advisory. The service does
not persist ticket content and the suggestion response does not echo the
submitted ticket body.

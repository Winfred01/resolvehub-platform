# Analytics Service

FastAPI service for ResolveHub analytics. The service exposes a health endpoint,
a deterministic advisory category/priority suggestion endpoint, and a
deterministic advisory duplicate suggestion endpoint for v0.2 triage
assistance.

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

Request duplicate suggestions:

```powershell
curl -X POST http://127.0.0.1:8000/analytics/suggestions/duplicates `
  -H "Content-Type: application/json" `
  -d "{\"ticket\":{\"id\":\"ticket-100\",\"title\":\"VPN outage\",\"description\":\"Agents cannot connect.\",\"category\":\"network\",\"priority\":\"URGENT\"},\"candidates\":[{\"id\":\"ticket-101\",\"title\":\"VPN outage\",\"description\":\"Support agents cannot connect to VPN.\",\"category\":\"network\",\"priority\":\"URGENT\"}]}"
```

The response includes ranked duplicate `candidates`, each with `candidate_id`,
`confidence`, `matching_signals`, and `explanation`, plus `low_confidence` and
`advisory`.

## Current Scope

- Implemented: `GET /analytics/health`.
- Implemented: `POST /analytics/suggestions/triage` for deterministic category
  and priority suggestions.
- Implemented: `POST /analytics/suggestions/duplicates` for deterministic
  duplicate candidate matching.
- Prepared: FastAPI app factory and package boundary.
- Implemented in Issue #25: backend and frontend advisory workflow integration
  with explicit review decisions and safe failure handling.
- Not implemented: automatic ticket mutation from analytics suggestions.

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
token/phrase-aware keyword scoring. Issue #24 implements duplicate suggestions
with deterministic normalized title, token-overlap, category, and priority
signals; stable confidence sorting; self-ticket exclusion; candidate caps; and
safe low-confidence/no-match responses. Low-confidence, minimal, unavailable,
or uncertain inputs use safe fallback values and remain advisory. The service
does not persist ticket content and suggestion responses do not echo submitted
ticket body text. Issue #25 connects these endpoints to the backend and
frontend ticket workflow while preserving explicit user review and audit-only
decision recording.

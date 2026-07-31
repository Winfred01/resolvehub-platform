# Analytics Service

FastAPI scaffold for ResolveHub analytics. This service currently exposes only a health endpoint and package boundaries for future category, priority, and duplicate suggestion work.

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

## Current Scope

- Implemented: `GET /analytics/health`.
- Prepared: FastAPI app factory and package boundary.
- Not implemented: category suggestion, priority recommendation, duplicate detection, backend integration, or ticket mutation.

All analytics test data must remain fictional and must not include real customer, employer, Gmail, browser-session, job-search, or personal data.

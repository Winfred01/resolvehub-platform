# Scheduled Issue #27 Demo Release Validation

- Timestamp: 2026-08-27 20:15:10 -04:00
- Run ID: scheduled-20260827-2000-issue27-demo-release-validation-001
- Automation: ResolveHub Daily MVP Development
- Roadmap mode: `PORTFOLIO_FIRST_V0_1`
- Final state: `CLOSED`
- Semantic outcome: `SUCCESS_CLOSED`

## Reconciliation

- Loaded automation memory first and preserved the privacy boundary excluding
  Canada job-search, Gmail, browser-session, resume, credential,
  private-address, phone-number, and unrelated private data.
- Checked local repository status and active worktrees.
- Fetched `origin` without force operations.
- Verified `origin/main` remains at merge commit
  `2b3a8b18a0465dbec05f546406b3798e95936ae0` from PR #51.
- Verified PR #51 is merged, Issue #26 is closed, Issue #27 is open, and no
  open PR targets `main`.
- Verified no existing PR or remote branch exists for
  `release/issue-27-v0.1-release`.

## Fixes

- Started Docker Desktop and verified the `desktop-linux` daemon became
  available.
- Fixed the local demo PostgreSQL host-port default from `5432` to `15432`,
  preserving the internal container port and `POSTGRES_PORT` override.
- Fixed the local demo backend host-port default from `8080` to `18080`,
  preserving the internal container port and `BACKEND_PORT` override.
- Fixed the backend Compose healthcheck to invoke `bash` explicitly for the
  `/dev/tcp` readiness probe.
- Updated demo, deployment, infrastructure, README, release-note, and validator
  references for the new default host ports.

## Validation

Passed:

- `node scripts/validate-demo-release.js`
- `node scripts/validate-portfolio-first-roadmap.js`
- `node scripts/validate-planning-foundation.js`
- `node scripts/validate-quality-gates.js`
- `node scripts/validate-github-metadata-state.js`
- `docker compose -f docker-compose.yml config`
- `docker compose -f docker-compose.yml up -d --build`
- `docker compose -f docker-compose.yml ps`
- `curl.exe -fsS http://localhost:5173`
- `curl.exe -fsS http://localhost:18080/api/health`
- `curl.exe -fsS http://localhost:8000/analytics/health`
- `docker compose -f docker-compose.yml exec -T postgres pg_isready -U resolvehub_local -d resolvehub`
- `git diff --check`
- Targeted high-confidence secret scan over changed files with no matches.

## Closeout

- Stopped the local demo containers with `docker compose -f docker-compose.yml down`.
- Did not delete Compose volumes after `down --volumes` was rejected by the
  automation safety policy.
- Did not mark any PR Ready for Review, approve, merge, enable auto-merge,
  close issues directly, modify labels or milestones, force-push, or touch
  credentials/private data.
- Next action: push `release/issue-27-v0.1-release` normally and let the
  repository Auto Draft PR Handoff create the Draft PR for external review.

# Portfolio-first v0.1 Roadmap

Roadmap mode: `PORTFOLIO_FIRST_V0_1`

This document is the authoritative current roadmap for ResolveHub v0.1. The
original 14-day plan is retained as historical baseline context and must not
override this dependency-aware roadmap.

## Current Roadmap Sequence

```text
#21 Dashboard APIs
-> PR / review / merge
-> #22 Dashboard UI
-> documentation/status refresh
-> scoped #26 QA/accessibility/security/E2E
-> scoped #27 Docker/demo/portfolio release
-> v0.1
```

Issue #21, Issue #22, and scoped Issue #26 are merged on `origin/main` through
PR #47, PR #48, and PR #51. The current Portfolio-first action is scoped Issue
#27 demo/release packaging before v0.1 release readiness.

## v0.1 Must-have

- Existing auth/RBAC backend.
- Existing ticket backend workflow.
- Existing ticket frontend workflow.
- Existing Kanban workflow.
- Issue #21 dashboard backend APIs, merged through PR review.
- Issue #22 dashboard frontend.
- Current-status documentation refresh.
- Scoped Issue #26 quality, accessibility, security, and E2E gates, merged
  through PR #51.
- Scoped Issue #27 Docker demo and portfolio release package.

## v0.1 Optional Stretch

- Issue #23 lightweight deterministic category/priority suggestion service.

Issue #23 may be selected before v0.1 only when automation memory or project
configuration explicitly records:

```text
ENABLE_V0_1_ANALYTICS_STRETCH = true
```

Otherwise, Issue #23 remains valid future work but does not block v0.1.

## Deferred To v0.2

- Issue #24 duplicate ticket suggestion.
- Issue #25 full analytics workflow integration.

Do not close #24 or #25 as part of v0.1 scope reduction. Preserve their
technical requirements for a later release.

## Portfolio-first v0.1 Completion Criteria

### Product

- Authentication/RBAC backend.
- Coherent ticket lifecycle.
- Ticket list/detail/create/edit.
- Search/filter.
- Assignment.
- Comments/activity.
- Kanban.
- Dashboard API.
- Dashboard UI.

### Quality

- Critical backend and frontend tests.
- Authorization regression coverage.
- Representative E2E smoke tests.
- Keyboard/accessibility validation on main demo surfaces.
- Secret/privacy validation.
- CI green for required gates.

### Demo

- Docker/local demo flow.
- Fictional and resettable demo data.
- Health checks.
- Startup documentation.
- Screenshots or visual demo artifacts where appropriate.
- Demo script.

### Documentation

- Current README.
- Current architecture.
- Implemented-vs-planned matrix.
- Release notes.
- Portfolio narrative.
- Clear statement of deferred analytics work.

Issue #24 and Issue #25 are not required for Portfolio-first v0.1 completion.

## Issue Dependency Semantics

| Issue | Portfolio-first v0.1 semantics |
|---|---|
| #21 | Completed and merged through PR #47. |
| #22 | Completed and merged through PR #48. |
| #23 | Optional stretch only; not a core v0.1 blocker. |
| #24 | Deferred to v0.2; not a v0.1 blocker. |
| #25 | Deferred to v0.2; not a v0.1 blocker. |
| #26 | Completed and merged through PR #51 for scoped v0.1 quality gates. |
| #27 | Current scoped v0.1 demo/release package after #22 and scoped #26; analytics is optional/stretch, not a release blocker. |

## Daily Automation Selection Policy

When no active workstream is present, select in this order:

1. Documentation/status refresh after #22 merge if not already complete.
2. Scoped #26.
3. Scoped #27.
4. v0.1 release readiness.

Do not select #23 before v0.1 unless `ENABLE_V0_1_ANALYTICS_STRETCH = true`.
Do not select #24 or #25 under `PORTFOLIO_FIRST_V0_1` unless the user changes
roadmap mode.

## Active Workstream Resume Policy

Before selecting any new issue, classify the existing workstream:

- Existing branch or PR for active issue: resume or reconcile it.
- Implementation complete and PR missing: enter `PR_CREATION_PENDING`.
- Authorized PR creation fails: enter `PR_CREATION_BLOCKED` or
  `BLOCKED_EXTERNAL_CLOSED`.
- PR open: read review/CI state unless changes are requested.
- PR merged: reconcile issue closure and then evaluate the next roadmap action.

Historical merged branch or worktree directories do not block new issue
selection by themselves. A branch/worktree counts as active only when it is tied
to unmerged implementation, an open PR, unresolved review requests, or another
incomplete current workstream.

## Stable External Blocker Policy

The daily automation must record a stable blocker fingerprint with:

```text
issue_number
branch
branch_head
blocker_category
blocker_reason
pr_state
```

If the same blocker fingerprint appears on a later run:

- Return `BLOCKED_EXTERNAL_CLOSED` or equivalent user-facing outcome.
- Do not rerun heavy validation.
- Do not modify code.
- Do not create a new repository run-log commit.
- Do not push a docs-only heartbeat.
- Do not create a duplicate branch.
- Do not select another issue.
- Do not use unsafe browser fallback.

Allowed actions are lightweight Git/GitHub state checks, an automation-memory
heartbeat when required, and concise status reporting.

## PR Linkage Policy

- Use `Closes #N` when the PR completes the entire linked issue.
- Use `Related to #N` only for partial work.

One-issue/one-PR implementation workstreams should not default to `Related to
#N` when the work satisfies the issue definition of done.

## Terminal Outcome Semantics

The scheduler may still require machine terminal states of `CLOSED` or
`FAILED_CLOSED`. User-facing outcomes must be more precise:

- `SUCCESS_CLOSED`: meaningful intended work completed.
- `NO_CHANGE_CLOSED`: reconciliation found no required change.
- `BLOCKED_EXTERNAL_CLOSED`: implementation is healthy but external
  integration, review, or tooling blocks progress.
- `MANUAL_ACTION_REQUIRED_CLOSED`: a specific user/admin action is required.
- `FAILED_IMPLEMENTATION_CLOSED`: product implementation failed.
- `FAILED_VALIDATION_CLOSED`: tests, security, or quality checks failed.
- `MAINTENANCE_PENDING_CLOSED`: no daily MVP work should be selected until the
  user approves the next mode.

## MVP Completion Behavior

When Portfolio-first v0.1 criteria pass, do not automatically change the daily
schedule. Record:

```text
roadmap_mode = PORTFOLIO_FIRST_V0_1
mvp_status = COMPLETE
development_selection = PAUSED
maintenance_status = PENDING_USER_APPROVAL
```

Report that weekly maintenance is recommended and wait for explicit user
approval before transitioning to maintenance, beginning v0.1.1/v0.2, or
reactivating deferred analytics work.

## Auto Draft PR Handoff Overlay

For Portfolio-first workstreams, a pushed and validated branch without a visible
PR now enters `PR_HANDOFF_PENDING` when `.github/workflows/auto-draft-pr-handoff.yml`
is enabled on `main`. The automation must wait for the GitHub Actions handoff
instead of repeatedly classifying connector `403 Resource not accessible by
integration` as a permanent manual blocker.

If the Draft PR appears, continue as `DRAFT_PR_OPEN`. If the workflow is
disabled, unavailable, or failed, classify `PR_HANDOFF_FAILED`. If repository
Actions settings prevent PR creation, classify `ONE_TIME_REPOSITORY_SETTING_REQUIRED`.

The status-refresh branch `docs/status-refresh-after-issue22` is an expected
backfill candidate after the workflow is merged. Its automated Draft PR must not
include `Closes #22` or `Closes #26`; it is documentation/governance handoff
only, and scoped #26 remains blocked until that PR lifecycle completes.

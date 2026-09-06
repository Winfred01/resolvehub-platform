# Analytics-assisted v0.2 Roadmap

Roadmap mode: `ANALYTICS_ASSISTED_V0_2`

Product theme: `EXPLAINABLE_ANALYTICS_ASSISTED_TRIAGE_V0_2`

This document defines the proposed ResolveHub v0.2 roadmap from the stable
Portfolio-first v0.1 baseline. It does not replace
`docs/portfolio-first-v0.1-roadmap.md`, which remains the authoritative record
of completed v0.1 scope.

## Current Baseline

Portfolio-first v0.1 is complete on `origin/main`. The completed baseline
includes:

- Core ticket workflow.
- Issue #21 dashboard APIs.
- Issue #22 dashboard UI.
- Scoped Issue #26 quality, accessibility, security, and E2E gates.
- Scoped Issue #27 Docker demo and portfolio release package.
- Documentation/status refresh merged through PR #53.

Issues #21, #22, #26, and #27 must not be reopened for the v0.2 roadmap. The
v0.2 plan starts from this completed baseline.

## Activation State

The user has authorized v0.2 roadmap planning. Product implementation remains
paused until the roadmap/governance PR is merged and the real scheduler
configuration has been updated.

Recommended state after that external adoption:

```text
roadmap_mode = ANALYTICS_ASSISTED_V0_2
v0_1_status = COMPLETE
v0_2_status = ACTIVE
development_selection = ENABLED
maintenance_status = SUPERSEDED_BY_V0_2_DEVELOPMENT
scheduler_sync_state = USER_UPDATE_REQUIRED until the real automation config is updated
```

Do not claim `ANALYTICS_ASSISTED_V0_2` is live in scheduled automation until the
roadmap PR has merged and the real scheduler instructions have been updated.

## Product Principles

ResolveHub v0.2 adds deterministic, explainable, advisory analytics to the
existing stable ticket workflow.

Analytics recommendations must remain:

- explainable;
- deterministic for test fixtures;
- advisory;
- human-reviewed;
- overrideable;
- privacy-safe;
- resilient to analytics-service failure.

v0.2 must not introduce:

- autonomous ticket mutation;
- automatic ticket closure;
- external AI provider calls;
- opaque ML training pipelines;
- real customer, employer, Gmail, browser-session, job-search, or personal data;
- hidden recommendation acceptance.

## Core Path

The v0.2 core path is dependency-aware and serial. Do not parallelize #23 and
#24 automatically; the daily automation still uses one active implementation
workstream at a time.

```text
#23 Category and Priority Suggestion Service
-> PR / review / merge
-> #24 Duplicate Ticket Suggestion
-> PR / review / merge
-> #25 Integrate Analytics Suggestions with Ticket Workflow
-> PR / review / merge
-> Analytics-specific v0.2 Quality / Security / E2E workstream
-> v0.2 Demo / Documentation / Release workstream
-> v0.2 COMPLETE
```

The live issue dependencies support this order: #23 depends on #5 and #13, #24
depends on #5 and #15, and #25 depends on #23, #24, #13, and #19. No repository
architecture reason was found to parallelize #23 and #24 or to put #25 before
either service capability.

## Issue Roles

| Issue | v0.2 role | Selection position | Scope boundary |
|---|---|---:|---|
| #23 Category and priority suggestion service | `V0_2_CORE` | 1 | Deterministic category and priority suggestions with confidence, explanation, safe fallback, advisory semantics, no private ticket-content storage, no ML or external AI. |
| #24 Duplicate ticket suggestion | `V0_2_CORE` | 2 | Deterministic duplicate candidate matching with ranked candidates, confidence, explanation, normalized safe fields, advisory behavior, privacy-safe logging, no automatic merge or ticket mutation. |
| #25 Analytics suggestions workflow integration | `V0_2_CORE` | 3 | Backend and frontend integration that displays suggestions, requires explicit accept/ignore/override action, handles analytics-service failures, and records safe review decisions. Merged through PR #58. |

## Follow-up Workstreams

### Analytics-specific Quality / Security / E2E

Start this only after #25 has merged. It should cover:

- analytics unit and contract tests for malformed, minimal, low-confidence, and
  no-match requests;
- backend integration tests for analytics success, timeout, malformed response,
  and service-unavailable paths;
- frontend tests for display, accept, ignore, override, loading, and failure
  states;
- E2E smoke for advisory suggestion review during ticket creation or triage;
- security tests proving suggestions do not expose credentials, tokens,
  sessions, private ticket bodies, Gmail/job-search/browser data, or raw unsafe
  log content.

### v0.2 Demo / Documentation / Release

Start this only after analytics-specific quality gates pass. It should update:

- demo script and screenshots;
- fictional seed scenarios for category, priority, and duplicate suggestions;
- release notes and README status;
- API contract examples;
- privacy and failure-mode documentation;
- Docker/local demo validation for analytics-service availability and graceful
  fallback.

## Automation Selection Policy

When the v0.2 mode is live and no active workstream exists, select work in this
order:

1. #23.
2. #24, only after #23 PR is merged or otherwise reconciled complete.
3. #25, only after #23 and #24 are merged or reconciled complete.
4. Analytics-specific v0.2 quality/security/E2E workstream.
5. v0.2 demo/documentation/release workstream.
6. Pause at v0.2 complete and wait for explicit user approval for the next mode.

For every workstream:

- verify live GitHub issue, PR, branch, CI, review, and dependency state before
  selecting work;
- keep one active implementation workstream at a time;
- use a dedicated branch or worktree;
- add relevant tests or validators;
- push normally and never force-push;
- create or update Draft PR handoff only through an authorized path;
- never mark Ready for Review, approve, merge, enable auto-merge, or close
  issues directly by automation.

## PR Linkage

Use `Closes #N` when a PR completes an entire issue. Use `Related to #N` only
for partial work. The planning/governance PR that introduces this roadmap must
not close #23, #24, or #25.

## Privacy And Failure Semantics

Analytics requests should use the minimum fields required for deterministic
suggestion logic. Stored and logged suggestion data must avoid ticket body text,
comment bodies, credentials, tokens, sessions, browser data, Gmail content,
job-search data, and real personal or customer data.

If the analytics service is unavailable, slow, or returns low-confidence output,
the existing ticket workflow must remain usable. Users must be able to proceed
without accepting a recommendation.

## Definition Of Done For v0.2

v0.2 is complete only when all of the following have merged through reviewed PRs
and validation evidence is current:

- #23 `V0_2_CORE` suggestion service.
- #24 `V0_2_CORE` duplicate suggestion service.
- #25 `V0_2_CORE` workflow integration.
- Analytics-specific quality, security, and E2E gates.
- v0.2 demo, documentation, and release package.

After v0.2 completion, scheduled development should pause again until the user
explicitly approves maintenance, v0.2.1, v0.3, or another roadmap mode.

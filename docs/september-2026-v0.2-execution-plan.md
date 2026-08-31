# September 2026 v0.2 Execution Plan

Roadmap mode: `ANALYTICS_ASSISTED_V0_2`

Planning month: `2026-09`

This document is the authoritative September 2026 execution calendar for the
existing `ResolveHub Daily MVP Development` automation. It layers a target
cadence on top of `docs/analytics-assisted-v0.2-roadmap.md`, which remains the
product and dependency authority.

This is a planning and governance artifact only. It does not begin Issue #24,
does not begin Issue #25, and does not authorize product source-code changes by
itself.

## Current Verified Baseline

Verified during plan creation:

- `origin/main`: `0b5f1aea4a2a5b7ebf124670a3f1eda5d5ad3367`.
- PR #55: merged into `main` at `2026-08-31T00:33:18Z`.
- Issue #23: closed with `state_reason: completed`.
- Issue #24: open and next eligible implementation workstream after planning
  work completes.
- Issue #25: open and gated on both #23 and #24 completion.
- Open PRs: none at reconciliation time.
- Current main CI: run `33344917084`, `success`.
- Auto Draft PR Handoff: enabled for issue branches and selected docs branches;
  this plan updates it to include September execution-plan branches.
- Scheduler: `resolvehub-daily-mvp-development`, ACTIVE, daily at 8:00 PM
  America/Toronto, roadmap mode `ANALYTICS_ASSISTED_V0_2`.

Live GitHub state and automation memory override this baseline on every future
run.

## September Objective

Monthly target: deliver ResolveHub v0.2 during September 2026 if normal human
review and merge timing permits.

Target completion: `v0_2_status = COMPLETE`, `development_selection = PAUSED`,
and `maintenance_status = PENDING_USER_APPROVAL` only after all v0.2 completion
criteria pass.

Dependency chain:

```text
#23 complete
-> #24 duplicate ticket suggestion
-> PR / review / merge
-> #25 analytics workflow integration
-> PR / review / merge
-> analytics-specific v0.2 quality/security/E2E
-> PR / review / merge
-> v0.2 demo/documentation/release
-> PR / review / merge
-> v0.2 COMPLETE
```

The September calendar is a target cadence, not a hard state machine and not
permission to bypass dependency gates.

## v0.2 Dependency Path

- #24 may start only after #23 is merged and reconciled complete.
- #25 may start only after #23 and #24 are merged and reconciled complete.
- Analytics-specific quality/security/E2E may start only after #25 is merged
  and reconciled complete.
- v0.2 release work may start only after analytics-specific quality gates pass.
- v0.2 completion may be recorded only after #23, #24, #25, quality/security/E2E,
  and release work are all merged, validated, and reconciled.

Exactly one implementation workstream may be active at a time. The automation
must not parallelize #24, #25, quality/security/E2E, or release work to catch up
with the calendar.

## Daily Execution Calendar

| Date | Day | Phase | Planned Codex action | Expected output | Dependency gate | If gate fails | Heavy validation allowed? | Repository mutation allowed? | Expected lifecycle state |
|---|---|---|---|---|---|---|---|---|---|
| 2026-09-01 | Tue | #24 | Reconcile #23 merge, inspect open PRs/worktrees, create or reuse #24 worktree, define duplicate API contract, request/response schema, candidate schema, and scoring signals. | #24 architecture and contract plan. | #23 merged and Issue #23 closed; no active PR/workstream. | Stop at reconciliation, record discrepancy or external blocker; do not start #24. | Scoped docs/contract validation only. | Yes, for #24 planning/setup docs only if gate passes. | IMPLEMENTATION_ACTIVE |
| 2026-09-02 | Wed | #24 | Implement deterministic normalization, token/phrase matching, exact/partial/category signals. | Duplicate matcher core logic. | #24 workstream active and no unresolved blocker. | Continue #24 reconciliation or requested fixes only. | Scoped analytics tests. | Yes, within #24 branch only. | IMPLEMENTATION_ACTIVE |
| 2026-09-03 | Thu | #24 | Implement confidence, ranking, low-confidence behavior, stable tie-breaks, candidate caps, and self-ticket exclusion. | Complete deterministic ranking behavior. | #24 branch active and previous logic validated. | Keep current #24 workstream; do not select #25. | Scoped analytics tests. | Yes, within #24 branch only. | IMPLEMENTATION_ACTIVE |
| 2026-09-04 | Fri | #24 | Add exact, partial, no-match, tie, empty, malformed, privacy, and token-boundary tests. | #24 test suite green locally. | #24 implementation available. | Fix only #24 defects; do not push failing code. | Scoped analytics tests and targeted scan. | Yes, tests/docs only within #24 branch. | VALIDATION_ACTIVE |
| 2026-09-05 | Sat | #24 | Update API docs, analytics README, privacy notes, and run scoped validation. | #24 implementation complete and validation-ready. | #24 tests pass. | Leave branch unpushed or update blocker; do not create PR. | Scoped validation. | Yes, docs/validation evidence within #24 branch. | VALIDATION_ACTIVE |
| 2026-09-06 | Sun | #24 PR | Commit, push normally, use Auto Draft PR Handoff, and inspect initial CI. | Draft PR for #24 with `Closes #24`. | #24 validation passes. | If PR missing, enter `PR_HANDOFF_PENDING`; no reimplementation. | Full enough for PR handoff. | Yes, commit/push only if validation passes. | PR_HANDOFF_PENDING |
| 2026-09-07 | Mon | #24 PR | Inspect #24 PR, CI, comments, reviews, and review threads; handle only verified requested changes. | READY_FOR_EXTERNAL_MERGE or actionable review fix. | #24 PR exists. | If healthy and unmerged, return `BLOCKED_EXTERNAL_CLOSED`. | Lightweight unless review changes code. | Only for verified review fixes. | READY_FOR_EXTERNAL_MERGE |
| 2026-09-08 | Tue | #25 | If #24 merged, reconcile Issue #24 closure and define #25 backend/frontend service boundary. | #25 architecture and integration contract. | #24 PR merged and Issue #24 reconciled complete. | Reconcile #24 PR only; return `BLOCKED_EXTERNAL_CLOSED` if waiting on human merge. | Scoped docs/contract validation. | Yes, only after #24 complete. | IMPLEMENTATION_ACTIVE |
| 2026-09-09 | Wed | #25 | Implement Spring Boot analytics service client with success, timeout, unavailable, and malformed-response handling. | Backend analytics client. | #25 workstream active. | Continue #25 blocker handling only. | Scoped backend tests. | Yes, within #25 branch only. | IMPLEMENTATION_ACTIVE |
| 2026-09-10 | Thu | #25 | Integrate category/priority and duplicate suggestions into backend workflow/API boundaries. | Backend advisory integration. | Analytics client behavior validated. | Fix #25 only; analytics failure must remain graceful. | Scoped backend/contract tests. | Yes, within #25 branch only. | IMPLEMENTATION_ACTIVE |
| 2026-09-11 | Fri | #25 | Add frontend suggestion display for category, priority, duplicates, confidence, and explanation. | Suggestion UI display states. | Backend/API contract stable enough for UI. | Keep #25 active; do not change advisory semantics. | Scoped frontend tests. | Yes, within #25 branch only. | IMPLEMENTATION_ACTIVE |
| 2026-09-12 | Sat | #25 | Implement accept, ignore, and override interactions requiring explicit user action. | Human-review interaction workflow. | Suggestion UI displays safely. | No hidden acceptance; fix #25 only. | Scoped frontend tests. | Yes, within #25 branch only. | IMPLEMENTATION_ACTIVE |
| 2026-09-13 | Sun | #25 | Implement safe suggestion-review audit history with no raw ticket body storage. | Safe audit behavior. | Backend/frontend review actions defined. | Privacy issue blocks push until fixed. | Scoped backend/privacy tests. | Yes, within #25 branch only. | IMPLEMENTATION_ACTIVE |
| 2026-09-14 | Mon | #25 | Add backend integration tests, frontend interaction tests, and service failure tests. | Integration test suite green. | #25 feature paths implemented. | Continue current workstream; do not release early. | Scoped backend/frontend tests. | Yes, tests/docs within #25 branch. | VALIDATION_ACTIVE |
| 2026-09-15 | Tue | #25 | Add E2E smoke for suggestion display, accept/ignore/override, and analytics-unavailable fallback. | #25 E2E green. | Local backend/frontend/analytics path testable. | Keep #25 active; classify real failures precisely. | Scoped to broad #25 path. | Yes, tests/docs within #25 branch. | VALIDATION_ACTIVE |
| 2026-09-16 | Wed | #25 PR | Update docs, run full scoped validation, commit, push, and use Auto Draft PR Handoff. | Draft PR for #25 with `Closes #25`. | #25 validation passes. | If PR missing, enter `PR_HANDOFF_PENDING`; no QA start. | Full enough for #25 handoff. | Yes, commit/push only if validation passes. | PR_HANDOFF_PENDING |
| 2026-09-17 | Thu | #25 PR | Inspect #25 PR CI/reviews/comments/threads; handle only verified review requests. | READY_FOR_EXTERNAL_MERGE or requested changes completed. | #25 PR exists. | If healthy and unmerged, return `BLOCKED_EXTERNAL_CLOSED`; do not start QA. | Lightweight unless review changes code. | Only for verified review fixes. | READY_FOR_EXTERNAL_MERGE |
| 2026-09-18 | Fri | v0.2 QA | If #25 merged, perform analytics quality gap analysis and create quality matrix. | QA scope and test matrix. | #25 PR merged and Issue #25 reconciled complete. | Stop at #25 reconciliation; no QA branch. | Scoped docs/quality planning validation. | Yes, only after #25 complete. | VALIDATION_ACTIVE |
| 2026-09-19 | Sat | v0.2 QA | Add analytics robustness tests for minimal, malformed, low-confidence, no-match, candidate-limit, and deterministic cases. | Analytics robustness tests. | QA workstream active. | Keep QA active; no release work. | Scoped analytics tests. | Yes, within QA branch only. | VALIDATION_ACTIVE |
| 2026-09-20 | Sun | v0.2 QA | Add backend resilience gates for timeout, 503, malformed response, latency, and fallback behavior. | Backend failure-mode gates. | QA workstream active. | Ticket workflow must remain usable; fix QA findings. | Scoped backend tests. | Yes, within QA branch only. | VALIDATION_ACTIVE |
| 2026-09-21 | Mon | v0.2 QA | Add frontend loading/error/fallback tests and accessibility checks. | UI quality gates. | QA workstream active. | Keep business scope unchanged; fix quality defects. | Scoped frontend/a11y tests. | Yes, within QA branch only. | VALIDATION_ACTIVE |
| 2026-09-22 | Tue | v0.2 QA | Add E2E advisory review coverage for category/priority and duplicate suggestions with explicit user action. | Analytics E2E suite. | QA workstream active and fictional data available. | Do not use real/private data; fix only QA defects. | Scoped-to-full E2E as needed. | Yes, within QA branch only. | VALIDATION_ACTIVE |
| 2026-09-23 | Wed | v0.2 QA | Run security/privacy/logging checks for tokens, ticket bodies, comments, sessions, and secret-like strings. | Security/privacy gates. | QA workstream active. | Any unsafe logging or leakage is a blocker. | Scoped security/privacy plus targeted scans. | Yes, within QA branch only. | VALIDATION_ACTIVE |
| 2026-09-24 | Thu | v0.2 QA PR | Run full quality handoff validation, update docs, commit, push, and use Auto Draft PR Handoff. | QA Draft PR. | QA gates pass. | If PR missing, enter `PR_HANDOFF_PENDING`; release remains blocked. | Full enough for QA handoff. | Yes, commit/push only if validation passes. | PR_HANDOFF_PENDING |
| 2026-09-25 | Fri | v0.2 Release | If QA PR merged, create release workstream and prepare fictional analytics demo scenarios and seed/reset plan. | Release/demo seed package. | QA PR merged and reconciled complete. | Reconcile QA PR only; return `BLOCKED_EXTERNAL_CLOSED` if waiting on merge. | Scoped release planning validation. | Yes, only after QA complete. | RELEASE_RECONCILIATION |
| 2026-09-26 | Sat | v0.2 Release | Validate Docker/local demo for analytics healthy path and unavailable graceful-fallback path. | Runtime demo evidence. | Release workstream active and local runtime available. | Docker daemon/environment issues become external/manual blockers. | Full runtime validation allowed. | Yes, release evidence/docs only. | RELEASE_RECONCILIATION |
| 2026-09-27 | Sun | v0.2 Release | Prepare demo script, API examples, screenshots checklist or real screenshot artifacts, and interview narrative. | Portfolio demo package. | Release workstream active. | Do not fabricate screenshots or evidence. | Scoped docs/demo validation. | Yes, release docs/assets only. | RELEASE_RECONCILIATION |
| 2026-09-28 | Mon | v0.2 Release | Update README, ARCHITECTURE, release notes, privacy/failure docs, implemented-vs-planned matrix, and portfolio narrative. | v0.2 docs complete. | Release workstream active and evidence current. | Do not describe future work as implemented. | Scoped-to-full docs/release validation. | Yes, release docs only. | RELEASE_RECONCILIATION |
| 2026-09-29 | Tue | v0.2 Release PR | Run full release validation, commit, push, and use Auto Draft PR Handoff. | v0.2 release Draft PR. | Release validation passes. | If PR missing, enter `PR_HANDOFF_PENDING`; v0.2 incomplete. | Full release validation. | Yes, commit/push only if validation passes. | PR_HANDOFF_PENDING |
| 2026-09-30 | Wed | Closeout | Reconcile release PR; if merged, verify v0.2 Definition of Done and update final state. | `v0_2_status = COMPLETE` or precise blocker. | Release PR merged and all v0.2 criteria pass. | Keep v0.2 ACTIVE; do not start v0.2.1/v0.3. | Full final verification only if all merges are complete. | Only final docs/memory state if gates pass. | V0_2_COMPLETE |

## Delay And Slippage Policy

The September plan must slide forward when human review, merge timing, CI,
verified review feedback, or real validation defects delay a workstream.

Never compensate for delay by:

- starting the next issue early;
- parallelizing workstreams;
- skipping required QA;
- weakening validation;
- marking a PR Ready automatically;
- merging automatically;
- ignoring unresolved review comments.

Calendar variance is acceptable. Dependency violations are not.

When a healthy Draft PR exists and no requested change exists, the daily
automation should perform lightweight reconciliation and close the run with
`BLOCKED_EXTERNAL_CLOSED`. It must not create heartbeat commits, rerun unrelated
heavy validation, or select the next issue.

## Early Completion Policy

If a workstream completes earlier than planned, the automation should not idle
until the nominal next calendar date. At the next scheduled 8:00 PM run:

1. Reconcile live GitHub and automation memory.
2. Verify dependency completion.
3. Confirm no active workstream remains.
4. Select the next eligible workstream in the v0.2 dependency path.

Early advancement is allowed only through dependency completion, not calendar
expectation.

## Human PR Gate Policy

When a healthy Draft PR exists, Codex may:

- inspect CI/check results;
- inspect comments, reviews, and review threads;
- implement verified requested changes;
- update validation evidence after material changes.

Codex must not:

- mark Ready for Review;
- approve;
- merge;
- enable auto-merge;
- close issues directly;
- create duplicate PRs.

If no requested change exists, return `BLOCKED_EXTERNAL_CLOSED` and stop.

## Validation Budget

LIGHTWEIGHT validation:

- fetch/reconcile;
- PR state;
- CI state;
- comments/reviews/review threads;
- git status;
- exact head SHA checks.

SCOPED validation:

- affected service tests;
- affected validators;
- `git diff --check`;
- targeted high-confidence secret/privacy scan.

FULL validation:

- frontend;
- backend;
- analytics;
- E2E;
- Docker config;
- planning/governance;
- privacy/security;
- release validators.

Avoid running FULL validation every day. Full validation normally belongs before
implementation PR push, after material review-requested code changes, before
quality/release handoff, and during final v0.2 completion verification.

## Monthly Outcome Semantics

Use exactly one monthly outcome at September closeout:

- `SEPTEMBER_V0_2_COMPLETE`: all v0.2 completion criteria pass.
- `SEPTEMBER_IN_PROGRESS_HEALTHY`: legitimate work remains active or awaiting
  review, with no implementation failure.
- `SEPTEMBER_EXTERNAL_BLOCKER`: external platform or user action prevents
  planned progression.
- `SEPTEMBER_VALIDATION_BLOCKER`: unresolved real validation, security, or
  privacy failure exists.

Do not classify schedule slippage as an implementation failure by itself.

## v0.2 Completion Rule

September does not succeed merely because #24 and #25 are merged.

v0.2 is complete only when:

- #23 is merged and completed;
- #24 is merged and completed;
- #25 is merged and completed;
- analytics-specific quality/security/E2E is merged and completed;
- v0.2 demo/documentation/release is merged and completed;
- current CI evidence is healthy;
- privacy/security evidence is current;
- docs reflect actual implementation;
- no required v0.2 workstream remains open.

Then record:

```text
roadmap_mode = ANALYTICS_ASSISTED_V0_2
v0_2_status = COMPLETE
development_selection = PAUSED
maintenance_status = PENDING_USER_APPROVAL
```

Do not automatically start v0.2.1, v0.3, AI/ML expansion, new issues, or
maintenance implementation. Wait for explicit user approval.

## Safety Constraints

- Do not start #24 implementation from this planning workstream.
- Do not start #25 from this planning workstream.
- Do not reopen or reimplement #21, #22, #26, or #27.
- Do not mark PRs Ready automatically.
- Do not approve PRs.
- Do not merge PRs.
- Do not enable auto-merge.
- Do not force push.
- Do not modify credentials, tokens, GitHub permissions, cookies, browser
  sessions, or authentication configuration.
- Do not access or commit job-search, Gmail, resume, browser-session, private
  address, phone number, real customer, employer, or unrelated private data.
- Do not use external AI APIs unless explicitly approved in a future roadmap.

## Metadata Drift

Live issue metadata still contains v0.1-era descriptions for v0.2 work:

- Issues #24 and #25 use milestone `v0.1 Analytics and Dashboard`, whose
  description still frames analytics as v0.1.
- Issues #24 and #25 use `priority:p1`, whose label description says
  `Core MVP work required for v0.1`.
- Issue #23 is closed/completed but still carries the same v0.1-era milestone
  and `priority:p1` description.

This plan documents the drift only. It does not mutate labels or milestones.
Recommended cleanup, if separately authorized: rename or supersede the analytics
milestone/label descriptions to reflect `ANALYTICS_ASSISTED_V0_2` without
changing issue implementation state.

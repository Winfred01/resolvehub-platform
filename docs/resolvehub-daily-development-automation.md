# ResolveHub Daily Development Automation

## Identity

- Automation name: `ResolveHub Daily MVP Development`
- Automation ID: `resolvehub-daily-mvp-development`
- Schedule: Every day at 8:00 PM
- Timezone: America/Toronto
- Memory location: `$CODEX_HOME/automations/resolvehub-daily-mvp-development/memory.md`
- Status: ACTIVE
- Roadmap mode: `PORTFOLIO_FIRST_V0_1`
- Auto merge: disabled

## Authoritative Scope

The current roadmap source is
[portfolio-first-v0.1-roadmap.md](portfolio-first-v0.1-roadmap.md). The original
14-day plan is historical baseline context and must not override
Portfolio-first selection.

The core v0.1 sequence is:

```text
#21 Dashboard APIs
-> PR / review / merge
-> #22 Dashboard UI
-> documentation/status refresh
-> scoped #26 QA/accessibility/security/E2E
-> scoped #27 Docker/demo/portfolio release
-> v0.1
```

Analytics scope:

- `#23`: optional stretch goal for v0.1 only when
  `ENABLE_V0_1_ANALYTICS_STRETCH = true`.
- `#24`: deferred to v0.2.
- `#25`: deferred to v0.2.

## Bootstrap Review Gate

Historical bootstrap values were:

```text
bootstrap_review_required = true
allow_new_issue_selection = false
allow_auto_merge = false
```

Bootstrap has completed and current values are:

```text
bootstrap_review_required = false
allow_new_issue_selection = true
allow_auto_merge = false
```

Prompt 9-R1 and 9-R2 bootstrap transitions remain historical context only. Do
not reactivate the bootstrap gate unless the user explicitly changes it.

## Pre-run Requirements

Every scheduled run must:

1. Read automation memory first.
2. Check local repository status.
3. Fetch origin without force operations.
4. Read current GitHub issue, PR, branch, and dependency state.
5. Read project governance docs relevant to the active workstream.
6. Preserve the privacy boundary: no Canada job-search automation, trackers,
   Gmail data, application answers, resume data, browser sessions, cookies,
   credentials, private addresses, phone numbers, or unrelated private data.

## Workstream Classification

The daily automation starts with:

```text
CREATED
-> MEMORY_LOADED
-> REPOSITORY_CHECKED
-> GITHUB_STATE_READ
-> WORKSTREAM_CLASSIFIED
```

After classification:

### Case A: Existing implementation workstream

If a branch or PR exists for the active issue, resume or reconcile that
workstream. Do not select a new issue.

### Case B: Implementation complete, PR missing

Enter `PR_HANDOFF_PENDING` after a validated branch is pushed. The repository
Auto Draft PR Handoff workflow is the primary PR creation path. If the workflow
creates a Draft PR, enter `DRAFT_PR_OPEN` on the next reconciliation. If the
workflow is disabled, unavailable, or failed and no other authorized PR creation
path exists, enter `PR_HANDOFF_FAILED`.

The older `PR_CREATION_PENDING` and `PR_CREATION_BLOCKED` terms remain historical
aliases for pre-handoff runs. A GitHub connector `403 Resource not accessible by
integration` is no longer enough by itself to declare a permanent manual handoff
blocker when Auto Draft PR Handoff is enabled on `main`.

### Case C: PR open

Enter `REVIEW_PENDING` or `CI_PENDING`. Read status only unless review requests
code changes.

### Case D: PR merged

Reconcile issue closure and mark the workstream complete. Then and only then
evaluate the next Portfolio-first roadmap action.

### Case E: No active workstream

Select the next eligible task according to:

1. Portfolio-first roadmap order.
2. Dependency completion.
3. Priority.
4. Worktree/file ownership conflicts.

## Portfolio-first Issue Selection

After #21 completes, select according to this order:

1. #22.
2. Documentation/status refresh if not already complete.
3. Scoped #26.
4. Scoped #27.
5. v0.1 release readiness.

Do not select #23 before v0.1 unless memory or configuration explicitly says:

```text
ENABLE_V0_1_ANALYTICS_STRETCH = true
```

Do not select #24 or #25 under `PORTFOLIO_FIRST_V0_1` unless the user later
changes roadmap mode.

## Dependency Gate

The automation must verify dependencies from live GitHub issue bodies and
current planning docs. It must not rely on issue number order or the historical
14-day sequence.

#25 is not a hard dependency for Portfolio-first #26 or #27. Analytics-specific
quality/release coverage can be added when #23/#24/#25 are implemented later.

## Branch And Worktree Strategy

- One active implementation issue maps to one branch or worktree.
- Use a dedicated branch/worktree for real changes.
- Do not reuse another active issue's worktree.
- Historical merged branches or worktree directories do not block new issue
  selection by themselves.
- A branch/worktree counts as active only if it is associated with unmerged
  implementation, an open PR, unresolved review/change requests, or another
  incomplete current workstream.
- Stop and record a blocker if real file ownership conflicts appear.

## Stable External Blocker Policy

Record a stable blocker fingerprint with:

```text
issue_number
branch
branch_head
blocker_category
blocker_reason
pr_state
```

If the fingerprint is unchanged from the previous run, close with
`BLOCKED_EXTERNAL_CLOSED` or equivalent. In that state, do not:

- rerun full tests;
- modify code;
- create a new repository run-log commit;
- push a docs-only heartbeat;
- create a duplicate branch;
- select another issue;
- repeatedly retry unsafe browser submission.

Allowed actions are lightweight live Git/GitHub checks, automation memory
heartbeat when required, and concise user-facing status.

## Run-log Policy

Repository run logs are written only for meaningful state transitions:

- issue selected;
- implementation started;
- implementation completed;
- validation materially changed;
- branch first pushed;
- Draft PR created;
- CI failure discovered;
- review changes requested;
- PR merged;
- issue closed;
- blocker changed;
- blocker resolved;
- roadmap/governance materially changed.

Do not create a run-log or commit for an unchanged blocker heartbeat.

## Validation Tiers

### Tier 1: Read-only reconciliation

For unchanged external blockers, run live Git/PR state checks only. Do not run
full test suites.

### Tier 2: Documentation and governance changes

Run:

- planning validator;
- portfolio roadmap validator;
- relevant automation/state-machine tests;
- GitHub metadata/privacy validator;
- `git diff --check`;
- targeted secret scan.

### Tier 3: Scoped implementation

Run tests relevant to the changed workstream.

### Tier 4: Release candidate

Run full required v0.1 validation: backend, frontend, included analytics
components, security, accessibility, E2E, Docker, CI/release checks, and secret
scans.

## PR Strategy

- Create or update a Draft PR for branches that contain real changes.
- Do not mark Draft PRs ready for review automatically.
- Do not merge PRs automatically.
- Do not approve your own PR.
- Do not enable auto-merge.
- Use explicit evidence comments or PR body evidence for validation results.

## PR Linkage Policy

- Use `Closes #N` when the PR completes the entire linked issue.
- Use `Related to #N` only for partial work.

Do not use `Related to #N` by default for one-issue/one-PR implementation
workstreams that satisfy the issue definition of done.

## Merge Strategy

`allow_auto_merge = false`. Even when lint, tests, build, and security checks
pass, the automation may only push a branch, create or update a Draft PR, and
report readiness. Human review remains required.

## Terminal State Semantics

The scheduler may still require every run to end with machine state `CLOSED` or
`FAILED_CLOSED`. User-facing outcome semantics must be recorded separately:

- `SUCCESS_CLOSED`: meaningful intended work completed.
- `NO_CHANGE_CLOSED`: reconciliation found no required change.
- `BLOCKED_EXTERNAL_CLOSED`: implementation is healthy but an external
  integration, review, or tool blocks progress.
- `MANUAL_ACTION_REQUIRED_CLOSED`: a specific user/admin action is required.
- `FAILED_IMPLEMENTATION_CLOSED`: product implementation failed.
- `FAILED_VALIDATION_CLOSED`: tests, security, or quality checks failed.
- `MAINTENANCE_PENDING_CLOSED`: no more daily MVP implementation work should be
  selected until the user approves the next mode.

## Automation Memory Schema

Memory should record at least:

```text
roadmap_mode
active_workstream
active_issue
active_branch
active_pr
implementation_state
validation_state
pr_state
review_state
merge_state
issue_close_state
blocker_category
blocker_fingerprint
last_meaningful_transition
next_action
v0_1_scope
deferred_scope
stretch_scope
```

Do not store secrets or unrelated private data.

## MVP Completion Transition

When all Portfolio-first v0.1 criteria pass, do not automatically change the
schedule. Set memory equivalent to:

```text
roadmap_mode = PORTFOLIO_FIRST_V0_1
mvp_status = COMPLETE
development_selection = PAUSED
maintenance_status = PENDING_USER_APPROVAL
```

Report that weekly maintenance is recommended. Do not select #23/#24/#25 simply
because daily execution still exists. Wait for explicit user approval before
transitioning to maintenance, beginning v0.1.1/v0.2, or reactivating deferred
analytics work.

## Disable Method

Pause or disable this automation through the Codex automation controls for
`resolvehub-daily-mvp-development`. Do not delete unrelated automations and do
not modify Canada job-search automations.

## Auto Draft PR Handoff

After a validated implementation or documentation branch is pushed, the
repository Auto Draft PR Handoff workflow is the primary PR creation path:

```text
branch pushed
-> PR_HANDOFF_PENDING
-> GitHub Actions creates Draft PR
-> DRAFT_PR_OPEN
```

The workflow is `.github/workflows/auto-draft-pr-handoff.yml`. It runs on pushes
to eligible branches, manual `workflow_dispatch`, and an hourly fallback scan at
`17 * * * *` so branches that existed before the workflow was merged can be
backfilled without heartbeat commits.

Eligible branches are:

- issue workstream branches containing `/issue-<number>-`, such as
  `backend/issue-21-dashboard-apis`, `frontend/issue-22-dashboard-ui`,
  `qa/issue-26-quality-gates`, and `release/issue-27-v0.1-release`;
- documentation status-refresh branches matching `docs/status-refresh-*`.

The workflow skips:

- `main` and `master`;
- branches already contained in `main`;
- branches that already have an open or closed PR targeting `main` for the exact
  head branch.

During `PR_HANDOFF_PENDING`:

- implementation remains complete;
- validation remains valid;
- do not reimplement;
- do not create a new implementation branch;
- do not create a heartbeat commit merely to retrigger the workflow;
- do not select the next issue;
- do not rerun heavy validation solely because the PR is not visible yet.

Classify `PR_HANDOFF_FAILED` only when the GitHub Actions workflow itself is
disabled, unavailable, or has failed and there is no other authorized PR creation
path. If repository-level Actions permissions prevent PR creation, classify
`ONE_TIME_REPOSITORY_SETTING_REQUIRED` and give only this setup path:

```text
Repository -> Settings -> Actions -> General -> Workflow permissions -> enable "Allow GitHub Actions to create and approve pull requests"
```

The workflow still only creates Draft PRs. It must not mark PRs Ready for Review,
approve PRs, merge PRs, enable auto-merge, force-push, close issues directly,
modify labels or milestones, request PATs, read credentials, read browser state,
or access Canada job-search, Gmail, resume, browser-session, or unrelated private
data.

### GitHub Connector Fallback Semantics

If connector PR creation fails with `403 Resource not accessible by integration`:

1. Check whether Auto Draft PR Handoff is enabled on `main`.
2. Check whether a relevant workflow run exists or is expected.
3. Enter `PR_HANDOFF_PENDING`.
4. Stop repository mutation for that run.
5. Reconcile on the next scheduled run.

If the Draft PR appears, enter `DRAFT_PR_OPEN`. If the Actions workflow itself
fails, enter `PR_HANDOFF_FAILED`. If the repository setting prevents GitHub
Actions PR creation, enter `ONE_TIME_REPOSITORY_SETTING_REQUIRED`. Do not treat
an expected asynchronous handoff as a stable external blocker.

### Scheduler Prompt Sync Block

Repo governance has been updated here, but the real Codex scheduler
configuration is not proven to be repository-sourced. Until the scheduler source
is verified, classify scheduler synchronization as `USER_UPDATE_REQUIRED`.

Paste this block once into the real `ResolveHub Daily MVP Development`
automation instructions:

```text
Automatic Draft PR handoff:
After an eligible validated branch is pushed, use repository Auto Draft PR
Handoff as the primary PR creation path. The workflow is
.github/workflows/auto-draft-pr-handoff.yml and runs on eligible branch pushes,
workflow_dispatch, and hourly fallback scan at 17 * * * *.

Eligible branches: branches containing /issue-<number>- and docs/status-refresh-*.
Skip main, master, branches already contained in main, and branches that already
have any open or closed PR targeting main for the exact head branch.

Lifecycle:
branch pushed -> PR_HANDOFF_PENDING -> GitHub Actions creates Draft PR ->
DRAFT_PR_OPEN.

During PR_HANDOFF_PENDING: implementation remains complete, validation remains
valid, no reimplementation, no new implementation branch, no heartbeat commit,
no next Issue selection, and no heavy validation rerun solely because the PR is
not visible yet.

Connector 403 no longer means permanent manual handoff when Auto Draft PR
Handoff is enabled. If connector PR creation returns 403, check whether the
auto-handoff workflow is enabled on main and whether a relevant workflow run is
expected, then enter PR_HANDOFF_PENDING and reconcile on the next scheduled run.

Classify PR_HANDOFF_FAILED only when the GitHub Actions workflow is disabled,
unavailable, or failed and there is no other authorized PR creation path. If the
repository setting prevents GitHub Actions PR creation, classify
ONE_TIME_REPOSITORY_SETTING_REQUIRED and give this setup path:
Repository -> Settings -> Actions -> General -> Workflow permissions -> enable
"Allow GitHub Actions to create and approve pull requests".

The workflow may only create Draft PRs. It must never mark Ready for Review,
approve, merge, enable auto-merge, force-push, close issues outside merged PR
lifecycle, modify credentials, use PATs, read browser cookies/sessions, or touch
private/job-search/Gmail/resume/browser-session data.
```

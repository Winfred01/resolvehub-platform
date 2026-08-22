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

Enter `PR_CREATION_PENDING`. If authorized PR creation fails, enter
`PR_CREATION_BLOCKED` and report `BLOCKED_EXTERNAL_CLOSED` or
`MANUAL_ACTION_REQUIRED_CLOSED` as appropriate. Do not reimplement the issue and
do not select another issue.

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

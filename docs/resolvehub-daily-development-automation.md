# ResolveHub Daily Development Automation

## Identity

- Automation name: `ResolveHub Daily MVP Development`
- Automation ID: `resolvehub-daily-mvp-development`
- Schedule: Every day at 8:00 PM
- Timezone: America/Toronto
- Memory location: `$CODEX_HOME/automations/resolvehub-daily-mvp-development/memory.md`
- Initial status: ACTIVE

## Bootstrap Review Gate

Initial gate values:

```text
bootstrap_review_required = true
allow_new_issue_selection = false
allow_auto_merge = false
```

While the bootstrap review gate is active, scheduled runs may only inspect the bootstrap state, Issue #2, current branch/PR status, validation results, and close out. They must not select Issue #3 or any other new issue, create business scaffolds, or bypass the gate.

Only a later explicit Prompt 8B-2 may set:

```text
bootstrap_review_required = false
allow_new_issue_selection = true
```

## Issue Selection Order

After the bootstrap gate is lifted, the automation selects one issue at a time:

1. Exclude issues with an active open PR.
2. Exclude issues whose dependencies are not complete.
3. Exclude issues labeled `status:blocked`.
4. Sort by `priority:p0`, then `priority:p1`, then `priority:p2`.
5. For equal priority, follow dependency order from `docs/github-issue-map.md`.
6. Check active worktrees and avoid file ownership conflicts.

## Dependency Gate

The automation must verify dependencies from the GitHub issue body and `docs/github-issue-map.md` before selecting work. It must not start a dependent issue while its prerequisite issue is still open or awaiting merge unless a later prompt explicitly changes the dependency policy.

## Branch And Worktree Strategy

- One issue maps to one branch or worktree.
- Use a dedicated branch/worktree only when actual file changes are needed.
- Base issue branches on the current planning branch or the appropriate parent branch, not stale `main`.
- Do not reuse another issue's worktree.
- Stop and record a blocker if worktree ownership conflicts appear.

## Test Gates

Every run must execute the validation that applies to the selected issue. During bootstrap, the required validation is:

```powershell
node scripts/validate-planning-foundation.js
node scripts/validate-github-metadata-state.js
git diff --check
```

Application build claims are not allowed until the corresponding scaffold exists. Correct bootstrap build states are:

```text
Frontend build: Not applicable - scaffold not created
Backend build: Not applicable - scaffold not created
Analytics build: Not applicable - scaffold not created
```

## Security Gates

Every run must scan for secrets and private data before commit or GitHub update. The automation must not commit tokens, cookies, sessions, Gmail content, job-search data, browser data, private addresses, phone numbers, application answers, or real credentials.

## PR Strategy

- Create or update a Draft PR for issue branches that contain real changes.
- Do not mark Draft PRs ready for review automatically.
- Do not merge PRs automatically.
- Use explicit evidence comments for validation results.

## Merge Strategy

`allow_auto_merge = false`. Even when lint, tests, build, and security checks pass, the automation may only push a branch, create or update a Draft PR, and report readiness. Human review remains required.

## Close-Out Rules

Each run must end as `CLOSED` or `FAILED_CLOSED`. It must not remain in waiting states such as waiting for review, waiting for GitHub, waiting for dependency, waiting for user, or retrying indefinitely.

## Manual Run

Manual bootstrap validation run:

```text
run_id = prompt8b-bootstrap-001
trigger_type = manual_bootstrap_validation
```

Future scheduled runs must use new run IDs and must not represent manual bootstrap validation as a scheduled success.

## Disable Method

Pause or disable this automation through the Codex automation controls for `resolvehub-daily-mvp-development`. Do not delete unrelated automations and do not modify Canada job-search automations.

## MVP Completion Transition

When all v0.1 issues are complete and release criteria pass, the automation should stop selecting daily MVP work and record a maintenance-pending state. It must not change its schedule by itself. It should report that weekly maintenance is recommended and wait for explicit user approval.

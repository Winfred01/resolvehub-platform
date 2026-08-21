# Manual GitHub Issue Updates

Status: `MANUAL_GITHUB_ISSUE_UPDATE_REQUIRED`

The GitHub connector returned `403 Resource not accessible by integration` when
attempting to update Issue #23. To avoid repeated write attempts with the same
permission blocker, Issues #24-#27 were not mutated by automation. Apply the
following issue-body changes manually or with an authorized GitHub account.

Do not change titles, labels, milestones, assignees, issue state, unrelated
acceptance criteria, or issue closure state as part of these updates.

## Issue #23

Add after `## Summary`:

```markdown
## Roadmap status
- Portfolio-first v0.1 scope: OPTIONAL_STRETCH_GOAL.
- This issue is valid v0.2 work if not selected before v0.1.
- This issue does not block Portfolio-first v0.1 release unless `ENABLE_V0_1_ANALYTICS_STRETCH = true` is explicitly set in project automation memory/config.
- Do not close this issue as part of the Portfolio-first scope change.
```

Replace its `Blocks` list with:

```markdown
- Blocks:
  - #25 Integrate analytics suggestions with ticket workflow in the v0.2 analytics path.
  - Does not block Portfolio-first v0.1 unless explicitly enabled as a stretch goal.
```

## Issue #24

Add after `## Summary`:

```markdown
## Roadmap status
- Portfolio-first v0.1 scope: DEFER_TO_V0_2.
- This issue preserves duplicate-suggestion requirements for a later analytics release.
- This issue does not block Portfolio-first v0.1 release.
- Do not close this issue as part of the Portfolio-first scope change.
```

Replace its `Blocks` list with:

```markdown
- Blocks:
  - #25 Integrate analytics suggestions with ticket workflow in the v0.2 analytics path.
  - Does not block Portfolio-first v0.1.
```

## Issue #25

Add after `## Summary`:

```markdown
## Roadmap status
- Portfolio-first v0.1 scope: DEFER_TO_V0_2.
- This issue preserves the full analytics workflow integration requirements for a later release.
- This issue does not block scoped #26 or scoped #27 for Portfolio-first v0.1.
- Do not close this issue as part of the Portfolio-first scope change.
```

Replace its `Blocks` list with:

```markdown
- Blocks:
  - Future v0.2 analytics release quality/release work.
  - Does not block Portfolio-first v0.1 #26 or #27.
```

## Issue #26

Add after `## Summary`:

```markdown
## Portfolio-first v0.1 scope
For `PORTFOLIO_FIRST_V0_1`, this issue covers quality gates for the implemented core workflow plus #22 dashboard UI. Full #25 analytics workflow integration is not a hard prerequisite for this scoped v0.1 validation issue.

Analytics-specific E2E/security coverage should be added later when #23/#24/#25 are implemented.
```

Replace its `Scope` list with:

```markdown
## Scope
- Create E2E smoke coverage for requester, agent, lead and admin demo paths.
- Add accessibility checks for ticket workflow, Kanban and dashboard surfaces.
- Run security-oriented checks for auth boundaries, role authorization and unsafe logging.
- Cover ticket create/list/detail/update, search/filter, assignment, comments, activity, Kanban and dashboard.
- Wire quality gates into the existing CI plan.
```

Replace its `Dependencies` section with:

```markdown
## Dependencies
- Depends on for Portfolio-first v0.1:
  - #8 Add initial GitHub Actions CI workflow
  - #12 Add authentication and authorization security tests
  - #20 Build responsive Kanban workflow
  - #22 Build responsive dashboard charts
- Later analytics-specific coverage depends on:
  - #23 Implement category and priority suggestion service
  - #24 Implement duplicate ticket suggestion
  - #25 Integrate analytics suggestions with ticket workflow
- Blocks:
  - #27 Complete Docker demo deployment, seeded data and v0.1 portfolio release
```

## Issue #27

Add after `## Summary`:

```markdown
## Portfolio-first v0.1 scope
For `PORTFOLIO_FIRST_V0_1`, this issue prepares the demo/release package for the implemented core workflow, #22 dashboard UI, and scoped #26 validation. Full #25 analytics workflow integration is not a hard v0.1 release prerequisite.

Analytics examples are optional/stretch and must be clearly labeled if #23 is included.
```

Replace its `Scope` list with:

```markdown
## Scope
- Finalize local Docker demo topology and health checks.
- Add fictional seeded demo accounts and tickets for the core workflow.
- Include analytics examples only when optional/stretch analytics work is completed.
- Document demo reset and safe credential handling.
- Prepare portfolio release notes, screenshots and interview talking points.
```

Replace its `Dependencies` section with:

```markdown
## Dependencies
- Depends on for Portfolio-first v0.1:
  - #7 Add Docker Compose development topology
  - #8 Add initial GitHub Actions CI workflow
  - #26 Add integrated quality, accessibility, security and E2E gates
  - #22 Build responsive dashboard charts
- Optional/stretch analytics examples depend on:
  - #23 Implement category and priority suggestion service
  - #24 Implement duplicate ticket suggestion
  - #25 Integrate analytics suggestions with ticket workflow
- Blocks:
  - None
```

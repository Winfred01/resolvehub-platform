# Branch And Worktree Plan

## Main Branch

Primary branch: `main`.

Do not force push `main`. Prefer PRs for all changes.

## Workstreams

- `product/prd`
- `frontend/core-ui`
- `backend/core-api`
- `analytics/service`
- `database/schema`
- `infrastructure/deployment`
- `qa/test-suite`
- `docs/portfolio`

## Suggested Branches

- `product/prd-foundation`
- `frontend/ticket-ui`
- `backend/ticket-api`
- `analytics/classification`
- `database/initial-schema`
- `infrastructure/docker-ci`
- `qa/integration-tests`
- `docs/demo-portfolio`

## Rules

- One issue maps to one branch.
- Use separate worktree directories for parallel work.
- Do not modify the same file from multiple workstreams at the same time.
- Merge only after lint, tests, build, docs validation, and security checks pass.
- Use pull requests by default.
- Do not auto-merge failed code.
- Stop and record conflicts instead of guessing.

## Example Worktree Layout

```text
../resolvehub-worktrees/
  product-prd-foundation/
  frontend-ticket-ui/
  backend-ticket-api/
  analytics-classification/
  database-initial-schema/
  infrastructure-docker-ci/
  qa-integration-tests/
  docs-demo-portfolio/
```

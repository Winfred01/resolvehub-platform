# Workflows

`ci.yml` defines the initial ResolveHub validation workflow for pull requests
and pushes to `main`. It runs scaffold-level checks only and does not deploy,
publish containers, or require secret-bearing environment variables.

## CI Jobs

- Docs and privacy validation:
  - `node scripts/validate-planning-foundation.js`
  - `node scripts/validate-github-metadata-state.js`
- Frontend scaffold checks:
  - `npm ci`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
  - `npm audit --audit-level=high`
- Backend scaffold checks:
  - `mvn test`
  - `mvn package -DskipTests`
- Analytics scaffold checks:
  - `python -m pip install -e .[test]`
  - `python -m pytest`
- Docker Compose config validation:
  - `docker compose -f docker-compose.yml config`

The workflow uses placeholder-only repository data and read-only repository
permissions. Deployment, container publishing, cloud credentials, and release
automation remain out of scope for this issue.

## Auto Draft PR Handoff

`auto-draft-pr-handoff.yml` creates missing Draft PRs for eligible pushed branches
and for eligible historical branches discovered by the hourly/manual scan.

Eligible branches are issue workstream branches containing `/issue-<number>-`
and documentation status-refresh branches matching `docs/status-refresh-*`.
The workflow skips `main`, `master`, branches already contained in `main`, and
branches that already have any open or closed PR targeting `main`.

The workflow uses the built-in `${{ github.token }}` with `contents: read`,
`issues: read`, and `pull-requests: write`. It does not use a PAT, approve PRs,
mark PRs Ready for Review, merge PRs, enable auto-merge, force-push, close
issues directly, or modify labels/milestones.

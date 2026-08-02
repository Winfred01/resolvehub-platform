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

# Tests

ResolveHub uses this workspace for cross-cutting quality gates that do not
belong to only one service.

## Portfolio-first v0.1 Quality Gates

Issue #26 adds `tests/quality-gates.json` as the release-gate inventory for the
implemented core workflow and dashboard surfaces. CI validates that inventory
with `node scripts/validate-quality-gates.js`.

Required scoped gates:

- Frontend accessibility and keyboard-oriented component coverage through
  `cd frontend && npm run test:run`.
- Browser E2E smoke coverage through `cd frontend && npm run e2e`.
- Backend authorization and sensitive-response regressions through
  `cd backend && mvn test`.
- Repository metadata/privacy validation through
  `node scripts/validate-github-metadata-state.js`.

The manual keyboard smoke checklist in `tests/quality-gates.json` covers skip
link behavior, primary navigation, ticket filters/forms, Kanban status controls,
and dashboard filters. All fixtures must remain fictional.

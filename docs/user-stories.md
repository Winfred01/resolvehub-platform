# User Stories

## Requester

1. As a requester, I want to register so that I can submit support requests. Priority: MVP/P0. Acceptance: registration validates required fields and creates a requester role. Tests: validation and duplicate email.
2. As a requester, I want to log in so that I can see my tickets. Priority: MVP/P0. Acceptance: valid credentials create a session or token. Tests: success and failure paths.
3. As a requester, I want to create a ticket so that support can help me. Priority: MVP/P0. Acceptance: title, description, category, and priority are validated. Tests: required fields.
4. As a requester, I want to view my tickets so that I can track progress. Priority: MVP/P0. Acceptance: requester sees only own tickets. Tests: authorization.
5. As a requester, I want to comment on my ticket so that I can add context. Priority: MVP/P1. Acceptance: comments append to history. Tests: comment creation.
6. As a requester, I want accessible forms so that I can use the system with keyboard and assistive tech. Priority: MVP/P1. Acceptance: labels, focus, and error text are present. Tests: accessibility scan.

## Support Agent

7. As an agent, I want to see an assigned queue so that I can prioritize work. Priority: MVP/P0. Acceptance: queue filters by assignee. Tests: filtering.
8. As an agent, I want to update ticket status so that work progress is visible. Priority: MVP/P0. Acceptance: allowed transitions are enforced. Tests: transition rules.
9. As an agent, I want to edit category and priority so that triage is accurate. Priority: MVP/P0. Acceptance: changes write activity records. Tests: audit history.
10. As an agent, I want search and filters so that I can find tickets quickly. Priority: MVP/P0. Acceptance: search covers title and description. Tests: query cases.
11. As an agent, I want duplicate suggestions so that I avoid repeated work. Priority: MVP/P1. Acceptance: suggestions are reviewable, not automatic. Tests: analytics contract.
12. As an agent, I want category suggestions so that triage is faster. Priority: MVP/P1. Acceptance: suggestion confidence is displayed. Tests: analytics response.
13. As an agent, I want error messages to be clear so that I can recover from failed actions. Priority: MVP/P1. Acceptance: API and UI errors are actionable. Tests: error handling.

## Team Lead

14. As a lead, I want a dashboard summary so that I can understand queue health. Priority: MVP/P0. Acceptance: total, open, pending, resolved counts. Tests: metrics.
15. As a lead, I want trend charts so that I can see support volume over time. Priority: MVP/P1. Acceptance: daily/weekly trend data. Tests: dashboard endpoint.
16. As a lead, I want status and priority distribution so that I can rebalance work. Priority: MVP/P1. Acceptance: grouped counts. Tests: aggregation.
17. As a lead, I want to reassign tickets so that workload is balanced. Priority: MVP/P0. Acceptance: reassignment writes activity. Tests: role permissions.
18. As a lead, I want activity history so that I can review decisions. Priority: MVP/P0. Acceptance: changes show actor and timestamp. Tests: audit log.
19. As a lead, I want response and resolution metrics so that I can find bottlenecks. Priority: MVP/P2. Acceptance: planned metrics endpoint. Tests: aggregation.

## Administrator

20. As an administrator, I want to manage roles so that access is controlled. Priority: MVP/P0. Acceptance: only admin changes roles. Tests: authorization.
21. As an administrator, I want to manage categories so that tickets stay organized. Priority: MVP/P1. Acceptance: category CRUD planned. Tests: API contract.
22. As an administrator, I want audit logs so that sensitive changes are traceable. Priority: MVP/P0. Acceptance: role and ticket workflow changes are logged. Tests: audit assertions.
23. As an administrator, I want rate limiting so that public endpoints are protected. Priority: MVP/P1. Acceptance: login/register limited. Tests: security test.
24. As an administrator, I want fictional demo data so that the portfolio demo is safe. Priority: MVP/P0. Acceptance: no real users or employers. Tests: seed scan.
25. As an administrator, I want health checks so that demo services can be monitored. Priority: MVP/P1. Acceptance: backend and analytics health endpoints. Tests: smoke checks.

## Dependencies And Notes

All stories depend on repository foundation, API contract, schema, and security model. Post-MVP stories should not block v0.1.0 release criteria unless explicitly promoted.

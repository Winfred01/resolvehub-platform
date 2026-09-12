# Portfolio Polish Roadmap

Roadmap mode proposal: `PORTFOLIO_POLISH`

This document proposes a planning and portfolio-governance roadmap for making
ResolveHub stronger as a job-search portfolio project. It does not start v0.3,
does not add product features, and does not replace the historical
analytics-assisted v0.2 roadmap.

## Verified v0.2 Baseline

Live reconciliation on 2026-09-11 confirmed:

- `origin/main`: `02661d9c2fe9306572b9dae06d721dea6b63dd71`.
- Latest completion/status PR: PR #61, merged at `2026-09-11T02:34:19Z`.
- v0.2 issues: #23, #24, and #25 are closed with `state_reason=completed`.
- Open PRs targeting `main`: none at reconciliation time.
- Open issues: none at reconciliation time.
- CI: run `34545119953` completed successfully across analytics, backend,
  docs/privacy, Docker Compose, E2E, and frontend jobs.

Current live state remains:

```text
roadmap_mode = ANALYTICS_ASSISTED_V0_2
v0_2_status = COMPLETE
development_selection = PAUSED
maintenance_status = PENDING_USER_APPROVAL
```

Portfolio Polish is not live until the roadmap PR merges and the real scheduler
configuration is updated.

```text
proposed_roadmap_mode = PORTFOLIO_POLISH
portfolio_status = PLANNING
portfolio_scheduler_sync_state = USER_UPDATE_REQUIRED
```

Recommended post-adoption state:

```text
roadmap_mode = PORTFOLIO_POLISH
v0_2_status = COMPLETE
portfolio_status = ACTIVE
development_selection = PAUSED_FEATURE_DEVELOPMENT
portfolio_work_selection = ENABLED
maintenance_status = SUPERSEDED_BY_PORTFOLIO_POLISH
```

## Portfolio Objective

ResolveHub should help a recruiter, hiring manager, or technical interviewer
quickly understand the project, see evidence of engineering depth, follow a
credible demo, and discuss technical trade-offs without needing to reverse
engineer internal automation history.

Target comprehension goals:

- Understand the product within about 60 seconds.
- Understand the architecture within about 2 to 3 minutes.
- Follow a demo path within about 5 minutes.
- See implemented-versus-planned scope clearly.
- See testing, security, privacy, and CI evidence.
- Understand technical decisions and trade-offs.

The portfolio is optimized for clarity, credibility, demoability, engineering
depth, visual presentation, and interview storytelling. It is not optimized for
feature count.

## Target Audience

ResolveHub should support portfolio discussion for:

- Software Engineer roles.
- Backend Engineer roles.
- Full-stack Engineer roles.
- Data or Analytics Engineer roles.
- Data Scientist / analytics-oriented engineering roles.
- Platform or DevOps-adjacent engineering roles.

## Portfolio Audit

### Recruiter View

Status: `ACCEPTABLE`

Strengths:

- README explains that ResolveHub is a full-stack support and issue-management
  platform.
- Tech stack and implemented capability matrix are visible.
- v0.2 status and engineering scope are documented.

Gaps:

- README first screen reads like internal status/roadmap documentation.
- No hero screenshot or immediate visual proof appears near the top.
- Demo path exists across docs but is not recruiter-simple.
- Feature summary should be shorter and more outcome-oriented.

### Hiring Manager View

Status: `STRONG`

Strengths:

- Architecture, API contract, security model, testing strategy, release notes,
  and run logs show ownership and careful delivery.
- Trade-offs are documented: advisory analytics, deterministic rules, local
  Docker demo first, and source-of-truth backend.
- Scope is realistic and explicitly avoids production-scale or AI overclaims.

Gaps:

- Portfolio narrative should make ownership and decisions easier to scan.
- Implementation-versus-planned boundaries need a recruiter-friendly summary.

### Technical Interviewer View

Status: `STRONG`

Strengths:

- Auth/RBAC, ticket workflow, audit history, analytics boundary, fallback
  behavior, CI/testing, privacy/security, and Docker topology are documented.
- Analytics design is deterministic, explainable, advisory, human-reviewed,
  overrideable, and failure-safe.

Gaps:

- A dedicated interview guide would reduce hunting across docs.
- Architecture diagrams should be refreshed for the completed v0.2 state.

### Portfolio Presentation View

Status: `WEAK`

Strengths:

- Demo plan, demo release guide, seed manifest, and release notes exist.
- Mermaid architecture exists and can be adapted.

Gaps:

- Current screenshots are not established as portfolio evidence.
- No focused screenshot checklist exists.
- Architecture diagram is more engineering-reference than portfolio-first.
- Demo flow needs a polished 3 to 5 minute version.

### Resume / Interview View

Status: `WEAK`

Strengths:

- Verifiable engineering facts exist: React, TypeScript, Spring Boot, FastAPI,
  advisory analytics, RBAC, audit history, CI, E2E, Docker, privacy gates.

Gaps:

- No dedicated resume-ready project summary exists.
- No 30-second, 2-minute, and technical-deep-dive narratives exist.
- Role-specific bullet variants are not packaged.

## Core Portfolio Polish Path

Keep exactly one active portfolio workstream at a time. Do not automatically
parallelize.

```text
1. Portfolio README / landing-page refresh
2. Architecture visualization
3. Demo workflow + fictional demo scenarios
4. Screenshot / visual evidence package
5. Portfolio guide + interview narrative
6. Resume-ready project description
7. Optional hosted-demo feasibility assessment
8. Portfolio readiness audit
9. PORTFOLIO_READY
```

## Dependency Gates

- README refresh starts only after this roadmap PR merges and scheduler sync is
  explicitly updated.
- Architecture visualization starts only after README direction is merged or
  reconciled complete.
- Demo workflow starts only after the architecture narrative is stable.
- Screenshot package starts only after the demo workflow identifies stable UI
  states.
- Portfolio guide starts only after demo and visual evidence plans are stable.
- Resume package starts only after the portfolio guide defines accurate claims.
- Hosted-demo assessment starts only after local demo and screenshot/video
  alternatives are understood.
- Readiness audit starts only after all prior portfolio deliverables merge.
- `PORTFOLIO_READY` may be recorded only after the scorecard threshold passes.

## Workstream Deliverables

### 1. Portfolio README / Landing-page Refresh

Target file: `README.md`

Planned structure:

```text
# ResolveHub

One-sentence product description.

Hero screenshot.

ResolveHub is a full-stack technical support / issue-management platform with
role-aware workflows and explainable analytics-assisted triage.

## Why ResolveHub
## Key Features
## Demo
## Architecture
## Tech Stack
## Engineering Highlights
## Analytics-assisted Triage
## Security and Privacy
## Testing and CI
## Run Locally
## Project Evolution
## Portfolio / Interview Notes
```

Acceptance criteria:

- README top section is recruiter-first, not internal status-first.
- Hero screenshot placeholder or real screenshot path is accurate.
- Implementation state remains truthful.
- Detailed engineering documents remain linked instead of duplicated.

### 2. Architecture Visualization

Target files:

- `ARCHITECTURE.md`.
- Optional diagram asset under `docs/` if needed.

Required diagrams:

- High-level architecture diagram.
- Analytics suggestion flow diagram.

The high-level diagram should show:

```text
User / browser
-> React frontend
-> Spring Boot backend
-> Persistence

Spring Boot backend <-> FastAPI analytics service
```

Boundaries to show without overloading:

- Auth/RBAC.
- Ticket workflow.
- Analytics advisory boundary.
- Audit/activity history.
- CI/testing.
- Docker/local topology.

The analytics flow must show:

```text
Ticket workflow
-> analytics request
-> deterministic suggestion
-> confidence/explanation
-> human accept/ignore/override
-> backend remains source of truth
```

### 3. Demo Workflow + Fictional Demo Scenarios

Target file: `docs/portfolio-demo.md`

The portfolio demo should be a 3 to 5 minute path:

1. Log in.
2. Create a support ticket.
3. Show category/priority recommendation.
4. Explain confidence and explanation.
5. Show human review behavior.
6. Show duplicate suggestion.
7. Accept, ignore, or override a recommendation.
8. Move ticket through workflow / Kanban.
9. Show ticket detail and activity history.
10. Show dashboard updates.
11. Mention graceful analytics fallback.

The document must include prerequisites, demo accounts, exact scenario,
expected UI state, talking points, fallback if analytics is unavailable, and
approximate timing. Use fictional data only.

### 4. Screenshot / Visual Evidence Package

Target file: `docs/portfolio-screenshot-plan.md` or a section in
`docs/portfolio-demo.md`.

Target 5 to 7 screenshots:

1. Main ticket workspace.
2. Create ticket plus analytics triage recommendation.
3. Duplicate suggestion.
4. Kanban board.
5. Dashboard.
6. Ticket activity / audit history.
7. Optional architecture diagram.

For each screenshot specify route/screen, demo state, fictional data required,
what the screenshot proves, and recommended caption.

Do not fabricate screenshots. If automated capture is feasible through existing
Playwright tooling, document the command. Do not add brittle screenshot
automation unless justified by the readiness audit.

### 5. Portfolio Guide + Interview Narrative

Target file: `docs/portfolio-guide.md`

Must include:

- 30-second project explanation.
- 2-minute project explanation.
- 5-minute technical walkthrough.
- Architecture explanation.
- Key technical decisions.
- Hardest engineering challenges.
- Trade-offs.
- Security/privacy decisions.
- Testing strategy.
- CI/CD and automation story.
- Analytics design decisions.
- What to improve next.
- Interview Q&A prompts.

Required topics:

- Why Spring Boot plus FastAPI separately?
- Why keep analytics advisory?
- How do failures degrade gracefully?
- How does RBAC work?
- Why deterministic analytics instead of ML?
- How are duplicate suggestions ranked?
- How does the project avoid private-data leakage?
- What happens if analytics is unavailable?
- How is E2E testing structured?
- Why Docker?
- What would change for production scale?

### 6. Resume-ready Project Description

Target file: `docs/resume-project-summary.md`

Must include:

- One-line project summary.
- 2-bullet compact version.
- 3-bullet standard version.
- 4-bullet technical version.
- Software Engineer emphasis.
- Data / Analytics emphasis.
- Backend emphasis.
- Full-stack emphasis.

Allowed claim types:

- Technologies used.
- Number and types of services.
- RBAC and workflow functionality.
- Deterministic advisory analytics.
- CI, E2E, security, and privacy validation.
- Dockerized local environment.
- Documented failure handling.

Prohibited claim types:

- User counts.
- Production traffic.
- Business revenue.
- Real customers.
- Unmeasured performance numbers.
- Deployment scale not achieved.

### 7. Optional Hosted-demo Feasibility Assessment

Target file: `docs/hosted-demo-assessment.md` or a section in
`docs/portfolio-guide.md`.

Evaluate:

- Cost.
- Maintenance.
- Cold starts.
- Database hosting.
- Frontend hosting.
- Backend hosting.
- Analytics hosting.
- Secrets.
- Abuse prevention.
- Demo reset strategy.
- Uptime expectations.
- Privacy/security risk.

Current planning recommendation:

```text
SCREENSHOT_VIDEO_DEMO_PREFERRED
```

Reason: The repository already has a local Docker demo path and rich technical
evidence, but no public hosting has been provisioned. A screenshot/video demo
gives recruiters fast visual proof without incurring hosted database, secrets,
abuse, uptime, and reset risks. A hosted demo can be revisited after the
portfolio artifacts are complete.

### 8. Portfolio Readiness Audit

Target file: `docs/portfolio-readiness-audit.md`

Audit scorecard must be run after prior workstreams merge. The audit should
verify that README, architecture, demo, visual evidence, guide, resume package,
CI evidence, privacy/security claims, and hosted-demo decision are current and
truthful.

### 9. PORTFOLIO_READY

May be recorded only after the Definition of Done and readiness threshold pass.

## Screenshot Plan

| Screenshot | Route / screen | Demo state | Proves | Caption |
|---|---|---|---|---|
| Main ticket workspace | `/tickets` | Fictional queue with mixed status/priority tickets | Core workflow and information density | "Ticket workspace for support triage and queue management." |
| Create ticket + triage recommendation | `/tickets` create/detail flow | Fictional VPN/network ticket | Explainable category/priority suggestions | "Deterministic advisory triage with confidence and explanation." |
| Duplicate suggestion | Ticket detail analytics panel | Source ticket plus fictional similar ticket | Duplicate detection remains advisory | "Ranked duplicate candidate shown for human review." |
| Kanban board | `/tickets` Kanban area | Ticket staged across workflow statuses | Workflow ergonomics and keyboard-operable status changes | "Kanban workflow for triage, progress, waiting, and resolution." |
| Dashboard | `/dashboard` | Fictional trend and distribution data | Reporting depth and aggregate privacy boundary | "Team-lead dashboard with aggregate status, category, priority, and trend views." |
| Activity / audit history | Ticket detail activity section | Ticket with comments, status move, analytics review | Auditability without raw private payload leakage | "Safe activity history records field-level changes and analytics review decisions." |
| Architecture diagram | README or `ARCHITECTURE.md` | Mermaid diagram rendered by GitHub | Multi-service architecture and advisory analytics boundary | "React, Spring Boot, FastAPI, persistence, and CI/local-demo topology." |

## Demo Plan

Duration target: 3 to 5 minutes.

Scenario: A fictional support team triages a VPN access incident, receives an
advisory category/priority recommendation, reviews a possible duplicate, stages
a human-approved change, moves the ticket through Kanban, and checks aggregate
dashboard impact.

Fictional data:

- Requester: `requester@example.test`.
- Agent: `agent@example.test`.
- Team lead: `lead@example.test`.
- Ticket: "VPN access blocked for support queue".
- Duplicate candidate: "VPN queue access blocked after profile refresh".
- Category: `network`.
- Priority: `HIGH`.

Fallback: If analytics is unavailable, show the low-confidence/fallback UI and
explain that the ticket workflow remains usable because analytics is advisory.

## Resume / Interview Package

The package should turn existing evidence into truthful interview material:

- 30-second story: what ResolveHub is and why it exists.
- 2-minute story: architecture, workflow, analytics, and safety decisions.
- Technical deep dive: auth/RBAC, ticket workflow, analytics boundary, fallback,
  audit history, testing, CI, Docker, and privacy.
- Trade-offs: deterministic analytics instead of ML, local Docker demo before
  hosted demo, backend as source of truth, explicit review before mutation.
- Likely questions: RBAC design, failure handling, duplicate ranking, testing
  strategy, no-private-data policy, production hardening.

## Hosted-demo Assessment

Recommendation:

```text
SCREENSHOT_VIDEO_DEMO_PREFERRED
```

Rationale:

- Recruiters benefit most from fast visual evidence and a short demo path.
- A public hosted demo adds cost, uptime, reset, abuse-prevention, and secret
  management work before the portfolio presentation layer is ready.
- The project already has a local Docker demo path for technical interviewers.
- Screenshot/video evidence avoids claiming public deployment before it exists.

## Readiness Scorecard

Scores:

- `0 = missing`
- `1 = weak`
- `2 = usable`
- `3 = strong`

Current audit:

| Category | Current score | Rationale |
|---|---:|---|
| README clarity | 1 | Comprehensive but internal status-first and no hero visual. |
| Architecture clarity | 2 | Mermaid diagrams and architecture docs exist; need portfolio refresh. |
| Demo usability | 2 | Demo plan/release guide exist; needs 3 to 5 minute portfolio script. |
| Visual quality | 0 | No verified screenshot package yet. |
| Technical depth | 3 | RBAC, workflow, analytics boundary, audit, CI, Docker, privacy evidence exist. |
| Testing evidence | 3 | CI, frontend/backend/analytics/E2E/security validation documented. |
| Security/privacy story | 3 | Security model and no-private-data boundaries are strong. |
| Resume readiness | 1 | Facts exist but no role-specific resume package. |
| Interview readiness | 1 | Evidence exists but no dedicated interview narrative. |
| Deployment/demo accessibility | 2 | Local Docker demo exists; hosted decision not yet packaged. |

Current score: `18/30`.

`PORTFOLIO_READY` threshold:

```text
No category below 2
Total score >= 25/30
```

## Definition of Done

ResolveHub becomes `PORTFOLIO_READY` only when:

- v0.2 remains complete and stable.
- Recruiter-first README is merged.
- Architecture diagram is merged.
- Demo walkthrough is reproducible.
- Fictional demo scenario is documented.
- Key screenshots or screenshot-generation path exists.
- `docs/portfolio-guide.md` is complete.
- `docs/resume-project-summary.md` is complete.
- Implementation-versus-planned claims are accurate.
- CI is healthy.
- Privacy/security evidence remains current.
- No private data or credentials exist in portfolio artifacts.
- Optional hosted-demo decision is documented.
- Final portfolio readiness audit passes.

Then record:

```text
portfolio_status = COMPLETE
portfolio_readiness = PORTFOLIO_READY
development_selection = PAUSED
maintenance_status = PENDING_USER_APPROVAL
```

Do not automatically start v0.3.

## Scheduler Transition Design

Do not claim this is live until the roadmap PR merges and the real scheduler or
automation configuration is updated.

Proposed scheduler block:

```text
Automation: ResolveHub Daily MVP Development
Automation ID: resolvehub-daily-mvp-development
Timezone: America/Toronto
Schedule intent: every day at 8:00 PM America/Toronto

roadmap_mode = PORTFOLIO_POLISH
v0_2_status = COMPLETE
portfolio_status = ACTIVE
development_selection = PAUSED_FEATURE_DEVELOPMENT
portfolio_work_selection = ENABLED
maintenance_status = SUPERSEDED_BY_PORTFOLIO_POLISH
portfolio_scheduler_sync_state = ACTIVE_DAILY_2000_AMERICA_TORONTO

Selection order:
README
-> architecture
-> demo
-> screenshots
-> portfolio guide
-> resume package
-> hosted-demo assessment
-> readiness audit
-> PORTFOLIO_READY

Keep exactly one active portfolio workstream at a time.
Do not start v0.3 product development.
Do not create new analytics algorithms.
Do not create unrelated backend or frontend features.
Use dedicated planning/documentation branches or worktrees.
Use Auto Draft PR Handoff.
Never mark Ready automatically.
Never approve, merge, enable auto-merge, or force-push.
Do not fabricate screenshots, metrics, deployments, users, customers, or
performance results.
Use fictional demo data only.
No private data, credentials, Gmail, job-search, resume, browser-session,
customer, employer, address, phone, or application-answer data.
```

Current scheduler state for this planning PR:

```text
portfolio_scheduler_sync_state = USER_UPDATE_REQUIRED
real_scheduler_changed = false
```

## Safety Constraints

This roadmap and all future portfolio-polish workstreams must not:

- start v0.3;
- create unrelated features;
- mark a PR Ready for Review;
- approve a PR;
- merge a PR;
- enable auto-merge;
- force-push;
- change credentials;
- expose secrets;
- access job-search, Gmail, resume, browser-session, or unrelated private data;
- include real customer/private information;
- fabricate metrics;
- fabricate screenshots;
- claim deployment exists when it does not.

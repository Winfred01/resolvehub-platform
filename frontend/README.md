# ResolveHub Frontend

Current scope: Issue #22 adds the responsive dashboard surface for the Issue #21
backend dashboard API contract. The dashboard renders summary metrics,
status/category/priority distributions, trend buckets, loading, empty, and error
states with fictional demo data until authenticated backend session wiring is
selected.

## Prerequisites

- Node.js 22 or newer.
- npm 10 or newer.

Node.js is used only as frontend development tooling/runtime for package installation, linting, testing, and building.

## Install

```powershell
npm install
```

## Development

```powershell
npm run dev
```

The dev server binds to `127.0.0.1` by default.

## Test

```powershell
npm run test:run
```

## Lint

```powershell
npm run lint
```

## Build

```powershell
npm run build
```

## Preview

```powershell
npm run preview
```

## Routes

- `/`: foundation landing page for the ResolveHub frontend.
- `/login`: placeholder page. Authentication is not implemented.
- `/tickets`: ticket workspace with list, detail, create, edit, Kanban status board, loading, empty, error, validation, and responsive states.
- `/dashboard`: dashboard metrics surface with summary tiles, distribution charts, trend buckets, loading, empty, error, and responsive states.
- `/*`: accessible Not Found page.

## Accessibility Foundation

- Skip-to-content link.
- Semantic `header`, `nav`, and `main` landmarks.
- Visible page headings.
- Keyboard-accessible navigation.
- Active route indication with `aria-current`.
- Focus-visible styles.
- Responsive layout baseline.
- Reduced-motion respect for global scrolling behavior.
- Labeled ticket filters, forms, and Kanban status controls.
- Status and priority are exposed as text, not color alone.
- Kanban updates use explicit select and button controls for keyboard access.
- Dashboard charts expose text labels and counts, not color alone.
- Dashboard date and granularity filters use labeled form controls.

## Not Implemented

- Authentication.
- Comments UI, analytics suggestions, or realtime collaboration.
- Authenticated backend session selection for the REST gateway.
- Production deployment.

## Future Issues

Future issues may add authentication UI, comments, dashboard screens, analytics suggestions, end-to-end coverage, and stronger accessibility testing after their dependencies are complete.

## No-Secret Requirement

Do not commit `.env.local`, npm tokens, registry credentials, browser data, Gmail data, job-search private data, or real user/customer/employer data. Use fictional examples only.

## Analytics-assisted v0.2 Boundary

The analytics-assisted v0.2 roadmap should add suggestion UI only after #25 is
selected. Frontend experiences must make recommendations visibly advisory and
give users explicit accept, ignore, and override choices. Loading, low-confidence,
empty, and analytics-service failure states must leave the normal ticket
workflow usable.

# ResolveHub Frontend

Current scope: Issue #3 establishes the initial React and TypeScript frontend scaffold. Prompt 7 only planned this client; this branch adds the first runnable application shell without implementing product workflows.

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
- `/tickets`: placeholder page. Ticket workflows are not implemented.
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

## Not Implemented

- Authentication.
- Ticket list, detail, form, Kanban, comments, or dashboard.
- Backend or analytics integration.
- API client calls.
- Production deployment.

## Future Issues

Future issues may add authentication UI, ticket workflow UI, dashboard screens, API integration, and stronger accessibility testing after their dependencies are complete.

## No-Secret Requirement

Do not commit `.env.local`, npm tokens, registry credentials, browser data, Gmail data, job-search private data, or real user/customer/employer data. Use fictional examples only.

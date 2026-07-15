import { StatusNote } from "../components/StatusNote";

export function HomePage() {
  return (
    <section className="page-stack" aria-labelledby="home-heading">
      <p className="eyebrow">Frontend foundation</p>
      <h1 id="home-heading">ResolveHub foundation</h1>
      <p className="lede">
        This scaffold starts the React and TypeScript client with accessible
        navigation, route placeholders, linting, testing, and build tooling.
      </p>
      <StatusNote title="Current implementation boundary">
        Issue #3 creates the app shell only. Authentication, tickets,
        dashboard, analytics, backend integration, and deployment remain future
        work.
      </StatusNote>
    </section>
  );
}

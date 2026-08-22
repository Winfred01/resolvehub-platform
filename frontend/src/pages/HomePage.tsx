import { StatusNote } from "../components/StatusNote";

export function HomePage() {
  return (
    <section className="page-stack" aria-labelledby="home-heading">
      <p className="eyebrow">Frontend foundation</p>
      <h1 id="home-heading">ResolveHub foundation</h1>
      <p className="lede">
        ResolveHub combines a ticket workspace, Kanban workflow, and dashboard
        reporting surface for a portfolio-ready support operations MVP.
      </p>
      <StatusNote title="Current implementation boundary">
        The frontend uses fictional demo data until authenticated browser
        session wiring is selected. Analytics suggestions and production
        deployment remain future work.
      </StatusNote>
    </section>
  );
}

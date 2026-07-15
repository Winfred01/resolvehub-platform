import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="page-stack" aria-labelledby="not-found-heading">
      <p className="eyebrow">Route not found</p>
      <h1 id="not-found-heading">Page not found</h1>
      <p className="lede">
        The requested route does not exist in the current ResolveHub frontend
        scaffold.
      </p>
      <Link className="text-link" to="/">
        Return to the foundation page
      </Link>
    </section>
  );
}

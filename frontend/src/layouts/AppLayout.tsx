import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { pageTitles } from "../routes/pageTitles";

type NavigationItem = {
  to: string;
  label: string;
  end?: boolean;
};

const navigationItems: readonly NavigationItem[] = [
  { to: "/", label: "Foundation", end: true },
  { to: "/login", label: "Login placeholder" },
  { to: "/tickets", label: "Tickets placeholder" }
];

export function AppLayout() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? "ResolveHub | Not Found";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">
            RH
          </span>
          <div>
            <p className="eyebrow">ResolveHub</p>
            <p className="brand-subtitle">Technical support workflow MVP</p>
          </div>
        </div>
        <nav className="site-nav" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

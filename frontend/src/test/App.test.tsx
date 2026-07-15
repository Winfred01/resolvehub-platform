import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AppRoutes } from "../routes/appRoutes";

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe("ResolveHub app shell", () => {
  it("renders the foundation page with semantic landmarks", () => {
    renderRoute("/");

    expect(
      screen.getByRole("heading", { name: "ResolveHub foundation" })
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("provides a skip link for keyboard users", () => {
    renderRoute("/");

    expect(
      screen.getByRole("link", { name: "Skip to main content" })
    ).toHaveAttribute("href", "#main-content");
  });

  it("marks the active route in the primary navigation", () => {
    renderRoute("/login");

    expect(
      screen.getByRole("link", { name: "Login placeholder" })
    ).toHaveAttribute("aria-current", "page");
  });

  it("renders the login placeholder without implementing authentication", () => {
    renderRoute("/login");

    expect(
      screen.getByText(/Authentication is not implemented/i)
    ).toBeInTheDocument();
  });

  it("renders the tickets placeholder without implementing ticket workflows", () => {
    renderRoute("/tickets");

    expect(
      screen.getByText(/Ticket workflow is not implemented/i)
    ).toBeInTheDocument();
  });

  it("renders an accessible not found route", () => {
    renderRoute("/unknown-route");

    expect(
      screen.getByRole("heading", { name: "Page not found" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Return to the foundation page" })
    ).toHaveAttribute("href", "/");
  });
});

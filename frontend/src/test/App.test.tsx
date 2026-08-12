import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { createDemoTicketGateway } from "../api/ticketGateway";
import { demoTickets } from "../data/ticketFixtures";
import { TicketsPage } from "../pages/TicketsPage";
import { AppRoutes } from "../routes/appRoutes";
import type { TicketGateway } from "../types/tickets";

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

  it("renders the tickets route with the ticket workspace", async () => {
    renderRoute("/tickets");

    expect(
      await screen.findByRole("heading", { name: "Support tickets" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tickets" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      await screen.findByRole("heading", { name: "Cannot access shared support queue" })
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

describe("Ticket workspace", () => {
  it("renders list, detail, filters, and create form controls", async () => {
    render(<TicketsPage gateway={createDemoTicketGateway(demoTickets)} />);

    expect(await screen.findByText("VPN drops during ticket handoff")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Support tickets" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create ticket" })).toBeInTheDocument();
    expect(screen.getByLabelText("Ticket filters")).toBeInTheDocument();
    expect(screen.getAllByText("Account access").length).toBeGreaterThan(0);
  });

  it("shows an empty state after filters remove all tickets", async () => {
    render(<TicketsPage gateway={createDemoTicketGateway(demoTickets)} />);

    fireEvent.change(await screen.findByLabelText("Search"), {
      target: { value: "missing-ticket" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(
      await screen.findByRole("heading", { name: "No tickets match these filters" })
    ).toBeInTheDocument();
  });

  it("validates required fields before creating a ticket", async () => {
    render(<TicketsPage gateway={createDemoTicketGateway([])} />);

    fireEvent.click(await screen.findByRole("button", { name: "Create ticket" }));

    expect(await screen.findByText("Title is required.")).toBeInTheDocument();
    expect(screen.getByText("Description is required.")).toBeInTheDocument();
  });

  it("creates a ticket with local validation and selects it", async () => {
    render(<TicketsPage gateway={createDemoTicketGateway([])} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Printer queue is stuck" }
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "The fictional east office queue has stopped processing requests." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Create ticket" }));

    expect(
      await screen.findByRole("heading", { name: "Printer queue is stuck" })
    ).toBeInTheDocument();
    expect(screen.getByText("The fictional east office queue has stopped processing requests."))
      .toBeInTheDocument();
  });

  it("edits the selected ticket title and status", async () => {
    render(<TicketsPage gateway={createDemoTicketGateway(demoTickets)} />);

    fireEvent.click(
      await screen.findByRole("button", { name: /Cannot access shared support queue/i })
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit ticket" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Shared queue access restored" }
    });
    const formPanel = screen.getByRole("region", { name: "Edit ticket" });
    fireEvent.change(within(formPanel).getByLabelText("Status"), {
      target: { value: "TRIAGED" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save ticket" }));

    expect(await screen.findByRole("heading", { name: "Shared queue access restored" }))
      .toBeInTheDocument();
    const detailPanel = screen.getByRole("article", { name: /Shared queue access restored/i });
    expect(within(detailPanel).getByText("Triaged")).toBeInTheDocument();
  });

  it("renders an error state and retry action when loading fails", async () => {
    const failingGateway: TicketGateway = {
      listTickets: vi.fn().mockRejectedValue(new Error("Backend unavailable.")),
      getTicket: vi.fn(),
      createTicket: vi.fn(),
      updateTicket: vi.fn()
    };

    render(<TicketsPage gateway={failingGateway} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Backend unavailable.");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});

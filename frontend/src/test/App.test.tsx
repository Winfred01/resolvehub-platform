import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { createDemoDashboardGateway } from "../api/dashboardGateway";
import { createDemoTicketGateway } from "../api/ticketGateway";
import { demoTickets } from "../data/ticketFixtures";
import { DashboardPage } from "../pages/DashboardPage";
import { TicketsPage } from "../pages/TicketsPage";
import { AppRoutes } from "../routes/appRoutes";
import type { DashboardGateway } from "../types/dashboard";
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
      await screen.findByRole("article", { name: "Cannot access shared support queue" })
    ).toBeInTheDocument();
  });

  it("renders the dashboard route with active navigation", async () => {
    renderRoute("/dashboard");

    expect(
      await screen.findByRole("heading", { name: "Support dashboard" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page"
    );
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
  it("keeps ticket workflow controls accessible by role, label, and name", async () => {
    render(<TicketsPage gateway={createDemoTicketGateway(demoTickets)} />);

    expect(await screen.findByLabelText("Ticket filters")).toBeInTheDocument();
    const filters = screen.getByLabelText("Ticket filters");
    expect(screen.getByLabelText("Search")).toHaveAttribute("type", "search");
    expect(within(filters).getByLabelText("Status")).toBeInTheDocument();
    expect(within(filters).getByLabelText("Priority")).toBeInTheDocument();
    expect(within(filters).getByLabelText("Category")).toBeInTheDocument();
    expect(within(filters).getByRole("button", { name: "Apply filters" })).toBeInTheDocument();

    const board = await screen.findByRole("region", { name: "Status board" });
    expect(within(board).getByRole("region", { name: "Open" })).toBeInTheDocument();
    expect(within(board).getByRole("region", { name: "Triaged" })).toBeInTheDocument();

    const openCard = await within(board).findByRole("article", {
      name: /Kanban card Cannot access shared support queue/i
    });
    expect(within(openCard).getByLabelText("Move status")).toBeInTheDocument();
    expect(within(openCard).getByRole("button", { name: "Apply" })).toBeDisabled();

    expect(screen.getByLabelText("Title")).toHaveAttribute("maxLength", "120");
    expect(screen.getByLabelText("Description")).toHaveAttribute("maxLength", "4000");
    expect(screen.getByRole("button", { name: "Create ticket" })).toBeInTheDocument();
  });

  it("renders list, detail, filters, and create form controls", async () => {
    render(<TicketsPage gateway={createDemoTicketGateway(demoTickets)} />);

    expect(
      await screen.findByRole("button", { name: /VPN drops during ticket handoff/i })
    ).toBeInTheDocument();
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
      await screen.findByRole("article", { name: "Printer queue is stuck" })
    ).toBeInTheDocument();
    expect(screen.getByText("The fictional east office queue has stopped processing requests."))
      .toBeInTheDocument();
  });

  it("stages accepted triage suggestions in the edit form and records review", async () => {
    render(
      <TicketsPage
        gateway={createDemoTicketGateway([
          {
            id: "44444444-4444-4444-8444-444444444444",
            title: "VPN access blocked",
            description: "The fictional requester cannot reach the secure queue.",
            categoryId: "general",
            priority: "LOW",
            status: "OPEN",
            version: 1,
            requesterId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            currentAssigneeId: null,
            createdAt: "2026-09-01T10:00:00Z",
            updatedAt: "2026-09-01T10:00:00Z"
          }
        ])}
      />
    );

    expect(await screen.findByRole("article", { name: "VPN access blocked" })).toBeInTheDocument();
    expect(await screen.findByRole("article", { name: "Triage suggestion" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Accept category" }));

    const formPanel = await screen.findByRole("region", { name: "Edit ticket" });
    expect(within(formPanel).getByLabelText("Category")).toHaveValue("network");
    expect(await screen.findByText("accept review recorded for triage.")).toBeInTheDocument();
  });

  it("keeps ticket workflow available when analytics suggestions fail", async () => {
    const baseGateway = createDemoTicketGateway(demoTickets);
    const failingSuggestionGateway: TicketGateway = {
      ...baseGateway,
      getAnalyticsSuggestions: vi.fn().mockRejectedValue(new Error("Analytics service unavailable.")),
      reviewAnalyticsSuggestion: vi.fn()
    };

    render(<TicketsPage gateway={failingSuggestionGateway} />);

    expect(await screen.findByRole("article", { name: "Cannot access shared support queue" }))
      .toBeInTheDocument();
    expect(await screen.findByText("Analytics service unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create ticket" })).toBeInTheDocument();
  });

  it("records ignored and overridden suggestions explicitly", async () => {
    const reviewAnalyticsSuggestion = vi.fn().mockResolvedValue({
      ticketId: demoTickets[0].id,
      suggestionType: "TRIAGE",
      decision: "IGNORE",
      recordedFields: ["analyticsSuggestionReview", "suggestionType", "decision"],
      recordedAt: "2026-09-01T10:30:00Z",
      advisory: true
    });
    const baseGateway = createDemoTicketGateway(demoTickets);
    const reviewGateway: TicketGateway = {
      ...baseGateway,
      reviewAnalyticsSuggestion
    };

    render(<TicketsPage gateway={reviewGateway} />);

    expect(await screen.findByRole("article", { name: "Triage suggestion" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ignore" }));
    expect(await screen.findByText("ignore review recorded for triage.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Override" }));
    expect(reviewAnalyticsSuggestion).toHaveBeenLastCalledWith(
      demoTickets[0].id,
      expect.objectContaining({
        suggestionType: "TRIAGE",
        decision: "OVERRIDE"
      })
    );
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

    expect(await screen.findByRole("article", { name: "Shared queue access restored" }))
      .toBeInTheDocument();
    const detailPanel = screen.getByRole("article", { name: "Shared queue access restored" });
    expect(within(detailPanel).getByText("Triaged")).toBeInTheDocument();
  });

  it("renders an error state and retry action when loading fails", async () => {
    const failingGateway: TicketGateway = {
      listTickets: vi.fn().mockRejectedValue(new Error("Backend unavailable.")),
      getTicket: vi.fn(),
      createTicket: vi.fn(),
      updateTicket: vi.fn(),
      getAnalyticsSuggestions: vi.fn(),
      reviewAnalyticsSuggestion: vi.fn()
    };

    render(<TicketsPage gateway={failingGateway} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Backend unavailable.");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});

describe("Dashboard workspace", () => {
  it("exposes dashboard charts and filters with accessible text equivalents", async () => {
    const { container } = render(<DashboardPage gateway={createDemoDashboardGateway(demoTickets)} />);

    expect(
      await screen.findByRole("heading", { name: "Support dashboard" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Dashboard filters")).toBeInTheDocument();
    expect(screen.getByLabelText("From")).toHaveAttribute("type", "date");
    expect(screen.getByLabelText("To")).toHaveAttribute("type", "date");
    expect(screen.getByLabelText("Granularity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh dashboard" })).toBeInTheDocument();

    expect(container.querySelector('[aria-label="Status distribution"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Category distribution"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Priority distribution"]')).toBeInTheDocument();
    expect(
      container.querySelector('[aria-label="Created tickets and status movements"]')
    ).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    expect(screen.getByText(/1 created, 0 moved/i)).toBeInTheDocument();
  });

  it("renders summary metrics, distributions, and trend buckets", async () => {
    render(<DashboardPage gateway={createDemoDashboardGateway(demoTickets)} />);

    expect(
      await screen.findByRole("heading", { name: "Support dashboard" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Dashboard filters")).toBeInTheDocument();
    expect(screen.getByText("3 tickets")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Category" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Priority" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ticket volume" })).toBeInTheDocument();
    expect(screen.getByText("Account access")).toBeInTheDocument();
    expect(screen.getByText(/1 created, 0 moved/i)).toBeInTheDocument();
  });

  it("shows an empty dashboard state for a date range with no metrics", async () => {
    render(<DashboardPage gateway={createDemoDashboardGateway(demoTickets)} />);

    fireEvent.change(await screen.findByLabelText("From"), {
      target: { value: "2026-09-01" }
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "2026-09-30" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Refresh dashboard" }));

    expect(
      await screen.findByRole("heading", { name: "No dashboard metrics in this range" })
    ).toBeInTheDocument();
  });

  it("renders a recoverable error when dashboard metrics fail to load", async () => {
    const failingGateway: DashboardGateway = {
      getSummary: vi.fn().mockRejectedValue(new Error("Dashboard service unavailable.")),
      getTrends: vi.fn()
    };

    render(<DashboardPage gateway={failingGateway} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Dashboard service unavailable."
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
describe("Kanban workflow", () => {
  it("groups tickets into status columns and disables unavailable transitions", async () => {
    render(<TicketsPage gateway={createDemoTicketGateway(demoTickets)} />);

    const board = await screen.findByRole("region", { name: "Status board" });
    const openColumn = within(board).getByRole("region", { name: "Open" });
    const triagedColumn = within(board).getByRole("region", { name: "Triaged" });
    const openCard = await within(openColumn).findByRole("article", {
      name: /Kanban card Cannot access shared support queue/i
    });

    expect(openCard).toBeInTheDocument();
    expect(
      await within(triagedColumn).findByRole("article", {
        name: /Kanban card Workflow approval email missing/i
      })
    ).toBeInTheDocument();
    expect(within(openCard).getByRole("option", { name: "Closed" })).toBeDisabled();
    expect(within(openCard).getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("moves a ticket through the keyboard-operable status controls", async () => {
    render(<TicketsPage gateway={createDemoTicketGateway(demoTickets)} />);

    const board = await screen.findByRole("region", { name: "Status board" });
    const openColumn = within(board).getByRole("region", { name: "Open" });
    const triagedColumn = within(board).getByRole("region", { name: "Triaged" });
    const openCard = await within(openColumn).findByRole("article", {
      name: /Kanban card Cannot access shared support queue/i
    });

    fireEvent.change(within(openCard).getByLabelText("Move status"), {
      target: { value: "TRIAGED" }
    });
    fireEvent.click(within(openCard).getByRole("button", { name: "Apply" }));

    expect(
      await within(triagedColumn).findByRole("article", {
        name: /Kanban card Cannot access shared support queue/i
      })
    ).toBeInTheDocument();
  });

  it("shows a recoverable error and keeps the card in place when a status update fails", async () => {
    const failingGateway: TicketGateway = {
      listTickets: vi.fn().mockResolvedValue({
        content: [demoTickets[0]],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        empty: false
      }),
      getTicket: vi.fn(),
      createTicket: vi.fn(),
      updateTicket: vi.fn().mockRejectedValue(new Error("Status service unavailable.")),
      getAnalyticsSuggestions: vi.fn().mockResolvedValue({
        advisory: true,
        analyticsAvailable: true,
        triage: {
          categoryId: "account-access",
          priority: "HIGH",
          confidence: 0.8,
          explanation: ["Suggestion is advisory and requires human review."],
          lowConfidence: false,
          advisory: true
        },
        duplicates: {
          candidates: [],
          lowConfidence: true,
          advisory: true
        }
      }),
      reviewAnalyticsSuggestion: vi.fn()
    };

    render(<TicketsPage gateway={failingGateway} />);

    const board = await screen.findByRole("region", { name: "Status board" });
    const openColumn = within(board).getByRole("region", { name: "Open" });
    const openCard = await within(openColumn).findByRole("article", {
      name: /Kanban card Cannot access shared support queue/i
    });

    fireEvent.change(within(openCard).getByLabelText("Move status"), {
      target: { value: "TRIAGED" }
    });
    fireEvent.click(within(openCard).getByRole("button", { name: "Apply" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Status service unavailable.");
    expect(
      within(openColumn).getByRole("article", {
        name: /Kanban card Cannot access shared support queue/i
      })
    ).toBeInTheDocument();
    expect(within(openCard).getByLabelText("Move status")).toHaveValue("OPEN");
  });
});

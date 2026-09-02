import { demoTickets } from "../data/ticketFixtures";
import type {
  TicketAnalyticsSuggestion,
  TicketFilters,
  TicketGateway,
  TicketPage,
  TicketPriority,
  TicketSummary
} from "../types/tickets";

const DEFAULT_PAGE_SIZE = 20;

function matchesFilters(ticket: TicketSummary, filters: TicketFilters) {
  const query = filters.q.trim().toLocaleLowerCase();

  return (
    (!query ||
      ticket.title.toLocaleLowerCase().includes(query) ||
      ticket.description.toLocaleLowerCase().includes(query)) &&
    (!filters.status || ticket.status === filters.status) &&
    (!filters.priority || ticket.priority === filters.priority) &&
    (!filters.categoryId || ticket.categoryId === filters.categoryId)
  );
}

function toPage(content: TicketSummary[]): TicketPage {
  return {
    content,
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    empty: content.length === 0
  };
}

function suggestCategory(ticket: TicketSummary) {
  const text = `${ticket.title} ${ticket.description}`.toLocaleLowerCase();

  if (text.includes("vpn") || text.includes("connection")) {
    return "network";
  }
  if (text.includes("access") || text.includes("sign in")) {
    return "account-access";
  }
  if (text.includes("approval") || text.includes("queue")) {
    return "workflow";
  }

  return ticket.categoryId;
}

function suggestPriority(ticket: TicketSummary): TicketPriority {
  const text = `${ticket.title} ${ticket.description}`.toLocaleLowerCase();

  if (text.includes("cannot") || text.includes("blocked")) {
    return "HIGH";
  }
  if (text.includes("stuck") || text.includes("slow")) {
    return "MEDIUM";
  }

  return ticket.priority;
}

function toAnalyticsSuggestion(ticket: TicketSummary, tickets: TicketSummary[]): TicketAnalyticsSuggestion {
  const duplicateCandidates = tickets
    .filter((candidate) => candidate.id !== ticket.id && candidate.categoryId === ticket.categoryId)
    .slice(0, 3)
    .map((candidate) => ({
      candidateId: candidate.id,
      confidence: candidate.title.toLocaleLowerCase() === ticket.title.toLocaleLowerCase() ? 0.9 : 0.54,
      matchingSignals: ["shared_category"],
      explanation: [
        "Matched category metadata.",
        "Suggestion is advisory and does not merge or mutate tickets."
      ]
    }));

  return {
    advisory: true,
    analyticsAvailable: true,
    triage: {
      categoryId: suggestCategory(ticket),
      priority: suggestPriority(ticket),
      confidence: 0.74,
      explanation: [
        "Matched deterministic demo ticket signals.",
        "Suggestion is advisory and requires human review."
      ],
      lowConfidence: false,
      advisory: true
    },
    duplicates: {
      candidates: duplicateCandidates,
      lowConfidence: duplicateCandidates.length === 0,
      advisory: true
    }
  };
}

export function createDemoTicketGateway(
  initialTickets: readonly TicketSummary[] = demoTickets
): TicketGateway {
  let tickets = [...initialTickets];

  return {
    async listTickets(filters) {
      return toPage(tickets.filter((ticket) => matchesFilters(ticket, filters)));
    },
    async getTicket(id) {
      const ticket = tickets.find((candidate) => candidate.id === id);

      if (!ticket) {
        throw new Error("Ticket was not found.");
      }

      return ticket;
    },
    async createTicket(input) {
      const now = new Date().toISOString();
      const ticket: TicketSummary = {
        ...input,
        id: crypto.randomUUID(),
        status: "OPEN",
        version: 1,
        requesterId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        currentAssigneeId: null,
        createdAt: now,
        updatedAt: now
      };

      tickets = [ticket, ...tickets];
      return ticket;
    },
    async updateTicket(id, input) {
      const existing = tickets.find((ticket) => ticket.id === id);

      if (!existing) {
        throw new Error("Ticket was not found.");
      }

      const updated: TicketSummary = {
        ...existing,
        ...input,
        version: existing.version + 1,
        updatedAt: new Date().toISOString()
      };

      tickets = tickets.map((ticket) => (ticket.id === id ? updated : ticket));
      return updated;
    },
    async getAnalyticsSuggestions(id) {
      const ticket = tickets.find((candidate) => candidate.id === id);

      if (!ticket) {
        throw new Error("Ticket was not found.");
      }

      return toAnalyticsSuggestion(ticket, tickets);
    },
    async reviewAnalyticsSuggestion(id, input) {
      if (!tickets.some((ticket) => ticket.id === id)) {
        throw new Error("Ticket was not found.");
      }

      return {
        ticketId: id,
        ...input,
        recordedFields: ["analyticsSuggestionReview", "suggestionType", "decision"],
        recordedAt: new Date().toISOString(),
        advisory: true
      };
    }
  };
}

type RestGatewayOptions = {
  baseUrl?: string;
  getAccessToken?: () => string | null;
};

async function requestJson<T>(
  path: string,
  options: RestGatewayOptions,
  init: RequestInit = {}
): Promise<T> {
  const token = options.getAccessToken?.();
  const response = await fetch(`${options.baseUrl ?? ""}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Ticket API request failed with ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function createRestTicketGateway(
  options: RestGatewayOptions = {}
): TicketGateway {
  return {
    listTickets(filters) {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      return requestJson<TicketPage>(`/api/tickets?${params}`, options);
    },
    getTicket(id) {
      return requestJson<TicketSummary>(`/api/tickets/${id}`, options);
    },
    createTicket(input) {
      return requestJson<TicketSummary>("/api/tickets", options, {
        method: "POST",
        body: JSON.stringify(input)
      });
    },
    updateTicket(id, input) {
      return requestJson<TicketSummary>(`/api/tickets/${id}`, options, {
        method: "PATCH",
        body: JSON.stringify(input)
      });
    },
    getAnalyticsSuggestions(id) {
      return requestJson<TicketAnalyticsSuggestion>(`/api/tickets/${id}/analytics-suggestions`, options);
    },
    reviewAnalyticsSuggestion(id, input) {
      return requestJson(`/api/tickets/${id}/analytics-suggestions/reviews`, options, {
        method: "POST",
        body: JSON.stringify(input)
      });
    }
  };
}

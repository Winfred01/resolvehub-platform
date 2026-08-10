import { demoTickets } from "../data/ticketFixtures";
import type { TicketFilters, TicketGateway, TicketPage, TicketSummary } from "../types/tickets";

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
    }
  };
}

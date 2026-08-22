import { demoTickets, ticketCategories } from "../data/ticketFixtures";
import type {
  DashboardFilters,
  DashboardGateway,
  DashboardGranularity,
  DashboardSummary,
  DashboardTrendBucket,
  DashboardTrends
} from "../types/dashboard";
import type { TicketPriority, TicketStatus, TicketSummary } from "../types/tickets";

const statusOrder: readonly TicketStatus[] = [
  "OPEN",
  "TRIAGED",
  "IN_PROGRESS",
  "WAITING_ON_REQUESTER",
  "RESOLVED",
  "CLOSED"
];

const priorityOrder: readonly TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

type RestDashboardGatewayOptions = {
  baseUrl?: string;
  getAccessToken?: () => string | null;
};

function emptyStatusDistribution(): Record<TicketStatus, number> {
  return {
    OPEN: 0,
    TRIAGED: 0,
    IN_PROGRESS: 0,
    WAITING_ON_REQUESTER: 0,
    RESOLVED: 0,
    CLOSED: 0
  };
}

function emptyPriorityDistribution(): Record<TicketPriority, number> {
  return {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0
  };
}

function emptyCategoryDistribution(): Record<string, number> {
  return Object.fromEntries(ticketCategories.map((category) => [category.id, 0]));
}

function parseFilterDate(value: string, fallback: Date) {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function isInRange(ticket: TicketSummary, filters: DashboardFilters) {
  const createdAt = new Date(ticket.createdAt);
  const from = parseFilterDate(filters.from, new Date("1970-01-01T00:00:00Z"));
  const to = parseFilterDate(filters.to, new Date("9999-12-31T23:59:59Z"));

  return createdAt >= from && createdAt <= to;
}

function toBucketKey(value: string, granularity: DashboardGranularity) {
  const date = new Date(value);

  if (granularity === "WEEKLY") {
    const day = date.getUTCDay();
    const distanceFromMonday = (day + 6) % 7;
    date.setUTCDate(date.getUTCDate() - distanceFromMonday);
  }

  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

function buildSummary(tickets: readonly TicketSummary[]): DashboardSummary {
  const statusDistribution = emptyStatusDistribution();
  const priorityDistribution = emptyPriorityDistribution();
  const categoryDistribution = emptyCategoryDistribution();

  tickets.forEach((ticket) => {
    statusDistribution[ticket.status] += 1;
    priorityDistribution[ticket.priority] += 1;
    categoryDistribution[ticket.categoryId] = (categoryDistribution[ticket.categoryId] ?? 0) + 1;
  });

  return {
    totalTickets: tickets.length,
    openTickets: statusDistribution.OPEN,
    inProgressTickets: statusDistribution.IN_PROGRESS,
    resolvedTickets: statusDistribution.RESOLVED,
    closedTickets: statusDistribution.CLOSED,
    statusDistribution,
    categoryDistribution,
    priorityDistribution
  };
}

function buildTrends(
  tickets: readonly TicketSummary[],
  granularity: DashboardGranularity
): DashboardTrends {
  const buckets = new Map<string, DashboardTrendBucket>();

  tickets.forEach((ticket) => {
    const bucketStart = toBucketKey(ticket.createdAt, granularity);
    const current = buckets.get(bucketStart) ?? {
      bucketStart,
      createdTickets: 0,
      statusMovements: 0
    };

    buckets.set(bucketStart, {
      ...current,
      createdTickets: current.createdTickets + 1,
      statusMovements: current.statusMovements + (ticket.status === "OPEN" ? 0 : 1)
    });
  });

  return {
    granularity,
    buckets: Array.from(buckets.values()).sort((left, right) =>
      left.bucketStart.localeCompare(right.bucketStart)
    )
  };
}

function createSearchParams(filters: DashboardFilters) {
  const params = new URLSearchParams();

  if (filters.from) {
    params.set("from", new Date(filters.from).toISOString());
  }

  if (filters.to) {
    params.set("to", new Date(filters.to).toISOString());
  }

  params.set("granularity", filters.granularity);
  return params;
}

async function requestJson<T>(
  path: string,
  options: RestDashboardGatewayOptions,
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
    throw new Error(`Dashboard API request failed with ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function createDemoDashboardGateway(
  initialTickets: readonly TicketSummary[] = demoTickets
): DashboardGateway {
  return {
    async getSummary(filters) {
      return buildSummary(initialTickets.filter((ticket) => isInRange(ticket, filters)));
    },
    async getTrends(filters) {
      return buildTrends(
        initialTickets.filter((ticket) => isInRange(ticket, filters)),
        filters.granularity
      );
    }
  };
}

export function createRestDashboardGateway(
  options: RestDashboardGatewayOptions = {}
): DashboardGateway {
  return {
    getSummary(filters) {
      const params = createSearchParams(filters);
      params.delete("granularity");
      return requestJson<DashboardSummary>(`/api/dashboard/summary?${params}`, options);
    },
    getTrends(filters) {
      return requestJson<DashboardTrends>(
        `/api/dashboard/trends?${createSearchParams(filters)}`,
        options
      );
    }
  };
}

export { priorityOrder, statusOrder };

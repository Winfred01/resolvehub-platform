import type { TicketPriority, TicketStatus } from "./tickets";

export type DashboardGranularity = "DAILY" | "WEEKLY";

export type DashboardSummary = {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  statusDistribution: Record<TicketStatus, number>;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<TicketPriority, number>;
};

export type DashboardTrendBucket = {
  bucketStart: string;
  createdTickets: number;
  statusMovements: number;
};

export type DashboardTrends = {
  granularity: DashboardGranularity;
  buckets: DashboardTrendBucket[];
};

export type DashboardFilters = {
  from: string;
  to: string;
  granularity: DashboardGranularity;
};

export type DashboardGateway = {
  getSummary(filters: DashboardFilters): Promise<DashboardSummary>;
  getTrends(filters: DashboardFilters): Promise<DashboardTrends>;
};

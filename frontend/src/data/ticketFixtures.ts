import type { TicketCategory, TicketSummary } from "../types/tickets";

export const ticketCategories: readonly TicketCategory[] = [
  { id: "account-access", name: "Account access" },
  { id: "billing", name: "Billing" },
  { id: "general", name: "General" },
  { id: "hardware", name: "Hardware" },
  { id: "network", name: "Network" },
  { id: "privacy", name: "Privacy" },
  { id: "workflow", name: "Workflow" }
];

export const demoTickets: readonly TicketSummary[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Cannot access shared support queue",
    description:
      "A requester can sign in but cannot see tickets assigned to their support group.",
    categoryId: "account-access",
    priority: "HIGH",
    status: "OPEN",
    version: 1,
    requesterId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    currentAssigneeId: null,
    createdAt: "2026-08-09T12:10:00Z",
    updatedAt: "2026-08-09T12:10:00Z"
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "VPN drops during ticket handoff",
    description:
      "An agent loses the secure connection after switching between queue filters.",
    categoryId: "network",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    version: 3,
    requesterId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    currentAssigneeId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    createdAt: "2026-08-08T18:30:00Z",
    updatedAt: "2026-08-09T09:15:00Z"
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Workflow approval email missing",
    description:
      "A team lead needs an audit-safe way to confirm approval notifications.",
    categoryId: "workflow",
    priority: "LOW",
    status: "TRIAGED",
    version: 2,
    requesterId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    currentAssigneeId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    createdAt: "2026-08-07T14:45:00Z",
    updatedAt: "2026-08-08T10:00:00Z"
  }
];


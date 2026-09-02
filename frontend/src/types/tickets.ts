export type TicketStatus =
  | "OPEN"
  | "TRIAGED"
  | "IN_PROGRESS"
  | "WAITING_ON_REQUESTER"
  | "RESOLVED"
  | "CLOSED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TicketCategory = {
  id: string;
  name: string;
};

export type TicketSummary = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priority: TicketPriority;
  status: TicketStatus;
  version: number;
  requesterId: string;
  currentAssigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketPage = {
  content: TicketSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  empty: boolean;
};

export type TicketFilters = {
  q: string;
  status: "" | TicketStatus;
  priority: "" | TicketPriority;
  categoryId: string;
};

export type CreateTicketInput = {
  title: string;
  description: string;
  categoryId: string;
  priority: TicketPriority;
};

export type UpdateTicketInput = Partial<CreateTicketInput> & {
  status?: TicketStatus;
  version?: number;
};

export type TicketTriageSuggestion = {
  categoryId: string;
  priority: TicketPriority;
  confidence: number;
  explanation: string[];
  lowConfidence: boolean;
  advisory: boolean;
};

export type TicketDuplicateCandidateSuggestion = {
  candidateId: string;
  confidence: number;
  matchingSignals: string[];
  explanation: string[];
};

export type TicketDuplicateSuggestion = {
  candidates: TicketDuplicateCandidateSuggestion[];
  lowConfidence: boolean;
  advisory: boolean;
};

export type TicketAnalyticsSuggestion = {
  advisory: boolean;
  analyticsAvailable: boolean;
  triage: TicketTriageSuggestion;
  duplicates: TicketDuplicateSuggestion;
};

export type TicketSuggestionType = "TRIAGE" | "DUPLICATE";

export type TicketSuggestionDecision = "ACCEPT" | "IGNORE" | "OVERRIDE";

export type TicketSuggestionReviewInput = {
  suggestionType: TicketSuggestionType;
  decision: TicketSuggestionDecision;
  categoryId?: string;
  priority?: TicketPriority;
  duplicateTicketId?: string;
};

export type TicketSuggestionReview = TicketSuggestionReviewInput & {
  ticketId: string;
  recordedFields: string[];
  recordedAt: string;
  advisory: boolean;
};

export type TicketGateway = {
  listTickets(filters: TicketFilters): Promise<TicketPage>;
  getTicket(id: string): Promise<TicketSummary>;
  createTicket(input: CreateTicketInput): Promise<TicketSummary>;
  updateTicket(id: string, input: UpdateTicketInput): Promise<TicketSummary>;
  getAnalyticsSuggestions(id: string): Promise<TicketAnalyticsSuggestion>;
  reviewAnalyticsSuggestion(id: string, input: TicketSuggestionReviewInput): Promise<TicketSuggestionReview>;
};


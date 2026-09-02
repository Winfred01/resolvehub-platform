import { FormEvent, useEffect, useMemo, useState } from "react";
import { createDemoTicketGateway } from "../api/ticketGateway";
import { ticketCategories } from "../data/ticketFixtures";
import type {
  CreateTicketInput,
  TicketAnalyticsSuggestion,
  TicketFilters,
  TicketGateway,
  TicketPriority,
  TicketSuggestionReviewInput,
  TicketStatus,
  TicketSummary,
  UpdateTicketInput
} from "../types/tickets";

const ticketGateway = createDemoTicketGateway();

const defaultFilters: TicketFilters = {
  q: "",
  status: "",
  priority: "",
  categoryId: ""
};

const statusLabels: Record<TicketStatus, string> = {
  OPEN: "Open",
  TRIAGED: "Triaged",
  IN_PROGRESS: "In progress",
  WAITING_ON_REQUESTER: "Waiting on requester",
  RESOLVED: "Resolved",
  CLOSED: "Closed"
};

const priorityLabels: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent"
};
const statusColumns: readonly TicketStatus[] = [
  "OPEN",
  "TRIAGED",
  "IN_PROGRESS",
  "WAITING_ON_REQUESTER",
  "RESOLVED",
  "CLOSED"
];

const statusTransitions: Readonly<Record<TicketStatus, readonly TicketStatus[]>> = {
  OPEN: ["TRIAGED", "IN_PROGRESS", "WAITING_ON_REQUESTER"],
  TRIAGED: ["IN_PROGRESS", "WAITING_ON_REQUESTER", "RESOLVED"],
  IN_PROGRESS: ["WAITING_ON_REQUESTER", "RESOLVED"],
  WAITING_ON_REQUESTER: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["IN_PROGRESS", "CLOSED"],
  CLOSED: []
};

type TicketsPageProps = {
  gateway?: TicketGateway;
};

type FormState = {
  title: string;
  description: string;
  categoryId: string;
  priority: TicketPriority;
  status: TicketStatus;
};

type ViewState = "loading" | "ready" | "error";
type SuggestionState = "idle" | "loading" | "ready" | "error";

const blankForm: FormState = {
  title: "",
  description: "",
  categoryId: "general",
  priority: "MEDIUM",
  status: "OPEN"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function getCategoryName(categoryId: string) {
  return ticketCategories.find((category) => category.id === categoryId)?.name ?? categoryId;
}

function validateTicketForm(form: FormState) {
  const errors: string[] = [];

  if (!form.title.trim()) {
    errors.push("Title is required.");
  }

  if (form.title.trim().length > 120) {
    errors.push("Title must be 120 characters or fewer.");
  }

  if (!form.description.trim()) {
    errors.push("Description is required.");
  }

  if (form.description.trim().length > 4000) {
    errors.push("Description must be 4000 characters or fewer.");
  }

  if (!ticketCategories.some((category) => category.id === form.categoryId)) {
    errors.push("Category is required.");
  }

  return errors;
}

export function TicketsPage({ gateway = ticketGateway }: TicketsPageProps) {
  const [filters, setFilters] = useState<TicketFilters>(defaultFilters);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(blankForm);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [pendingStatusById, setPendingStatusById] = useState<Record<string, TicketStatus>>({});
  const [kanbanError, setKanbanError] = useState("");
  const [movingTicketId, setMovingTicketId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<TicketAnalyticsSuggestion | null>(null);
  const [suggestionState, setSuggestionState] = useState<SuggestionState>("idle");
  const [suggestionTicketId, setSuggestionTicketId] = useState<string | null>(null);
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [reviewingSuggestion, setReviewingSuggestion] = useState(false);

  async function loadTickets(nextFilters = filters, shouldShowLoading = true) {
    if (shouldShowLoading) {
      setViewState("loading");
    }
    setErrorMessage("");

    try {
      const page = await gateway.listTickets(nextFilters);
      setTickets(page.content);
      setSelectedId((currentSelectedId) => page.content[0]?.id ?? currentSelectedId);
      setViewState("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Ticket workspace failed to load.");
      setViewState("error");
    }
  }

  useEffect(() => {
    let active = true;

    gateway
      .listTickets(defaultFilters)
      .then((page) => {
        if (active) {
          setTickets(page.content);
          setSelectedId(page.content[0]?.id ?? null);
          setViewState("ready");
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Ticket workspace failed to load.");
          setViewState("error");
        }
      });

    return () => {
      active = false;
    };
  }, [gateway]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? null,
    [selectedId, tickets]
  );

  useEffect(() => {
    let active = true;

    if (!selectedTicket) {
      return () => {
        active = false;
      };
    }

    gateway
      .getAnalyticsSuggestions(selectedTicket.id)
      .then((nextSuggestions) => {
        if (active) {
          setSuggestionTicketId(selectedTicket.id);
          setSuggestions(nextSuggestions);
          setSuggestionState("ready");
          setSuggestionMessage("");
        }
      })
      .catch((error) => {
        if (active) {
          setSuggestionTicketId(selectedTicket.id);
          setSuggestions(null);
          setSuggestionMessage(
            error instanceof Error
              ? error.message
              : "Analytics suggestions unavailable. Ticket workflow remains available."
          );
          setSuggestionState("error");
        }
      });

    return () => {
      active = false;
    };
  }, [gateway, selectedTicket]);

  const ticketCountLabel = useMemo(() => {
    if (viewState === "loading") {
      return "Loading tickets";
    }

    if (tickets.length === 1) {
      return "1 ticket";
    }

    return `${tickets.length} tickets`;
  }, [tickets.length, viewState]);
  const selectedSuggestionState: SuggestionState = !selectedTicket
    ? "idle"
    : suggestionTicketId === selectedTicket.id
      ? suggestionState
      : "loading";
  const selectedSuggestions = suggestionTicketId === selectedTicket?.id ? suggestions : null;
  const selectedSuggestionMessage = suggestionTicketId === selectedTicket?.id ? suggestionMessage : "";
  const ticketsByStatus = useMemo(
    () =>
      statusColumns.reduce<Record<TicketStatus, TicketSummary[]>>(
        (columns, status) => ({
          ...columns,
          [status]: tickets.filter((ticket) => ticket.status === status)
        }),
        {
          OPEN: [],
          TRIAGED: [],
          IN_PROGRESS: [],
          WAITING_ON_REQUESTER: [],
          RESOLVED: [],
          CLOSED: []
        }
      ),
    [tickets]
  );

  function updateFilter<K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function selectForEdit(ticket: TicketSummary) {
    setSelectedId(ticket.id);
    setFormMode("edit");
    setForm({
      title: ticket.title,
      description: ticket.description,
      categoryId: ticket.categoryId,
      priority: ticket.priority,
      status: ticket.status
    });
    setFormErrors([]);
  }

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadTickets(filters);
  }

  async function handleTicketSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateTicketForm(form);

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const input: CreateTicketInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      priority: form.priority
    };

    try {
      const savedTicket =
        formMode === "create" || !selectedTicket
          ? await gateway.createTicket(input)
          : await gateway.updateTicket(selectedTicket.id, {
              ...input,
              status: form.status,
              version: selectedTicket.version
            } satisfies UpdateTicketInput);

      setSelectedId(savedTicket.id);
      setForm(formMode === "create" ? blankForm : { ...form, status: savedTicket.status });
      setFormErrors([]);
      await loadTickets(filters, false);
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : "Ticket could not be saved."]);
    }
  }

  function updatePendingStatus(ticketId: string, status: TicketStatus) {
    setPendingStatusById((current) => ({ ...current, [ticketId]: status }));
    setKanbanError("");
  }

  function canMoveTicket(ticket: TicketSummary, nextStatus: TicketStatus) {
    return statusTransitions[ticket.status].includes(nextStatus);
  }

  async function handleKanbanStatusSubmit(ticket: TicketSummary) {
    const nextStatus = pendingStatusById[ticket.id] ?? ticket.status;

    if (!canMoveTicket(ticket, nextStatus)) {
      setKanbanError(
        `${ticket.title} cannot move from ${statusLabels[ticket.status]} to ${statusLabels[nextStatus]}.`
      );
      return;
    }

    setMovingTicketId(ticket.id);
    setKanbanError("");

    try {
      const updatedTicket = await gateway.updateTicket(ticket.id, {
        status: nextStatus,
        version: ticket.version
      });

      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) =>
          currentTicket.id === updatedTicket.id ? updatedTicket : currentTicket
        )
      );
      setSelectedId(updatedTicket.id);
      setPendingStatusById((current) => {
        const remaining = { ...current };
        delete remaining[ticket.id];
        return remaining;
      });
    } catch (error) {
      setPendingStatusById((current) => ({ ...current, [ticket.id]: ticket.status }));
      setKanbanError(error instanceof Error ? error.message : "Ticket status could not be updated.");
    } finally {
      setMovingTicketId(null);
    }
  }

  async function recordSuggestionReview(input: TicketSuggestionReviewInput) {
    if (!selectedTicket) {
      return;
    }

    setReviewingSuggestion(true);
    setSuggestionMessage("");

    try {
      await gateway.reviewAnalyticsSuggestion(selectedTicket.id, input);
      setSuggestionMessage(`${input.decision.toLocaleLowerCase()} review recorded for ${input.suggestionType.toLocaleLowerCase()}.`);
    } catch (error) {
      setSuggestionMessage(error instanceof Error ? error.message : "Suggestion review could not be recorded.");
    } finally {
      setReviewingSuggestion(false);
    }
  }

  function stageTriageSuggestion(field: "category" | "priority") {
    if (!selectedTicket || !selectedSuggestions) {
      return;
    }

    const nextForm: FormState = {
      title: selectedTicket.title,
      description: selectedTicket.description,
      categoryId: field === "category" ? selectedSuggestions.triage.categoryId : selectedTicket.categoryId,
      priority: field === "priority" ? selectedSuggestions.triage.priority : selectedTicket.priority,
      status: selectedTicket.status
    };

    setFormMode("edit");
    setForm(nextForm);
    setFormErrors([]);
    void recordSuggestionReview({
      suggestionType: "TRIAGE",
      decision: "ACCEPT",
      categoryId: nextForm.categoryId,
      priority: nextForm.priority
    });
  }

  function overrideTriageSuggestion() {
    if (!selectedTicket) {
      return;
    }

    void recordSuggestionReview({
      suggestionType: "TRIAGE",
      decision: "OVERRIDE",
      categoryId: formMode === "edit" ? form.categoryId : selectedTicket.categoryId,
      priority: formMode === "edit" ? form.priority : selectedTicket.priority
    });
  }

  function acceptDuplicateSuggestion(candidateId: string) {
    void recordSuggestionReview({
      suggestionType: "DUPLICATE",
      decision: "ACCEPT",
      duplicateTicketId: candidateId
    });
  }
  return (
    <section className="ticket-workspace" aria-labelledby="tickets-heading">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Ticket workspace</p>
          <h1 id="tickets-heading">Support tickets</h1>
        </div>
        <p className="ticket-count" aria-live="polite">
          {ticketCountLabel}
        </p>
      </div>

      <form className="ticket-filters" aria-label="Ticket filters" onSubmit={handleFilterSubmit}>
        <label>
          Search
          <input
            type="search"
            value={filters.q}
            maxLength={120}
            onChange={(event) => updateFilter("q", event.target.value)}
          />
        </label>
        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value as TicketFilters["status"])}
          >
            <option value="">Any status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select
            value={filters.priority}
            onChange={(event) =>
              updateFilter("priority", event.target.value as TicketFilters["priority"])
            }
          >
            <option value="">Any priority</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            value={filters.categoryId}
            onChange={(event) => updateFilter("categoryId", event.target.value)}
          >
            <option value="">Any category</option>
            {ticketCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Apply filters</button>
      </form>

      {viewState === "ready" ? (
        <section className="kanban-panel" aria-labelledby="kanban-heading">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Kanban workflow</p>
              <h2 id="kanban-heading">Status board</h2>
            </div>
            <p className="kanban-note">Updates use explicit controls for keyboard access.</p>
          </div>
          {kanbanError ? (
            <div className="form-errors" role="alert">
              <p>{kanbanError}</p>
            </div>
          ) : null}
          <div className="kanban-board" aria-label="Tickets grouped by status">
            {statusColumns.map((status) => (
              <section className="kanban-column" key={status} aria-labelledby={`kanban-${status}`}>
                <div className="kanban-column-heading">
                  <h3 id={`kanban-${status}`}>{statusLabels[status]}</h3>
                  <span>{ticketsByStatus[status].length}</span>
                </div>
                {ticketsByStatus[status].length === 0 ? (
                  <p className="kanban-empty">No tickets</p>
                ) : (
                  <ul className="kanban-list">
                    {ticketsByStatus[status].map((ticket) => {
                      const pendingStatus = pendingStatusById[ticket.id] ?? ticket.status;
                      const isNewStatus = pendingStatus !== ticket.status;
                      const canSubmit = isNewStatus && canMoveTicket(ticket, pendingStatus);

                      return (
                        <li key={ticket.id}>
                          <article className="kanban-card" aria-label={`Kanban card ${ticket.title}`}>
                            <h4 id={`kanban-card-${ticket.id}`}>{ticket.title}</h4>
                            <p>{getCategoryName(ticket.categoryId)}</p>
                            <span className={`pill priority-${ticket.priority.toLowerCase()}`}>
                              {priorityLabels[ticket.priority]}
                            </span>
                            <div className="kanban-move-controls">
                              <label>
                                Move status
                                <select
                                  value={pendingStatus}
                                  onChange={(event) =>
                                    updatePendingStatus(ticket.id, event.target.value as TicketStatus)
                                  }
                                >
                                  {statusColumns.map((nextStatus) => (
                                    <option
                                      key={nextStatus}
                                      value={nextStatus}
                                      disabled={nextStatus !== ticket.status && !canMoveTicket(ticket, nextStatus)}
                                    >
                                      {statusLabels[nextStatus]}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <button
                                type="button"
                                disabled={!canSubmit || movingTicketId === ticket.id}
                                onClick={() => void handleKanbanStatusSubmit(ticket)}
                              >
                                {movingTicketId === ticket.id ? "Moving" : "Apply"}
                              </button>
                            </div>
                            {isNewStatus && !canSubmit ? (
                              <p className="transition-note">Transition unavailable for this role.</p>
                            ) : null}
                          </article>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </section>
      ) : null}

      {viewState === "error" ? (
        <div className="state-panel" role="alert">
          <h2>Ticket workspace unavailable</h2>
          <p>{errorMessage}</p>
          <button type="button" onClick={() => void loadTickets(filters)}>
            Retry
          </button>
        </div>
      ) : (
        <div className="ticket-grid">
          <div className="ticket-list-panel" aria-live="polite">
            {viewState === "loading" ? (
              <div className="state-panel">
                <h2>Loading tickets</h2>
              </div>
            ) : tickets.length === 0 ? (
              <div className="state-panel">
                <h2>No tickets match these filters</h2>
              </div>
            ) : (
              <ul className="ticket-list" aria-label="Ticket list">
                {tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      className={ticket.id === selectedId ? "ticket-row ticket-row-active" : "ticket-row"}
                      onClick={() => setSelectedId(ticket.id)}
                    >
                      <span>
                        <strong>{ticket.title}</strong>
                        <span>{getCategoryName(ticket.categoryId)}</span>
                      </span>
                      <span className="ticket-row-meta">
                        <span className={`pill priority-${ticket.priority.toLowerCase()}`}>
                          {priorityLabels[ticket.priority]}
                        </span>
                        <span>{statusLabels[ticket.status]}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <article className="ticket-detail-panel" aria-labelledby="ticket-detail-heading">
            {selectedTicket ? (
              <>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">{getCategoryName(selectedTicket.categoryId)}</p>
                    <h2 id="ticket-detail-heading">{selectedTicket.title}</h2>
                  </div>
                  <button type="button" onClick={() => selectForEdit(selectedTicket)}>
                    Edit ticket
                  </button>
                </div>
                <dl className="ticket-metadata">
                  <div>
                    <dt>Status</dt>
                    <dd>{statusLabels[selectedTicket.status]}</dd>
                  </div>
                  <div>
                    <dt>Priority</dt>
                    <dd>{priorityLabels[selectedTicket.priority]}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatDate(selectedTicket.updatedAt)}</dd>
                  </div>
                  <div>
                    <dt>Version</dt>
                    <dd>{selectedTicket.version}</dd>
                  </div>
                </dl>
                <p className="ticket-description">{selectedTicket.description}</p>
                <section className="suggestion-panel" aria-labelledby="analytics-suggestions-heading">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Advisory analytics</p>
                      <h3 id="analytics-suggestions-heading">Suggestions</h3>
                    </div>
                    <span className="pill">Human review</span>
                  </div>
                  {selectedSuggestionState === "loading" ? (
                    <p className="suggestion-note">Loading suggestions</p>
                  ) : null}
                  {selectedSuggestionState === "error" ? (
                    <p className="suggestion-note" role="status">
                      {selectedSuggestionMessage}
                    </p>
                  ) : null}
                  {selectedSuggestionState === "ready" && selectedSuggestions ? (
                    <div className="suggestion-stack">
                      {!selectedSuggestions.analyticsAvailable ? (
                        <p className="suggestion-note">
                          Analytics service unavailable; current ticket values are preserved.
                        </p>
                      ) : null}
                      <article className="suggestion-card" aria-label="Triage suggestion">
                        <div>
                          <h4>Triage suggestion</h4>
                          <p>
                            {getCategoryName(selectedSuggestions.triage.categoryId)} /{" "}
                            {priorityLabels[selectedSuggestions.triage.priority]} /{" "}
                            {Math.round(selectedSuggestions.triage.confidence * 100)}% confidence
                          </p>
                        </div>
                        <ul>
                          {selectedSuggestions.triage.explanation.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        {selectedSuggestions.triage.lowConfidence ? (
                          <p className="suggestion-note">Low confidence</p>
                        ) : null}
                        <div className="suggestion-actions">
                          <button
                            type="button"
                            disabled={reviewingSuggestion}
                            onClick={() => stageTriageSuggestion("category")}
                          >
                            Accept category
                          </button>
                          <button
                            type="button"
                            disabled={reviewingSuggestion}
                            onClick={() => stageTriageSuggestion("priority")}
                          >
                            Accept priority
                          </button>
                          <button
                            type="button"
                            disabled={reviewingSuggestion}
                            onClick={overrideTriageSuggestion}
                          >
                            Override
                          </button>
                          <button
                            type="button"
                            disabled={reviewingSuggestion}
                            onClick={() =>
                              void recordSuggestionReview({
                                suggestionType: "TRIAGE",
                                decision: "IGNORE"
                              })
                            }
                          >
                            Ignore
                          </button>
                        </div>
                      </article>
                      <article className="suggestion-card" aria-label="Duplicate suggestions">
                        <div>
                          <h4>Duplicate suggestions</h4>
                          <p>
                            {selectedSuggestions.duplicates.candidates.length === 0
                              ? "No candidates"
                              : `${selectedSuggestions.duplicates.candidates.length} candidates`}
                          </p>
                        </div>
                        {selectedSuggestions.duplicates.candidates.length > 0 ? (
                          <ul className="duplicate-list">
                            {selectedSuggestions.duplicates.candidates.map((candidate) => (
                              <li key={candidate.candidateId}>
                                <span>{Math.round(candidate.confidence * 100)}% confidence</span>
                                <span>{candidate.matchingSignals.join(", ")}</span>
                                <button
                                  type="button"
                                  disabled={reviewingSuggestion}
                                  onClick={() => acceptDuplicateSuggestion(candidate.candidateId)}
                                >
                                  Accept duplicate
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <div className="suggestion-actions">
                          <button
                            type="button"
                            disabled={reviewingSuggestion}
                            onClick={() =>
                              void recordSuggestionReview({
                                suggestionType: "DUPLICATE",
                                decision: "IGNORE"
                              })
                            }
                          >
                            Ignore duplicates
                          </button>
                        </div>
                      </article>
                    </div>
                  ) : null}
                  {selectedSuggestionMessage && selectedSuggestionState !== "error" ? (
                    <p className="suggestion-note" role="status">
                      {selectedSuggestionMessage}
                    </p>
                  ) : null}
                </section>
              </>
            ) : (
              <div className="state-panel">
                <h2 id="ticket-detail-heading">No ticket selected</h2>
              </div>
            )}
          </article>

          <section className="ticket-form-panel" aria-labelledby="ticket-form-heading">
            <div className="panel-heading">
              <h2 id="ticket-form-heading">
                {formMode === "create" ? "Create ticket" : "Edit ticket"}
              </h2>
              {formMode === "edit" ? (
                <button
                  type="button"
                  onClick={() => {
                    setFormMode("create");
                    setForm(blankForm);
                    setFormErrors([]);
                  }}
                >
                  New ticket
                </button>
              ) : null}
            </div>
            {formErrors.length > 0 ? (
              <div className="form-errors" role="alert">
                {formErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            ) : null}
            <form className="ticket-form" onSubmit={handleTicketSubmit}>
              <label>
                Title
                <input
                  value={form.title}
                  maxLength={120}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  maxLength={4000}
                  rows={5}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>
              <div className="form-row">
                <label>
                  Category
                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, categoryId: event.target.value }))
                    }
                  >
                    {ticketCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Priority
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priority: event.target.value as TicketPriority
                      }))
                    }
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {formMode === "edit" ? (
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as TicketStatus
                      }))
                    }
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button type="submit">
                {formMode === "create" ? "Create ticket" : "Save ticket"}
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createDemoTicketGateway } from "../api/ticketGateway";
import { ticketCategories } from "../data/ticketFixtures";
import type {
  CreateTicketInput,
  TicketFilters,
  TicketGateway,
  TicketPriority,
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

  const ticketCountLabel = useMemo(() => {
    if (viewState === "loading") {
      return "Loading tickets";
    }

    if (tickets.length === 1) {
      return "1 ticket";
    }

    return `${tickets.length} tickets`;
  }, [tickets.length, viewState]);

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

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createDemoDashboardGateway,
  priorityOrder,
  statusOrder
} from "../api/dashboardGateway";
import { ticketCategories } from "../data/ticketFixtures";
import type {
  DashboardFilters,
  DashboardGateway,
  DashboardGranularity,
  DashboardSummary,
  DashboardTrendBucket,
  DashboardTrends
} from "../types/dashboard";
import type { TicketPriority, TicketStatus } from "../types/tickets";

const dashboardGateway = createDemoDashboardGateway();

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

type DashboardPageProps = {
  gateway?: DashboardGateway;
};

type ViewState = "loading" | "ready" | "error";

const defaultFilters: DashboardFilters = {
  from: "2026-08-01",
  to: "2026-08-31",
  granularity: "DAILY"
};

function formatBucketDate(value: string, granularity: DashboardGranularity) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    ...(granularity === "WEEKLY" ? {} : { weekday: "short" })
  }).format(new Date(value));
}

function getCategoryName(categoryId: string) {
  return ticketCategories.find((category) => category.id === categoryId)?.name ?? categoryId;
}

function getMaxValue(values: readonly number[]) {
  return Math.max(1, ...values);
}

function BarValue({
  label,
  value,
  maxValue
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const width = `${Math.max(4, Math.round((value / maxValue) * 100))}%`;

  return (
    <div className="dashboard-bar-row">
      <span>{label}</span>
      <span className="dashboard-bar-track" aria-hidden="true">
        <span className="dashboard-bar-fill" style={{ width }} />
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function DistributionChart({
  title,
  values
}: {
  title: string;
  values: readonly { label: string; value: number }[];
}) {
  const maxValue = getMaxValue(values.map((item) => item.value));

  return (
    <section className="dashboard-chart" aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`}>{title}</h2>
      <div className="dashboard-bars" aria-label={`${title} distribution`}>
        {values.map((item) => (
          <BarValue key={item.label} label={item.label} value={item.value} maxValue={maxValue} />
        ))}
      </div>
    </section>
  );
}

function TrendChart({
  buckets,
  granularity
}: {
  buckets: readonly DashboardTrendBucket[];
  granularity: DashboardGranularity;
}) {
  const maxValue = getMaxValue(
    buckets.map((bucket) => bucket.createdTickets + bucket.statusMovements)
  );

  return (
    <section className="dashboard-chart dashboard-trend-chart" aria-labelledby="trend-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Trend</p>
          <h2 id="trend-heading">Ticket volume</h2>
        </div>
        <p className="dashboard-note">{granularity === "WEEKLY" ? "Weekly buckets" : "Daily buckets"}</p>
      </div>
      {buckets.length === 0 ? (
        <p className="dashboard-empty">No trend buckets in this range.</p>
      ) : (
        <div className="trend-bars" aria-label="Created tickets and status movements">
          {buckets.map((bucket) => {
            const createdHeight = `${Math.max(8, Math.round((bucket.createdTickets / maxValue) * 100))}%`;
            const movementHeight = `${Math.max(8, Math.round((bucket.statusMovements / maxValue) * 100))}%`;

            return (
              <div className="trend-column" key={bucket.bucketStart}>
                <div className="trend-column-bars" aria-hidden="true">
                  <span className="trend-created" style={{ height: createdHeight }} />
                  <span className="trend-movement" style={{ height: movementHeight }} />
                </div>
                <span>{formatBucketDate(bucket.bucketStart, granularity)}</span>
                <strong>
                  {bucket.createdTickets} created, {bucket.statusMovements} moved
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function DashboardPage({ gateway = dashboardGateway }: DashboardPageProps) {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>(defaultFilters);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard(nextFilters: DashboardFilters) {
    setViewState("loading");
    setErrorMessage("");

    try {
      const [nextSummary, nextTrends] = await Promise.all([
        gateway.getSummary(nextFilters),
        gateway.getTrends(nextFilters)
      ]);

      setSummary(nextSummary);
      setTrends(nextTrends);
      setAppliedFilters(nextFilters);
      setViewState("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Dashboard metrics failed to load.");
      setViewState("error");
    }
  }

  useEffect(() => {
    let active = true;

    Promise.all([gateway.getSummary(defaultFilters), gateway.getTrends(defaultFilters)])
      .then(([nextSummary, nextTrends]) => {
        if (active) {
          setSummary(nextSummary);
          setTrends(nextTrends);
          setViewState("ready");
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Dashboard metrics failed to load.");
          setViewState("error");
        }
      });

    return () => {
      active = false;
    };
  }, [gateway]);

  const statusValues = useMemo(
    () =>
      statusOrder.map((status) => ({
        label: statusLabels[status],
        value: summary?.statusDistribution[status] ?? 0
      })),
    [summary]
  );

  const categoryValues = useMemo(
    () =>
      Object.entries(summary?.categoryDistribution ?? {})
        .filter(([, value]) => value > 0)
        .map(([categoryId, value]) => ({
          label: getCategoryName(categoryId),
          value
        })),
    [summary]
  );

  const priorityValues = useMemo(
    () =>
      priorityOrder.map((priority) => ({
        label: priorityLabels[priority],
        value: summary?.priorityDistribution[priority] ?? 0
      })),
    [summary]
  );

  function updateFilter<K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadDashboard(filters);
  }

  return (
    <section className="dashboard-workspace" aria-labelledby="dashboard-heading">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 id="dashboard-heading">Support dashboard</h1>
        </div>
        <p className="ticket-count" aria-live="polite">
          {viewState === "loading" ? "Loading metrics" : `${summary?.totalTickets ?? 0} tickets`}
        </p>
      </div>

      <form className="dashboard-filters" aria-label="Dashboard filters" onSubmit={handleSubmit}>
        <label>
          From
          <input
            type="date"
            value={filters.from}
            onChange={(event) => updateFilter("from", event.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={filters.to}
            onChange={(event) => updateFilter("to", event.target.value)}
          />
        </label>
        <label>
          Granularity
          <select
            value={filters.granularity}
            onChange={(event) =>
              updateFilter("granularity", event.target.value as DashboardGranularity)
            }
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </label>
        <button type="submit">Refresh dashboard</button>
      </form>

      {viewState === "error" ? (
        <div className="state-panel" role="alert">
          <h2>Dashboard unavailable</h2>
          <p>{errorMessage}</p>
          <button type="button" onClick={() => void loadDashboard(appliedFilters)}>
            Retry
          </button>
        </div>
      ) : null}

      {viewState === "loading" ? (
        <div className="state-panel">
          <h2>Loading dashboard metrics</h2>
        </div>
      ) : null}

      {viewState === "ready" && summary && trends ? (
        <>
          <section className="metric-grid" aria-label="Dashboard summary">
            <article className="metric-tile">
              <span>Total</span>
              <strong>{summary.totalTickets}</strong>
            </article>
            <article className="metric-tile">
              <span>Open</span>
              <strong>{summary.openTickets}</strong>
            </article>
            <article className="metric-tile">
              <span>In progress</span>
              <strong>{summary.inProgressTickets}</strong>
            </article>
            <article className="metric-tile">
              <span>Resolved</span>
              <strong>{summary.resolvedTickets}</strong>
            </article>
            <article className="metric-tile">
              <span>Closed</span>
              <strong>{summary.closedTickets}</strong>
            </article>
          </section>

          {summary.totalTickets === 0 ? (
            <div className="state-panel">
              <h2>No dashboard metrics in this range</h2>
              <p>Choose a wider date range to include fictional demo tickets.</p>
            </div>
          ) : (
            <div className="dashboard-grid">
              <DistributionChart title="Status" values={statusValues} />
              <DistributionChart
                title="Category"
                values={categoryValues.length > 0 ? categoryValues : [{ label: "No categories", value: 0 }]}
              />
              <DistributionChart title="Priority" values={priorityValues} />
              <TrendChart buckets={trends.buckets} granularity={trends.granularity} />
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

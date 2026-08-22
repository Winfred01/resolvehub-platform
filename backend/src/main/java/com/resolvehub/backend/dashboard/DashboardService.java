package com.resolvehub.backend.dashboard;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class DashboardService {

    private final JdbcTemplate jdbcTemplate;

    DashboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    DashboardSummaryResponse summary(DashboardDateRange dateRange) {
        List<TicketMetricRow> rows = jdbcTemplate.query(
                "select status, priority, category_id, created_at from tickets order by created_at, id",
                (resultSet, rowNumber) -> ticketMetricRow(resultSet))
                .stream()
                .filter(row -> dateRange.includes(row.createdAt()))
                .toList();

        Map<String, Long> statusDistribution = countBy(rows, TicketMetricRow::status);
        Map<String, Long> categoryDistribution = countBy(rows, TicketMetricRow::categoryId);
        Map<String, Long> priorityDistribution = countBy(rows, TicketMetricRow::priority);

        return new DashboardSummaryResponse(
                rows.size(),
                statusDistribution.getOrDefault("OPEN", 0L),
                statusDistribution.getOrDefault("IN_PROGRESS", 0L),
                statusDistribution.getOrDefault("RESOLVED", 0L),
                statusDistribution.getOrDefault("CLOSED", 0L),
                statusDistribution,
                categoryDistribution,
                priorityDistribution);
    }

    @Transactional(readOnly = true)
    DashboardTrendResponse trends(DashboardDateRange dateRange, DashboardGranularity granularity) {
        Map<String, MutableBucket> buckets = new TreeMap<>();
        for (Instant createdAt : timestamps(
                "select created_at from tickets order by created_at, id",
                dateRange)) {
            buckets.computeIfAbsent(bucketStart(createdAt, granularity), MutableBucket::new).createdTickets++;
        }
        for (Instant createdAt : timestamps(
                """
                select created_at
                from ticket_activities
                where action = 'TICKET_UPDATED'
                  and changed_fields like '%status%'
                order by created_at, id
                """,
                dateRange)) {
            buckets.computeIfAbsent(bucketStart(createdAt, granularity), MutableBucket::new).statusMovements++;
        }

        List<DashboardTrendBucketResponse> responses = new ArrayList<>();
        for (MutableBucket bucket : buckets.values()) {
            responses.add(new DashboardTrendBucketResponse(
                    bucket.bucketStart,
                    bucket.createdTickets,
                    bucket.statusMovements));
        }
        return new DashboardTrendResponse(granularity.name(), responses);
    }

    private List<Instant> timestamps(String sql, DashboardDateRange dateRange) {
        return jdbcTemplate.query(sql, (resultSet, rowNumber) -> instant(resultSet, "created_at"))
                .stream()
                .filter(dateRange::includes)
                .toList();
    }

    private String bucketStart(Instant instant, DashboardGranularity granularity) {
        LocalDate date = instant.atZone(ZoneOffset.UTC).toLocalDate();
        if (granularity == DashboardGranularity.WEEKLY) {
            date = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }
        return date.toString();
    }

    private TicketMetricRow ticketMetricRow(ResultSet resultSet) throws SQLException {
        return new TicketMetricRow(
                resultSet.getString("status"),
                resultSet.getString("priority"),
                resultSet.getString("category_id"),
                instant(resultSet, "created_at"));
    }

    private Instant instant(ResultSet resultSet, String column) throws SQLException {
        return resultSet.getTimestamp(column).toInstant();
    }

    private Map<String, Long> countBy(
            List<TicketMetricRow> rows,
            java.util.function.Function<TicketMetricRow, String> classifier) {
        Map<String, Long> counts = new TreeMap<>();
        for (TicketMetricRow row : rows) {
            counts.merge(classifier.apply(row), 1L, Long::sum);
        }
        return counts;
    }

    private record TicketMetricRow(String status, String priority, String categoryId, Instant createdAt) {
    }

    private static final class MutableBucket {
        private final String bucketStart;
        private long createdTickets;
        private long statusMovements;

        private MutableBucket(String bucketStart) {
            this.bucketStart = bucketStart;
        }
    }
}

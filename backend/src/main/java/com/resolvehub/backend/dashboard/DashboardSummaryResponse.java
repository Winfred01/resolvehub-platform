package com.resolvehub.backend.dashboard;

import java.util.Map;

public record DashboardSummaryResponse(
        long totalTickets,
        long openTickets,
        long inProgressTickets,
        long resolvedTickets,
        long closedTickets,
        Map<String, Long> statusDistribution,
        Map<String, Long> categoryDistribution,
        Map<String, Long> priorityDistribution
) {
}

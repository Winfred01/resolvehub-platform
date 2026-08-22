package com.resolvehub.backend.dashboard;

public record DashboardTrendBucketResponse(
        String bucketStart,
        long createdTickets,
        long statusMovements
) {
}

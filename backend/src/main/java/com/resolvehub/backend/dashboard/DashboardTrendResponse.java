package com.resolvehub.backend.dashboard;

import java.util.List;

public record DashboardTrendResponse(
        String granularity,
        List<DashboardTrendBucketResponse> buckets
) {
}

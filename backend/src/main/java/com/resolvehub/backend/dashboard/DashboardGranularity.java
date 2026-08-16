package com.resolvehub.backend.dashboard;

enum DashboardGranularity {
    DAILY,
    WEEKLY;

    static DashboardGranularity from(String value) {
        if (value == null || value.isBlank()) {
            return DAILY;
        }
        try {
            return DashboardGranularity.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new DashboardValidationException("Dashboard granularity must be DAILY or WEEKLY.");
        }
    }
}

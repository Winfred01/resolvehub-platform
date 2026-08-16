package com.resolvehub.backend.dashboard;

import java.time.Instant;

record DashboardDateRange(Instant from, Instant to) {

    static DashboardDateRange from(String from, String to) {
        Instant parsedFrom = parseInstant(from, "from");
        Instant parsedTo = parseInstant(to, "to");
        if (parsedFrom != null && parsedTo != null && parsedFrom.isAfter(parsedTo)) {
            throw new DashboardValidationException("Dashboard date range start must be before end.");
        }
        return new DashboardDateRange(parsedFrom, parsedTo);
    }

    boolean includes(Instant instant) {
        return (from == null || !instant.isBefore(from))
                && (to == null || !instant.isAfter(to));
    }

    private static Instant parseInstant(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(value);
        } catch (RuntimeException exception) {
            throw new DashboardValidationException("Dashboard " + fieldName + " must be an ISO-8601 instant.");
        }
    }
}

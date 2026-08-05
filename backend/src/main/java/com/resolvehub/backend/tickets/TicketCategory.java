package com.resolvehub.backend.tickets;

import java.util.List;
import java.util.Set;

record TicketCategory(String id, String name) {

    private static final List<TicketCategory> CATEGORIES = List.of(
            new TicketCategory("account-access", "Account Access"),
            new TicketCategory("billing", "Billing"),
            new TicketCategory("general", "General Support"),
            new TicketCategory("hardware", "Hardware"),
            new TicketCategory("network", "Network"),
            new TicketCategory("privacy", "Privacy"),
            new TicketCategory("workflow", "Workflow"));

    private static final Set<String> CATEGORY_IDS =
            CATEGORIES.stream().map(TicketCategory::id).collect(java.util.stream.Collectors.toUnmodifiableSet());

    static List<TicketCategory> all() {
        return CATEGORIES;
    }

    static boolean exists(String id) {
        return CATEGORY_IDS.contains(id);
    }
}

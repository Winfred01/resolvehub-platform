package com.resolvehub.backend.tickets;

public record TicketCategoryResponse(
        String id,
        String name
) {

    static TicketCategoryResponse from(TicketCategory category) {
        return new TicketCategoryResponse(category.id(), category.name());
    }
}

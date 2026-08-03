package com.resolvehub.backend.tickets;

import jakarta.validation.constraints.Size;

public record UpdateTicketRequest(
        @Size(max = 120)
        String title,

        @Size(max = 4000)
        String description,

        @Size(max = 80)
        String categoryId,

        TicketPriority priority,

        TicketStatus status,

        Long version
) {
    public UpdateTicketRequest {
        title = title == null ? null : title.trim();
        description = description == null ? null : description.trim();
        categoryId = categoryId == null ? null : categoryId.trim();
    }
}

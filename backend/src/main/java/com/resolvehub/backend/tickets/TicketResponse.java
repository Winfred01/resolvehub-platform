package com.resolvehub.backend.tickets;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String title,
        String description,
        String categoryId,
        TicketPriority priority,
        TicketStatus status,
        UUID requesterId,
        Instant createdAt,
        Instant updatedAt
) {

    static TicketResponse from(Ticket ticket) {
        return new TicketResponse(
                ticket.id(),
                ticket.title(),
                ticket.description(),
                ticket.categoryId(),
                ticket.priority(),
                ticket.status(),
                ticket.requesterId(),
                ticket.createdAt(),
                ticket.updatedAt());
    }
}

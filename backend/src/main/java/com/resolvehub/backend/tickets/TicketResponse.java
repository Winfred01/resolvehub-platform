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
        Long version,
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
                ticket.version(),
                ticket.requesterId(),
                ticket.createdAt(),
                ticket.updatedAt());
    }
}

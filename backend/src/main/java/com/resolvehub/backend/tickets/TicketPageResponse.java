package com.resolvehub.backend.tickets;

import java.util.List;
import org.springframework.data.domain.Page;

public record TicketPageResponse(
        List<TicketResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean empty
) {

    static TicketPageResponse from(Page<Ticket> tickets) {
        return new TicketPageResponse(
                tickets.getContent().stream().map(TicketResponse::from).toList(),
                tickets.getNumber(),
                tickets.getSize(),
                tickets.getTotalElements(),
                tickets.getTotalPages(),
                tickets.isEmpty());
    }
}

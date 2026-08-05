package com.resolvehub.backend.tickets;

import java.util.UUID;

public record TicketAssignmentRequest(
        UUID assigneeId,
        Long version
) {
}

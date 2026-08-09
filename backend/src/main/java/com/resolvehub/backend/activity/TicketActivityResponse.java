package com.resolvehub.backend.activity;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TicketActivityResponse(
        UUID id,
        UUID ticketId,
        UUID actorId,
        String action,
        List<String> changedFields,
        Instant createdAt
) {

    public static TicketActivityResponse from(TicketActivity activity) {
        return new TicketActivityResponse(
                activity.id(),
                activity.ticketId(),
                activity.actorId(),
                activity.action(),
                List.of(activity.changedFields().split(",")),
                activity.createdAt());
    }
}

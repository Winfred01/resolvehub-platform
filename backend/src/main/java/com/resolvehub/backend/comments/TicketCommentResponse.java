package com.resolvehub.backend.comments;

import java.time.Instant;
import java.util.UUID;

public record TicketCommentResponse(
        UUID id,
        UUID ticketId,
        UUID commenterId,
        String body,
        Instant createdAt,
        Instant updatedAt
) {

    public static TicketCommentResponse from(TicketComment comment) {
        return new TicketCommentResponse(
                comment.id(),
                comment.ticketId(),
                comment.authorId(),
                comment.body(),
                comment.createdAt(),
                comment.updatedAt());
    }
}

package com.resolvehub.backend.tickets;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TicketSuggestionReviewResponse(
        UUID ticketId,
        TicketSuggestionType suggestionType,
        TicketSuggestionDecision decision,
        List<String> recordedFields,
        Instant recordedAt,
        boolean advisory
) {
}

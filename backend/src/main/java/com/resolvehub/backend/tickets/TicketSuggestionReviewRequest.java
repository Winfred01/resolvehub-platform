package com.resolvehub.backend.tickets;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TicketSuggestionReviewRequest(
        @NotNull TicketSuggestionType suggestionType,
        @NotNull TicketSuggestionDecision decision,
        String categoryId,
        TicketPriority priority,
        UUID duplicateTicketId
) {
}

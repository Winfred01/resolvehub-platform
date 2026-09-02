package com.resolvehub.backend.tickets;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.List;
import java.util.UUID;

public record TicketAnalyticsSuggestionResponse(
        boolean advisory,
        boolean analyticsAvailable,
        TicketTriageSuggestionResponse triage,
        TicketDuplicateSuggestionResponse duplicates
) {
}

record TicketTriageSuggestionResponse(
        String categoryId,
        TicketPriority priority,
        double confidence,
        List<String> explanation,
        boolean lowConfidence,
        boolean advisory
) {
}

record TicketDuplicateSuggestionResponse(
        List<TicketDuplicateCandidateSuggestionResponse> candidates,
        boolean lowConfidence,
        boolean advisory
) {
}

record TicketDuplicateCandidateSuggestionResponse(
        @JsonAlias("candidate_id") UUID candidateId,
        double confidence,
        @JsonAlias("matching_signals") List<String> matchingSignals,
        List<String> explanation
) {
}

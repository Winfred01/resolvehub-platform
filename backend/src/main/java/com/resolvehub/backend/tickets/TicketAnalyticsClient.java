package com.resolvehub.backend.tickets;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.resolvehub.backend.config.BackendProperties;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
class TicketAnalyticsClient {

    private final RestClient restClient;

    TicketAnalyticsClient(RestClient.Builder restClientBuilder, BackendProperties properties) {
        this.restClient = restClientBuilder.baseUrl(properties.analyticsBaseUrl()).build();
    }

    TicketAnalyticsSuggestionResponse suggest(Ticket ticket, List<Ticket> candidates) {
        TriageAnalyticsResponse triage = null;
        DuplicateAnalyticsResponse duplicates = null;
        boolean available = true;

        try {
            triage = restClient
                    .post()
                    .uri("/analytics/suggestions/triage")
                    .body(new TriageAnalyticsRequest(ticket.title(), ticket.description()))
                    .retrieve()
                    .body(TriageAnalyticsResponse.class);
        } catch (RestClientException exception) {
            available = false;
        }

        try {
            duplicates = restClient
                    .post()
                    .uri("/analytics/suggestions/duplicates")
                    .body(DuplicateAnalyticsRequest.from(ticket, candidates))
                    .retrieve()
                    .body(DuplicateAnalyticsResponse.class);
        } catch (RestClientException exception) {
            available = false;
        }

        if (triage == null) {
            triage = TriageAnalyticsResponse.unavailable(ticket);
            available = false;
        }
        if (duplicates == null) {
            duplicates = DuplicateAnalyticsResponse.unavailable();
            available = false;
        }

        return new TicketAnalyticsSuggestionResponse(
                true,
                available,
                triage.toSuggestion(),
                duplicates.toSuggestion());
    }

    record TriageAnalyticsRequest(String title, String description) {
    }

    record TriageAnalyticsResponse(
            String category,
            TicketPriority priority,
            double confidence,
            List<String> explanation,
            @JsonProperty("low_confidence") boolean lowConfidence,
            boolean advisory
    ) {

        static TriageAnalyticsResponse unavailable(Ticket ticket) {
            return new TriageAnalyticsResponse(
                    ticket.categoryId(),
                    ticket.priority(),
                    0.0,
                    List.of("Analytics service is unavailable, so the current ticket values are preserved."),
                    true,
                    true);
        }

        TicketTriageSuggestionResponse toSuggestion() {
            return new TicketTriageSuggestionResponse(
                    category,
                    priority,
                    confidence,
                    explanation == null || explanation.isEmpty()
                            ? List.of("Suggestion is advisory and requires human review.")
                            : explanation,
                    lowConfidence,
                    advisory);
        }
    }

    record DuplicateAnalyticsRequest(DuplicateTicketRequest ticket, List<DuplicateTicketRequest> candidates) {

        static DuplicateAnalyticsRequest from(Ticket ticket, List<Ticket> candidates) {
            return new DuplicateAnalyticsRequest(
                    DuplicateTicketRequest.from(ticket),
                    candidates.stream().map(DuplicateTicketRequest::from).toList());
        }
    }

    record DuplicateTicketRequest(
            String id,
            String title,
            String description,
            String category,
            TicketPriority priority,
            TicketStatus status
    ) {

        static DuplicateTicketRequest from(Ticket ticket) {
            return new DuplicateTicketRequest(
                    ticket.id() == null ? null : ticket.id().toString(),
                    ticket.title(),
                    ticket.description(),
                    ticket.categoryId(),
                    ticket.priority(),
                    ticket.status());
        }
    }

    record DuplicateAnalyticsResponse(
            List<TicketDuplicateCandidateSuggestionResponse> candidates,
            @JsonProperty("low_confidence") boolean lowConfidence,
            boolean advisory
    ) {

        static DuplicateAnalyticsResponse unavailable() {
            return new DuplicateAnalyticsResponse(List.of(), true, true);
        }

        TicketDuplicateSuggestionResponse toSuggestion() {
            return new TicketDuplicateSuggestionResponse(
                    candidates == null ? List.of() : candidates,
                    lowConfidence,
                    advisory);
        }
    }
}

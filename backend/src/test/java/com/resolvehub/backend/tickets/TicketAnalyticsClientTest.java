package com.resolvehub.backend.tickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

import com.resolvehub.backend.config.BackendProperties;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class TicketAnalyticsClientTest {

    @Test
    void analyticsFailureReturnsAdvisoryFallbackWithoutMutatingTicketValues() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        TicketAnalyticsClient client = new TicketAnalyticsClient(
                builder,
                new BackendProperties("resolvehub-backend", "http://analytics.example.test"));
        Ticket ticket = Ticket.create(new CreateTicketRequest(
                "VPN access blocked",
                "The fictional requester cannot reach the secure support queue.",
                "network",
                TicketPriority.HIGH), UUID.randomUUID());

        server.expect(request -> assertThat(request.getURI().getPath()).isEqualTo("/analytics/suggestions/triage"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));
        server.expect(request -> assertThat(request.getURI().getPath()).isEqualTo("/analytics/suggestions/duplicates"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        TicketAnalyticsSuggestionResponse response = client.suggest(ticket, List.of());

        assertThat(response.advisory()).isTrue();
        assertThat(response.analyticsAvailable()).isFalse();
        assertThat(response.triage().categoryId()).isEqualTo("network");
        assertThat(response.triage().priority()).isEqualTo(TicketPriority.HIGH);
        assertThat(response.triage().lowConfidence()).isTrue();
        assertThat(response.duplicates().candidates()).isEmpty();
        server.verify();
    }
}

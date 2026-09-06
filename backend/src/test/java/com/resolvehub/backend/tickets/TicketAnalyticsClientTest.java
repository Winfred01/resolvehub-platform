package com.resolvehub.backend.tickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.resolvehub.backend.config.BackendProperties;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

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

    @Test
    void malformedAnalyticsPayloadsReturnAdvisoryFallbacks() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        TicketAnalyticsClient client = new TicketAnalyticsClient(
                builder,
                new BackendProperties("resolvehub-backend", "http://analytics.example.test"));
        Ticket ticket = Ticket.create(new CreateTicketRequest(
                "Billing export request",
                "The fictional billing export needs review.",
                "billing",
                TicketPriority.LOW), UUID.randomUUID());

        server.expect(request -> assertThat(request.getURI().getPath()).isEqualTo("/analytics/suggestions/triage"))
                .andRespond(withSuccess("""
                        {
                          "category": "network",
                          "priority": null,
                          "confidence": 0.92,
                          "explanation": [],
                          "low_confidence": false,
                          "advisory": false
                        }
                        """, MediaType.APPLICATION_JSON));
        server.expect(request -> assertThat(request.getURI().getPath()).isEqualTo("/analytics/suggestions/duplicates"))
                .andRespond(withSuccess("""
                        {
                          "candidates": [
                            {
                              "candidate_id": "not-a-uuid",
                              "confidence": 1.2,
                              "matching_signals": [],
                              "explanation": []
                            }
                          ],
                          "low_confidence": false,
                          "advisory": true
                        }
                        """, MediaType.APPLICATION_JSON));

        TicketAnalyticsSuggestionResponse response = client.suggest(ticket, List.of());

        assertThat(response.advisory()).isTrue();
        assertThat(response.analyticsAvailable()).isFalse();
        assertThat(response.triage().categoryId()).isEqualTo("billing");
        assertThat(response.triage().priority()).isEqualTo(TicketPriority.LOW);
        assertThat(response.triage().confidence()).isZero();
        assertThat(response.triage().lowConfidence()).isTrue();
        assertThat(response.duplicates().candidates()).isEmpty();
        assertThat(response.duplicates().lowConfidence()).isTrue();
        server.verify();
    }

    @Test
    void analyticsRuntimeTimeoutsReturnFallbackWithoutThrowing() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        TicketAnalyticsClient client = new TicketAnalyticsClient(
                builder,
                new BackendProperties("resolvehub-backend", "http://analytics.example.test"));
        Ticket ticket = Ticket.create(new CreateTicketRequest(
                "Workflow queue blocked",
                "The fictional support queue is blocked.",
                "workflow",
                TicketPriority.HIGH), UUID.randomUUID());

        server.expect(request -> assertThat(request.getURI().getPath()).isEqualTo("/analytics/suggestions/triage"))
                .andRespond(request -> {
                    throw new RestClientException("Read timed out");
                });
        server.expect(request -> assertThat(request.getURI().getPath()).isEqualTo("/analytics/suggestions/duplicates"))
                .andRespond(request -> {
                    throw new RestClientException("Read timed out");
                });

        TicketAnalyticsSuggestionResponse response = client.suggest(ticket, List.of());

        assertThat(response.analyticsAvailable()).isFalse();
        assertThat(response.triage().categoryId()).isEqualTo("workflow");
        assertThat(response.triage().priority()).isEqualTo(TicketPriority.HIGH);
        assertThat(response.duplicates().candidates()).isEmpty();
        server.verify();
    }
}

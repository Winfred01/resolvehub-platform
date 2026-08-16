package com.resolvehub.backend.dashboard;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvehub.backend.auth.AccountRole;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void resetState() {
        jdbcTemplate.update("delete from ticket_activities");
        jdbcTemplate.update("delete from ticket_comments");
        jdbcTemplate.update("delete from tickets");
        jdbcTemplate.update("delete from auth_sessions");
        jdbcTemplate.update("delete from roles");
        jdbcTemplate.update("delete from users");
    }

    @Test
    void leadCanReadSummaryCountsAndDistributionsWithoutPrivateFields() throws Exception {
        String requesterAuthorization = registerAndLogin("dashboard-summary-owner@example.test", "Dashboard Summary Owner");
        String leadAuthorization = authorizationHeaderFor(saveAccount("dashboard-summary-lead@example.test", AccountRole.TEAM_LEAD));

        createTicket(requesterAuthorization, "Open dashboard ticket", "Private description one.", "general", "LOW");
        String inProgressTicketId = fieldFrom(createTicket(
                requesterAuthorization,
                "In progress dashboard ticket",
                "Private description two.",
                "network",
                "HIGH"), "id");
        String resolvedTicketId = fieldFrom(createTicket(
                requesterAuthorization,
                "Resolved dashboard ticket",
                "Private description three.",
                "general",
                "HIGH"), "id");

        moveStatus(leadAuthorization, inProgressTicketId, "TRIAGED");
        moveStatus(leadAuthorization, inProgressTicketId, "IN_PROGRESS");
        moveStatus(leadAuthorization, resolvedTicketId, "TRIAGED");
        moveStatus(leadAuthorization, resolvedTicketId, "IN_PROGRESS");
        moveStatus(leadAuthorization, resolvedTicketId, "RESOLVED");

        mockMvc.perform(get("/api/dashboard/summary")
                        .header(HttpHeaders.AUTHORIZATION, leadAuthorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTickets").value(3))
                .andExpect(jsonPath("$.openTickets").value(1))
                .andExpect(jsonPath("$.inProgressTickets").value(1))
                .andExpect(jsonPath("$.resolvedTickets").value(1))
                .andExpect(jsonPath("$.closedTickets").value(0))
                .andExpect(jsonPath("$.statusDistribution.OPEN").value(1))
                .andExpect(jsonPath("$.statusDistribution.IN_PROGRESS").value(1))
                .andExpect(jsonPath("$.statusDistribution.RESOLVED").value(1))
                .andExpect(jsonPath("$.categoryDistribution.general").value(2))
                .andExpect(jsonPath("$.categoryDistribution.network").value(1))
                .andExpect(jsonPath("$.priorityDistribution.HIGH").value(2))
                .andExpect(jsonPath("$.priorityDistribution.LOW").value(1))
                .andExpect(jsonPath("$", not(hasKey("description"))))
                .andExpect(jsonPath("$", not(hasKey("password"))))
                .andExpect(jsonPath("$", not(hasKey("passwordHash"))))
                .andExpect(jsonPath("$", not(hasKey("token"))));
    }

    @Test
    void trendEndpointReturnsOrderedDailyBucketsForCreationsAndStatusMovements() throws Exception {
        String requesterAuthorization = registerAndLogin("dashboard-trend-owner@example.test", "Dashboard Trend Owner");
        String leadAuthorization = authorizationHeaderFor(saveAccount("dashboard-trend-lead@example.test", AccountRole.TEAM_LEAD));

        String firstTicketId = fieldFrom(createTicket(
                requesterAuthorization,
                "First trend ticket",
                "First fictional trend description.",
                "general",
                "MEDIUM"), "id");
        String secondTicketId = fieldFrom(createTicket(
                requesterAuthorization,
                "Second trend ticket",
                "Second fictional trend description.",
                "workflow",
                "URGENT"), "id");

        setTicketCreatedAt(firstTicketId, "2026-08-01T10:15:00Z");
        setTicketCreatedAt(secondTicketId, "2026-08-02T11:30:00Z");
        moveStatus(leadAuthorization, secondTicketId, "TRIAGED");
        setLatestStatusMovementAt(secondTicketId, "2026-08-02T12:00:00Z");

        mockMvc.perform(get("/api/dashboard/trends")
                        .header(HttpHeaders.AUTHORIZATION, leadAuthorization)
                        .param("from", "2026-08-01T00:00:00Z")
                        .param("to", "2026-08-03T00:00:00Z")
                        .param("granularity", "daily"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.granularity").value("DAILY"))
                .andExpect(jsonPath("$.buckets", hasSize(2)))
                .andExpect(jsonPath("$.buckets[*].bucketStart", contains("2026-08-01", "2026-08-02")))
                .andExpect(jsonPath("$.buckets[0].createdTickets").value(1))
                .andExpect(jsonPath("$.buckets[0].statusMovements").value(0))
                .andExpect(jsonPath("$.buckets[1].createdTickets").value(1))
                .andExpect(jsonPath("$.buckets[1].statusMovements").value(1));
    }

    @Test
    void dashboardRequiresLeadOrAdminAndValidQueryParameters() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));

        String requesterAuthorization = registerAndLogin(
                "dashboard-forbidden-requester@example.test",
                "Dashboard Forbidden Requester");
        String leadAuthorization = authorizationHeaderFor(saveAccount("dashboard-validation-lead@example.test", AccountRole.TEAM_LEAD));

        mockMvc.perform(get("/api/dashboard/summary")
                        .header(HttpHeaders.AUTHORIZATION, requesterAuthorization))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));

        mockMvc.perform(get("/api/dashboard/trends")
                        .header(HttpHeaders.AUTHORIZATION, leadAuthorization)
                        .param("granularity", "monthly"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Dashboard granularity must be DAILY or WEEKLY."));

        mockMvc.perform(get("/api/dashboard/summary")
                        .header(HttpHeaders.AUTHORIZATION, leadAuthorization)
                        .param("from", "2026-08-03T00:00:00Z")
                        .param("to", "2026-08-01T00:00:00Z"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Dashboard date range start must be before end."));
    }

    private String registerAndLogin(String email, String displayName) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "StrongPass123",
                                  "displayName": "%s"
                                }
                                """.formatted(email, displayName)))
                .andExpect(status().isCreated());

        return authorizationHeaderFor(email);
    }

    private MvcResult createTicket(
            String authorization,
            String title,
            String description,
            String categoryId,
            String priority) throws Exception {
        return mockMvc.perform(post("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "%s",
                                  "description": "%s",
                                  "categoryId": "%s",
                                  "priority": "%s"
                                }
                                """.formatted(title, description, categoryId, priority)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andReturn();
    }

    private void moveStatus(String authorization, String ticketId, String nextStatus) throws Exception {
        mockMvc.perform(patch("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "%s"
                                }
                                """.formatted(nextStatus)))
                .andExpect(status().isOk());
    }

    private void setTicketCreatedAt(String ticketId, String instant) {
        jdbcTemplate.update(
                "update tickets set created_at = ?, updated_at = ? where id = ?",
                Timestamp.from(Instant.parse(instant)),
                Timestamp.from(Instant.parse(instant)),
                UUID.fromString(ticketId));
    }

    private void setLatestStatusMovementAt(String ticketId, String instant) {
        jdbcTemplate.update(
                """
                update ticket_activities
                set created_at = ?
                where ticket_id = ?
                  and action = 'TICKET_UPDATED'
                  and changed_fields like '%status%'
                """,
                Timestamp.from(Instant.parse(instant)),
                UUID.fromString(ticketId));
    }

    private String saveAccount(String email, AccountRole role) {
        UUID userId = UUID.randomUUID();
        Instant now = Instant.now();
        jdbcTemplate.update(
                """
                insert into users (id, email, password_hash, display_name, active, created_at, updated_at)
                values (?, ?, ?, ?, ?, ?, ?)
                """,
                userId,
                email,
                passwordEncoder.encode("StrongPass123"),
                role.name() + " User",
                true,
                now,
                now);
        jdbcTemplate.update("insert into roles (user_id, role) values (?, ?)", userId, role.name());
        return email;
    }

    private String authorizationHeaderFor(String email) throws Exception {
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "StrongPass123"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        return "Bearer " + fieldFrom(login, "token");
    }

    private String fieldFrom(MvcResult result, String field) throws Exception {
        Map<String, Object> body = objectMapper.readValue(
                result.getResponse().getContentAsByteArray(),
                new TypeReference<>() {
                });
        return body.get(field).toString();
    }
}

package com.resolvehub.backend.tickets;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvehub.backend.auth.AccountRole;
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
class TicketControllerTest {

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
    void authenticatedRequesterCanCreateTicketAndViewOwnDetail() throws Exception {
        String authorization = registerAndLogin("ticket-owner@example.test", "Ticket Owner");

        MvcResult created = mockMvc.perform(post("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Cannot sign in to workspace",
                                  "description": "The fictional demo requester cannot access the support workspace.",
                                  "categoryId": "account-access",
                                  "priority": "HIGH"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title").value("Cannot sign in to workspace"))
                .andExpect(jsonPath("$.description").value("The fictional demo requester cannot access the support workspace."))
                .andExpect(jsonPath("$.categoryId").value("account-access"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.version", notNullValue()))
                .andExpect(jsonPath("$.requesterId", notNullValue()))
                .andExpect(jsonPath("$.createdAt", notNullValue()))
                .andExpect(jsonPath("$.updatedAt", notNullValue()))
                .andExpect(jsonPath("$", not(hasKey("password"))))
                .andExpect(jsonPath("$", not(hasKey("passwordHash"))))
                .andReturn();

        String ticketId = fieldFrom(created, "id");

        mockMvc.perform(get("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ticketId))
                .andExpect(jsonPath("$.title").value("Cannot sign in to workspace"))
                .andExpect(jsonPath("$", not(hasKey("password"))))
                .andExpect(jsonPath("$", not(hasKey("passwordHash"))));
    }

    @Test
    void ticketCreationRequiresAuthenticationAndValidBody() throws Exception {
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Missing auth",
                                  "description": "A request without a bearer token.",
                                  "categoryId": "account-access",
                                  "priority": "MEDIUM"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));

        String authorization = registerAndLogin("ticket-validation@example.test", "Ticket Validation");

        mockMvc.perform(post("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": " ",
                                  "description": "",
                                  "categoryId": " ",
                                  "priority": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request validation failed."))
                .andExpect(jsonPath("$.fieldErrors.title", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.description", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.categoryId", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.priority", notNullValue()));
    }

    @Test
    void requesterCannotViewAnotherRequesterTicket() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-owner-forbidden@example.test", "Ticket Owner Forbidden");
        String otherAuthorization = registerAndLogin("ticket-other-forbidden@example.test", "Ticket Other Forbidden");

        String ticketId = fieldFrom(mockMvc.perform(post("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Private requester ticket",
                                  "description": "Only the owner or elevated support roles can view this ticket.",
                                  "categoryId": "privacy",
                                  "priority": "LOW"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn(), "id");

        mockMvc.perform(get("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, otherAuthorization))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));
    }

    @Test
    void detailReturnsNotFoundForUnknownTicket() throws Exception {
        String authorization = registerAndLogin("ticket-missing@example.test", "Ticket Missing");

        mockMvc.perform(get("/api/tickets/{id}", UUID.randomUUID())
                        .header(HttpHeaders.AUTHORIZATION, authorization))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket not found."));
    }

    @Test
    void requesterTicketListIsScopedToOwnedTickets() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-list-owner@example.test", "Ticket List Owner");
        String otherAuthorization = registerAndLogin("ticket-list-other@example.test", "Ticket List Other");

        createTicket(ownerAuthorization, "Owned search result", "The owner should see this fictional ticket.", "general", "MEDIUM");
        createTicket(otherAuthorization, "Hidden search result", "Another requester's ticket must not be listed.", "general", "HIGH");

        mockMvc.perform(get("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .param("q", "search")
                        .param("sort", "title")
                        .param("direction", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("Owned search result"))
                .andExpect(jsonPath("$.content[0].requesterId", notNullValue()))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.empty").value(false))
                .andExpect(jsonPath("$", not(hasKey("password"))));
    }

    @Test
    void supportRoleCanPageSearchFilterAndSortTickets() throws Exception {
        String firstOwnerAuthorization = registerAndLogin("ticket-search-owner@example.test", "Ticket Search Owner");
        String secondOwnerAuthorization = registerAndLogin("ticket-search-other@example.test", "Ticket Search Other");
        String agentEmail = saveAccount("ticket-search-agent@example.test", AccountRole.AGENT);
        String agentAuthorization = authorizationHeaderFor(agentEmail);
        UUID agentId = userIdFor(agentEmail);

        createTicket(firstOwnerAuthorization, "Printer offline", "The office printer is offline.", "hardware", "LOW");
        createTicket(firstOwnerAuthorization, "Billing portal timeout", "The fictional billing page times out.", "account-access", "MEDIUM");
        createTicket(secondOwnerAuthorization, "VPN access blocked", "Cannot reach the fictional VPN gateway.", "network", "HIGH");
        String triagedTicketId = fieldFrom(createTicket(
                secondOwnerAuthorization,
                "VPN report export",
                "The support queue export includes VPN tickets.",
                "network",
                "URGENT"), "id");

        mockMvc.perform(patch("/api/tickets/{id}", triagedTicketId)
                        .header(HttpHeaders.AUTHORIZATION, agentAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "TRIAGED"
                                }
                                """))
                .andExpect(status().isOk());
        jdbcTemplate.update(
                "update tickets set current_assignee_id = ? where id = ?",
                agentId,
                UUID.fromString(triagedTicketId));

        mockMvc.perform(get("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, agentAuthorization)
                        .param("page", "0")
                        .param("size", "2")
                        .param("sort", "title")
                        .param("direction", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].title", contains("Billing portal timeout", "Printer offline")))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.totalElements").value(4))
                .andExpect(jsonPath("$.totalPages").value(2));

        mockMvc.perform(get("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, agentAuthorization)
                        .param("q", "vpn")
                        .param("status", "TRIAGED")
                        .param("priority", "URGENT")
                        .param("categoryId", "network")
                        .param("assigneeId", agentId.toString())
                        .param("sort", "updatedAt")
                        .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id").value(triagedTicketId))
                .andExpect(jsonPath("$.content[0].title").value("VPN report export"))
                .andExpect(jsonPath("$.content[0].status").value("TRIAGED"))
                .andExpect(jsonPath("$.content[0].priority").value("URGENT"))
                .andExpect(jsonPath("$.content[0].categoryId").value("network"))
                .andExpect(jsonPath("$.content[0].currentAssigneeId").value(agentId.toString()));
    }

    @Test
    void ticketListRequiresAuthenticationAndValidQueryParameters() throws Exception {
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));

        String authorization = registerAndLogin("ticket-search-validation@example.test", "Ticket Search Validation");

        mockMvc.perform(get("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .param("sort", "requesterId"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid ticket sort field."));

        mockMvc.perform(get("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .param("priority", "CRITICAL"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid ticket priority filter."));

        mockMvc.perform(get("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Size must be between 1 and 100."));
    }

    @Test
    void authenticatedUsersCanReadTicketCategoriesAndInvalidCategoriesAreRejected() throws Exception {
        String authorization = registerAndLogin("ticket-category-reader@example.test", "Ticket Category Reader");

        mockMvc.perform(get("/api/ticket-categories")
                        .header(HttpHeaders.AUTHORIZATION, authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(7)))
                .andExpect(jsonPath("$[0].id").value("account-access"))
                .andExpect(jsonPath("$[0].name").value("Account Access"));

        mockMvc.perform(post("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Unknown category",
                                  "description": "The category should be rejected.",
                                  "categoryId": "unknown-category",
                                  "priority": "MEDIUM"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid ticket category."));
    }

    @Test
    void requesterCanCreateAndListOwnTicketComments() throws Exception {
        String ownerEmail = "ticket-comment-owner@example.test";
        String ownerAuthorization = registerAndLogin(ownerEmail, "Ticket Comment Owner");
        UUID ownerId = userIdFor(ownerEmail);
        String ticketId = fieldFrom(createTicket(
                ownerAuthorization,
                "Commentable ticket",
                "The requester can add more fictional context.",
                "general",
                "MEDIUM"), "id");

        MvcResult createdComment = mockMvc.perform(post("/api/tickets/{id}/comments", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "  The fictional issue also affects the demo billing export.  "
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.ticketId").value(ticketId))
                .andExpect(jsonPath("$.commenterId").value(ownerId.toString()))
                .andExpect(jsonPath("$.body").value("The fictional issue also affects the demo billing export."))
                .andExpect(jsonPath("$.createdAt", notNullValue()))
                .andExpect(jsonPath("$.updatedAt", notNullValue()))
                .andExpect(jsonPath("$", not(hasKey("password"))))
                .andExpect(jsonPath("$", not(hasKey("passwordHash"))))
                .andReturn();

        String commentId = fieldFrom(createdComment, "id");

        mockMvc.perform(get("/api/tickets/{id}/comments", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id").value(commentId))
                .andExpect(jsonPath("$.content[0].commenterId").value(ownerId.toString()))
                .andExpect(jsonPath("$.content[0].body").value("The fictional issue also affects the demo billing export."))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.empty").value(false));

        Integer commentActivities = jdbcTemplate.queryForObject(
                "select count(*) from ticket_activities where ticket_id = ? and actor_id = ? and action = 'TICKET_COMMENTED'",
                Integer.class,
                UUID.fromString(ticketId),
                ownerId);
        org.assertj.core.api.Assertions.assertThat(commentActivities).isEqualTo(1);
    }

    @Test
    void supportRoleCanReadAndCreateVisibleTicketComments() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-comment-support-owner@example.test", "Ticket Comment Support Owner");
        String agentEmail = saveAccount("ticket-comment-support-agent@example.test", AccountRole.AGENT);
        String agentAuthorization = authorizationHeaderFor(agentEmail);
        UUID agentId = userIdFor(agentEmail);
        String ticketId = fieldFrom(createTicket(
                ownerAuthorization,
                "Support visible comment ticket",
                "Support roles can comment on visible fictional tickets.",
                "workflow",
                "HIGH"), "id");

        mockMvc.perform(post("/api/tickets/{id}/comments", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, agentAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "Agent added triage context for the fictional queue."
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.commenterId").value(agentId.toString()))
                .andExpect(jsonPath("$.body").value("Agent added triage context for the fictional queue."));

        mockMvc.perform(get("/api/tickets/{id}/comments", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, agentAuthorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].commenterId").value(agentId.toString()));
    }

    @Test
    void ticketCommentsRequireAuthenticationValidBodyAndVisibleTicket() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-comment-private-owner@example.test", "Ticket Comment Private Owner");
        String otherAuthorization = registerAndLogin("ticket-comment-private-other@example.test", "Ticket Comment Private Other");
        String ticketId = fieldFrom(createTicket(
                ownerAuthorization,
                "Private comment ticket",
                "Only the requester and support roles can comment.",
                "privacy",
                "LOW"), "id");

        mockMvc.perform(post("/api/tickets/{id}/comments", ticketId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "Missing auth"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));

        mockMvc.perform(post("/api/tickets/{id}/comments", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": " "
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request validation failed."))
                .andExpect(jsonPath("$.fieldErrors.body", notNullValue()));

        mockMvc.perform(post("/api/tickets/{id}/comments", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, otherAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "Should not be stored."
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));

        mockMvc.perform(get("/api/tickets/{id}/comments", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, otherAuthorization))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));

        mockMvc.perform(get("/api/tickets/{id}/comments", UUID.randomUUID())
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket not found."));
    }

    @Test
    void requesterCanReadOwnTicketActivityHistoryWithoutSensitiveValues() throws Exception {
        String ownerEmail = "ticket-activity-owner@example.test";
        String ownerAuthorization = registerAndLogin(ownerEmail, "Ticket Activity Owner");
        UUID ownerId = userIdFor(ownerEmail);
        MvcResult created = createTicket(
                ownerAuthorization,
                "Activity ticket",
                "The activity stream should avoid sensitive fictional content.",
                "general",
                "MEDIUM");
        String ticketId = fieldFrom(created, "id");

        mockMvc.perform(patch("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Activity ticket updated"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/tickets/{id}/comments", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "The fictional secret-like value should not enter audit rows."
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/tickets/{id}/activities", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.content[0].ticketId").value(ticketId))
                .andExpect(jsonPath("$.content[0].actorId").value(ownerId.toString()))
                .andExpect(jsonPath("$.content[0].action").value("TICKET_CREATED"))
                .andExpect(jsonPath("$.content[0].changedFields", contains("title", "description", "categoryId", "priority", "status")))
                .andExpect(jsonPath("$.content[1].action").value("TICKET_UPDATED"))
                .andExpect(jsonPath("$.content[1].changedFields", contains("title")))
                .andExpect(jsonPath("$.content[2].action").value("TICKET_COMMENTED"))
                .andExpect(jsonPath("$.content[2].changedFields", contains("comment")))
                .andExpect(jsonPath("$.content[0].createdAt", notNullValue()))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.empty").value(false))
                .andExpect(jsonPath("$..password").doesNotExist())
                .andExpect(jsonPath("$..passwordHash").doesNotExist())
                .andExpect(jsonPath("$..token").doesNotExist())
                .andExpect(jsonPath("$..body").doesNotExist());
    }

    @Test
    void supportCanReadAssignmentActivityAndRequesterCannotReadAnotherTicketActivity() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-activity-private-owner@example.test", "Ticket Activity Private Owner");
        String otherAuthorization = registerAndLogin("ticket-activity-private-other@example.test", "Ticket Activity Private Other");
        String leadEmail = saveAccount("ticket-activity-lead@example.test", AccountRole.TEAM_LEAD);
        String agentEmail = saveAccount("ticket-activity-agent@example.test", AccountRole.AGENT);
        String leadAuthorization = authorizationHeaderFor(leadEmail);
        UUID agentId = userIdFor(agentEmail);
        String ticketId = fieldFrom(createTicket(
                ownerAuthorization,
                "Assignment activity ticket",
                "Assignment history is visible to support roles.",
                "workflow",
                "HIGH"), "id");

        mockMvc.perform(patch("/api/tickets/{id}/assignment", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, leadAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "assigneeId": "%s"
                                }
                                """.formatted(agentId)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/tickets/{id}/activities", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, leadAuthorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].action").value("TICKET_CREATED"))
                .andExpect(jsonPath("$.content[1].action").value("TICKET_ASSIGNED"))
                .andExpect(jsonPath("$.content[1].changedFields", contains("currentAssigneeId")));

        mockMvc.perform(get("/api/tickets/{id}/activities", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, otherAuthorization))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));
    }

    @Test
    void ticketActivitiesRequireAuthenticationValidPaginationAndExistingTicket() throws Exception {
        mockMvc.perform(get("/api/tickets/{id}/activities", UUID.randomUUID()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));

        String authorization = registerAndLogin("ticket-activity-validation@example.test", "Ticket Activity Validation");

        mockMvc.perform(get("/api/tickets/{id}/activities", UUID.randomUUID())
                        .header(HttpHeaders.AUTHORIZATION, authorization))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket not found."));

        String ticketId = fieldFrom(createTicket(
                authorization,
                "Activity validation ticket",
                "Invalid pagination should be rejected.",
                "general",
                "LOW"), "id");

        mockMvc.perform(get("/api/tickets/{id}/activities", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Page must be zero or greater."));

        mockMvc.perform(get("/api/tickets/{id}/activities", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Size must be between 1 and 100."));

        mockMvc.perform(post("/api/tickets/{id}/activities", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, authorization))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void agentCanSelfAssignAndLeadCanReassignAndUnassignTicket() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-assignment-owner@example.test", "Ticket Assignment Owner");
        String agentEmail = saveAccount("ticket-assignment-agent@example.test", AccountRole.AGENT);
        String leadEmail = saveAccount("ticket-assignment-lead@example.test", AccountRole.TEAM_LEAD);
        UUID agentId = userIdFor(agentEmail);
        UUID leadId = userIdFor(leadEmail);
        String agentAuthorization = authorizationHeaderFor(agentEmail);
        String leadAuthorization = authorizationHeaderFor(leadEmail);

        MvcResult created = createTicket(
                ownerAuthorization,
                "Assignment candidate",
                "The ticket can be assigned in the fictional support queue.",
                "workflow",
                "HIGH");
        String ticketId = fieldFrom(created, "id");
        String version = fieldFrom(created, "version");

        mockMvc.perform(patch("/api/tickets/{id}/assignment", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, agentAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "assigneeId": "%s",
                                  "version": %s
                                }
                                """.formatted(agentId, version)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentAssigneeId").value(agentId.toString()));

        mockMvc.perform(patch("/api/tickets/{id}/assignment", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, leadAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "assigneeId": "%s"
                                }
                                """.formatted(leadId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentAssigneeId").value(leadId.toString()));

        mockMvc.perform(patch("/api/tickets/{id}/assignment", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, leadAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "assigneeId": null
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentAssigneeId", nullValue()));

        Integer assignmentActivities = jdbcTemplate.queryForObject(
                "select count(*) from ticket_activities where ticket_id = ? and action = 'TICKET_ASSIGNED'",
                Integer.class,
                UUID.fromString(ticketId));
        org.assertj.core.api.Assertions.assertThat(assignmentActivities).isEqualTo(3);
    }

    @Test
    void ticketAssignmentRejectsRequestersOtherAgentTargetsAndInvalidAssignees() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-assignment-requester@example.test", "Ticket Assignment Requester");
        String firstAgentEmail = saveAccount("ticket-assignment-first-agent@example.test", AccountRole.AGENT);
        String secondAgentEmail = saveAccount("ticket-assignment-second-agent@example.test", AccountRole.AGENT);
        String leadEmail = saveAccount("ticket-assignment-invalid-lead@example.test", AccountRole.TEAM_LEAD);
        String requesterEmail = saveAccount("ticket-assignment-invalid-requester@example.test", AccountRole.REQUESTER);
        String ticketId = fieldFrom(createTicket(
                ownerAuthorization,
                "Assignment rejection candidate",
                "Invalid assignment attempts should be rejected.",
                "workflow",
                "MEDIUM"), "id");

        mockMvc.perform(patch("/api/tickets/{id}/assignment", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "assigneeId": "%s"
                                }
                                """.formatted(userIdFor(firstAgentEmail))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));

        mockMvc.perform(patch("/api/tickets/{id}/assignment", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(firstAgentEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "assigneeId": "%s"
                                }
                                """.formatted(userIdFor(secondAgentEmail))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));

        mockMvc.perform(patch("/api/tickets/{id}/assignment", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(leadEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "assigneeId": "%s"
                                }
                                """.formatted(userIdFor(requesterEmail))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Assignee must be an active support user."));
    }

    @Test
    void supportRoleCanUpdateTicketWorkflowPriorityAndFields() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-update-owner@example.test", "Ticket Update Owner");
        String agentEmail = saveAccount("ticket-update-agent@example.test", AccountRole.AGENT);
        String agentAuthorization = authorizationHeaderFor(agentEmail);

        MvcResult created = createTicket(ownerAuthorization, "Needs triage", "A fictional workflow issue.", "workflow", "MEDIUM");
        String ticketId = fieldFrom(created, "id");
        String version = fieldFrom(created, "version");

        mockMvc.perform(patch("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, agentAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Triaged support workflow",
                                  "categoryId": "account-access",
                                  "priority": "URGENT",
                                  "status": "TRIAGED",
                                  "version": %s
                                }
                                """.formatted(version)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ticketId))
                .andExpect(jsonPath("$.title").value("Triaged support workflow"))
                .andExpect(jsonPath("$.description").value("A fictional workflow issue."))
                .andExpect(jsonPath("$.categoryId").value("account-access"))
                .andExpect(jsonPath("$.priority").value("URGENT"))
                .andExpect(jsonPath("$.status").value("TRIAGED"))
                .andExpect(jsonPath("$.version", notNullValue()))
                .andExpect(jsonPath("$", not(hasKey("password"))))
                .andExpect(jsonPath("$", not(hasKey("passwordHash"))));
    }

    @Test
    void requesterCanOnlyUpdateOwnOpenTicketTextFields() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-owner-limited@example.test", "Ticket Owner Limited");
        String otherAuthorization = registerAndLogin("ticket-other-limited@example.test", "Ticket Other Limited");

        MvcResult created = createTicket(ownerAuthorization, "Original title", "Original description.", "general", "LOW");
        String ticketId = fieldFrom(created, "id");

        mockMvc.perform(patch("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated requester title",
                                  "description": "Updated requester description.",
                                  "categoryId": "workflow"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated requester title"))
                .andExpect(jsonPath("$.description").value("Updated requester description."))
                .andExpect(jsonPath("$.categoryId").value("workflow"))
                .andExpect(jsonPath("$.priority").value("LOW"))
                .andExpect(jsonPath("$.status").value("OPEN"));

        mockMvc.perform(patch("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, ownerAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "priority": "HIGH",
                                  "status": "TRIAGED"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));

        mockMvc.perform(patch("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, otherAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Should not update"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));
    }

    @Test
    void invalidStatusTransitionReturnsBadRequest() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-transition-owner@example.test", "Ticket Transition Owner");
        String agentEmail = saveAccount("ticket-transition-agent@example.test", AccountRole.AGENT);

        String ticketId = fieldFrom(
                createTicket(ownerAuthorization, "Invalid transition", "Cannot resolve directly from open.", "workflow", "MEDIUM"),
                "id");

        mockMvc.perform(patch("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(agentEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "RESOLVED"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid status transition."));
    }

    @Test
    void staleVersionReturnsConflict() throws Exception {
        String ownerAuthorization = registerAndLogin("ticket-conflict-owner@example.test", "Ticket Conflict Owner");
        String agentEmail = saveAccount("ticket-conflict-agent@example.test", AccountRole.AGENT);

        String ticketId = fieldFrom(createTicket(
                ownerAuthorization,
                "Conflict candidate",
                "The supplied version should be stale.",
                "workflow",
                "MEDIUM"), "id");

        mockMvc.perform(patch("/api/tickets/{id}", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(agentEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Stale update",
                                  "version": 999
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Ticket version conflict."));
    }

    @Test
    void ticketUpdateRequiresAuthenticationAndExistingTicket() throws Exception {
        mockMvc.perform(patch("/api/tickets/{id}", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Unauthenticated update"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));

        String agentEmail = saveAccount("ticket-update-missing-agent@example.test", AccountRole.AGENT);

        mockMvc.perform(patch("/api/tickets/{id}", UUID.randomUUID())
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(agentEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Missing ticket"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket not found."));
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
                .andReturn();
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

    private UUID userIdFor(String email) {
        return jdbcTemplate.queryForObject("select id from users where email = ?", UUID.class, email);
    }

    private String fieldFrom(MvcResult result, String field) throws Exception {
        Map<String, Object> body = objectMapper.readValue(
                result.getResponse().getContentAsByteArray(),
                new TypeReference<>() {
                });
        return body.get(field).toString();
    }
}

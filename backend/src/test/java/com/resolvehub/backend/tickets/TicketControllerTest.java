package com.resolvehub.backend.tickets;

import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

    private String fieldFrom(MvcResult result, String field) throws Exception {
        Map<String, Object> body = objectMapper.readValue(
                result.getResponse().getContentAsByteArray(),
                new TypeReference<>() {
                });
        return body.get(field).toString();
    }
}

package com.resolvehub.backend.auth;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class UserRoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private AuthSessionRepository authSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void resetAuthState() {
        authSessionRepository.deleteAll();
        userAccountRepository.deleteAll();
    }

    @Test
    void roleChangeRequiresAuthentication() throws Exception {
        UUID targetId = saveAccount("target-unauthenticated@example.test", AccountRole.REQUESTER).id();

        mockMvc.perform(patch("/api/users/{id}/role", targetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "AGENT"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));
    }

    @Test
    void requesterCannotChangeRoles() throws Exception {
        UserAccount requester = saveAccount("requester-role-change@example.test", AccountRole.REQUESTER);
        UUID targetId = saveAccount("target-forbidden@example.test", AccountRole.REQUESTER).id();

        mockMvc.perform(patch("/api/users/{id}/role", targetId)
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(requester))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "AGENT"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));
    }

    @Test
    void adminCanChangeUserRoleWithSafeSummaryResponse() throws Exception {
        UserAccount admin = saveAccount("admin-role-change@example.test", AccountRole.ADMIN);
        UserAccount target = saveAccount("target-role-change@example.test", AccountRole.REQUESTER);

        mockMvc.perform(patch("/api/users/{id}/role", target.id())
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "AGENT"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(target.id().toString()))
                .andExpect(jsonPath("$.email").value("target-role-change@example.test"))
                .andExpect(jsonPath("$.roles", contains("AGENT")))
                .andExpect(jsonPath("$", not(hasKey("password"))))
                .andExpect(jsonPath("$", not(hasKey("passwordHash"))));
    }

    @Test
    void adminRoleChangeReturnsNotFoundForUnknownUser() throws Exception {
        UserAccount admin = saveAccount("admin-not-found@example.test", AccountRole.ADMIN);

        mockMvc.perform(patch("/api/users/{id}/role", UUID.randomUUID())
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "AGENT"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found."));
    }

    private UserAccount saveAccount(String email, AccountRole role) {
        UserAccount account = UserAccount.newRequester(
                email,
                passwordEncoder.encode("StrongPass123"),
                role.name() + " User");
        account.replaceRole(role);
        return userAccountRepository.save(account);
    }

    private String authorizationHeaderFor(UserAccount account) throws Exception {
        String body = """
                {
                  "email": "%s",
                  "password": "StrongPass123"
                }
                """.formatted(account.email());

        MvcResult login = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> response = objectMapper.readValue(
                login.getResponse().getContentAsByteArray(),
                new TypeReference<>() {
                });
        return "Bearer " + response.get("token");
    }
}

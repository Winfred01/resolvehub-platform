package com.resolvehub.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthSecurityRegressionTest {

    private static final String PASSWORD = "StrongPass123";

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
    void registrationStoresOnlyHashedPasswords() throws Exception {
        register("hash-storage@example.test", PASSWORD, "Hash Storage");

        UserAccount account = userAccountRepository.findByEmail("hash-storage@example.test").orElseThrow();

        assertThat(account.passwordHash()).isNotEqualTo(PASSWORD);
        assertThat(account.passwordHash()).doesNotContain(PASSWORD);
        assertThat(passwordEncoder.matches(PASSWORD, account.passwordHash())).isTrue();
    }

    @Test
    void bearerTokensArePersistedOnlyAsSha256Hashes() throws Exception {
        register("token-storage@example.test", PASSWORD, "Token Storage");

        String token = tokenFrom(login("token-storage@example.test", PASSWORD));
        AuthSession session = authSessionRepository.findAll().get(0);
        String tokenHash = (String) ReflectionTestUtils.getField(session, "tokenHash");

        assertThat(tokenHash)
                .isNotEqualTo(token)
                .doesNotContain(token)
                .matches("[0-9a-f]{64}");
    }

    @Test
    void expiredSessionsAreRejectedWithoutDeletingAuditState() throws Exception {
        register("expired-session@example.test", PASSWORD, "Expired Session");
        String token = tokenFrom(login("expired-session@example.test", PASSWORD));
        AuthSession session = authSessionRepository.findAll().get(0);
        ReflectionTestUtils.setField(session, "expiresAt", Instant.now().minusSeconds(1));
        authSessionRepository.saveAndFlush(session);

        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));

        assertThat(authSessionRepository.findAll()).hasSize(1);
    }

    @Test
    void logoutMarksSessionRevokedAndTokenCannotBeReused() throws Exception {
        register("revoked-session@example.test", PASSWORD, "Revoked Session");
        String token = tokenFrom(login("revoked-session@example.test", PASSWORD));

        mockMvc.perform(post("/api/auth/logout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNoContent());

        AuthSession session = authSessionRepository.findAll().get(0);
        assertThat((Instant) ReflectionTestUtils.getField(session, "revokedAt")).isNotNull();

        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));
    }

    @Test
    void malformedBearerHeadersAreRejectedUniformly() throws Exception {
        register("bearer-format@example.test", PASSWORD, "Bearer Format");
        String token = tokenFrom(login("bearer-format@example.test", PASSWORD));

        for (String authorizationHeader : new String[] {"", token, "Basic " + token, "Bearer   "}) {
            mockMvc.perform(get("/api/auth/me")
                            .header(HttpHeaders.AUTHORIZATION, authorizationHeader))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Authentication required."));
        }
    }

    @Test
    void loginFailuresDoNotDiscloseWhetherAccountExists() throws Exception {
        register("known-user@example.test", PASSWORD, "Known User");

        MvcResult unknownAccount = loginExpectingUnauthorized("missing-user@example.test", PASSWORD);
        MvcResult wrongPassword = loginExpectingUnauthorized("known-user@example.test", "WrongPass123");

        assertThat(unknownAccount.getResponse().getContentAsString())
                .contains("Invalid email or password.")
                .doesNotContain("missing-user@example.test", "known-user@example.test", "not found");
        Map<String, Object> unknownAccountBody = responseBodyFrom(unknownAccount);
        Map<String, Object> wrongPasswordBody = responseBodyFrom(wrongPassword);
        assertThat(wrongPasswordBody)
                .containsEntry("status", unknownAccountBody.get("status"))
                .containsEntry("error", unknownAccountBody.get("error"))
                .containsEntry("message", unknownAccountBody.get("message"));
    }

    @Test
    void requesterRoleEscalationAttemptIsForbiddenAndDoesNotMutateTarget() throws Exception {
        UserAccount requester = saveAccount("requester-escalation@example.test", AccountRole.REQUESTER);
        UserAccount target = saveAccount("target-escalation@example.test", AccountRole.REQUESTER);

        mockMvc.perform(patch("/api/users/{id}/role", target.id())
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(requester))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden."));

        assertThat(userAccountRepository.findById(target.id()).orElseThrow().roles())
                .containsExactly(AccountRole.REQUESTER);
    }

    @Test
    void securityRelevantResponsesDoNotExposeSensitiveFields() throws Exception {
        MvcResult registration = register("sensitive-output@example.test", PASSWORD, "Sensitive Output");
        MvcResult login = login("sensitive-output@example.test", PASSWORD);
        String token = tokenFrom(login);
        MvcResult currentUser = mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        UserAccount admin = saveAccount("admin-sensitive-output@example.test", AccountRole.ADMIN);
        UUID targetId = userAccountRepository.findByEmail("sensitive-output@example.test").orElseThrow().id();
        MvcResult roleChange = mockMvc.perform(patch("/api/users/{id}/role", targetId)
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeaderFor(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "AGENT"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles", contains("AGENT")))
                .andReturn();

        for (MvcResult result : new MvcResult[] {registration, login, currentUser, roleChange}) {
            assertThat(result.getResponse().getContentAsString())
                    .doesNotContain("password", "passwordHash", "tokenHash", PASSWORD);
        }
    }

    private MvcResult register(String email, String password, String displayName) throws Exception {
        String body = """
                {
                  "email": "%s",
                  "password": "%s",
                  "displayName": "%s"
                }
                """.formatted(email, password, displayName);

        return mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
    }

    private MvcResult login(String email, String password) throws Exception {
        String body = """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password);

        return mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
    }

    private MvcResult loginExpectingUnauthorized(String email, String password) throws Exception {
        String body = """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password);

        return mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andReturn();
    }

    private String tokenFrom(MvcResult result) throws Exception {
        Map<String, Object> body = responseBodyFrom(result);
        return body.get("token").toString();
    }

    private Map<String, Object> responseBodyFrom(MvcResult result) throws Exception {
        return objectMapper.readValue(
                result.getResponse().getContentAsByteArray(),
                new TypeReference<>() {
                });
    }

    private UserAccount saveAccount(String email, AccountRole role) {
        UserAccount account = UserAccount.newRequester(
                email,
                passwordEncoder.encode(PASSWORD),
                role.name() + " User");
        account.replaceRole(role);
        return userAccountRepository.save(account);
    }

    private String authorizationHeaderFor(UserAccount account) throws Exception {
        return "Bearer " + tokenFrom(login(account.email(), PASSWORD));
    }
}

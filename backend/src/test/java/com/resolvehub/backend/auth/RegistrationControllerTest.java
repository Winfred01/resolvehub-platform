package com.resolvehub.backend.auth;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.hasKey;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class RegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void resetAccounts() {
        userAccountRepository.deleteAll();
    }

    @Test
    void registerCreatesRequesterAccountWithSafeSummary() throws Exception {
        String body = """
                {
                  "email": " Requester.Example@example.test ",
                  "password": "StrongPass123",
                  "displayName": " Example Requester "
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.email").value("requester.example@example.test"))
                .andExpect(jsonPath("$.displayName").value("Example Requester"))
                .andExpect(jsonPath("$.roles", contains("REQUESTER")))
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.createdAt", notNullValue()))
                .andExpect(jsonPath("$", not(hasKey("password"))))
                .andExpect(jsonPath("$", not(hasKey("passwordHash"))));

        UserAccount account = userAccountRepository
                .findByEmail("requester.example@example.test")
                .orElseThrow();
        assertThat(passwordEncoder.matches("StrongPass123", account.passwordHash())).isTrue();
        assertThat(account.passwordHash()).isNotEqualTo("StrongPass123");
    }

    @Test
    void registerRejectsDuplicateEmail() throws Exception {
        String first = """
                {
                  "email": "duplicate@example.test",
                  "password": "StrongPass123",
                  "displayName": "First User"
                }
                """;
        String duplicate = """
                {
                  "email": " DUPLICATE@example.test ",
                  "password": "AnotherPass123",
                  "displayName": "Second User"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(first))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicate))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An account with this email already exists."));
    }

    @Test
    void registerRejectsInvalidInput() throws Exception {
        String body = """
                {
                  "email": "not-an-email",
                  "password": "weak",
                  "displayName": ""
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request validation failed."))
                .andExpect(jsonPath("$.fieldErrors.email", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.password", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.displayName", notNullValue()));
    }
}

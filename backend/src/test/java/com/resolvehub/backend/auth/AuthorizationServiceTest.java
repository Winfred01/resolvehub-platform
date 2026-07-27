package com.resolvehub.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
@AutoConfigureMockMvc
class AuthorizationServiceTest {

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private AuthService authService;

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
    void roleEnumMatchesSecurityModel() {
        assertThat(AccountRole.values())
                .containsExactly(AccountRole.REQUESTER, AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN);
    }

    @Test
    void permissionMatrixAllowsExpectedRoleBoundaries() {
        assertThat(EndpointPermission.CREATE_TICKET.allowedRoles())
                .containsExactlyInAnyOrder(AccountRole.REQUESTER, AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN);
        assertThat(EndpointPermission.VIEW_ALL_TICKETS.allowedRoles())
                .containsExactlyInAnyOrder(AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN);
        assertThat(EndpointPermission.REASSIGN_TICKET.allowedRoles())
                .containsExactlyInAnyOrder(AccountRole.TEAM_LEAD, AccountRole.ADMIN);
        assertThat(EndpointPermission.CHANGE_ROLES.allowedRoles()).containsExactly(AccountRole.ADMIN);
    }

    @Test
    void authorizationRequiresAuthenticationBeforeRoleCheck() {
        assertThatThrownBy(() -> authorizationService.requirePermission(null, EndpointPermission.CHANGE_ROLES))
                .isInstanceOf(AuthenticationRequiredException.class)
                .hasMessage("Authentication required.");
    }

    @Test
    void requesterCannotUseAdminPermission() {
        UserAccount requester = saveAccount("requester-authz@example.test", AccountRole.REQUESTER);
        String authorization = authorizationHeaderFor(requester);

        assertThatThrownBy(() -> authorizationService.requirePermission(authorization, EndpointPermission.CHANGE_ROLES))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Forbidden.");
    }

    @Test
    void agentAndTeamLeadPermissionsFollowSecurityModel() {
        UserAccount agent = saveAccount("agent-authz@example.test", AccountRole.AGENT);
        UserAccount lead = saveAccount("lead-authz@example.test", AccountRole.TEAM_LEAD);

        assertThat(authorizationService.requirePermission(authorizationHeaderFor(agent), EndpointPermission.UPDATE_TICKET_WORKFLOW).id())
                .isEqualTo(agent.id());
        assertThatThrownBy(() -> authorizationService.requirePermission(authorizationHeaderFor(agent), EndpointPermission.REASSIGN_TICKET))
                .isInstanceOf(ForbiddenException.class);
        assertThat(authorizationService.requirePermission(authorizationHeaderFor(lead), EndpointPermission.REASSIGN_TICKET).id())
                .isEqualTo(lead.id());
    }

    @Test
    void unmappedPermissionDefaultsToDeny() {
        UserAccount admin = saveAccount("admin-default-deny@example.test", AccountRole.ADMIN);

        assertThatThrownBy(() -> authorizationService.requirePermission(authorizationHeaderFor(admin), EndpointPermission.DEFAULT_DENY))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Forbidden.");
    }

    private UserAccount saveAccount(String email, AccountRole role) {
        UserAccount account = UserAccount.newRequester(
                email,
                passwordEncoder.encode("StrongPass123"),
                role.name() + " User");
        account.replaceRole(role);
        return userAccountRepository.save(account);
    }

    private String authorizationHeaderFor(UserAccount account) {
        LoginResponse login = authService.login(new LoginRequest(account.email(), "StrongPass123"));
        return "Bearer " + login.token();
    }
}

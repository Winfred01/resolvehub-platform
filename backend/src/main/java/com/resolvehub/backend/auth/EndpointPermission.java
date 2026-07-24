package com.resolvehub.backend.auth;

import java.util.EnumSet;
import java.util.Set;

enum EndpointPermission {
    CURRENT_USER(AccountRole.REQUESTER, AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN),
    CREATE_TICKET(AccountRole.REQUESTER, AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN),
    VIEW_ALL_TICKETS(AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN),
    UPDATE_TICKET_WORKFLOW(AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN),
    REASSIGN_TICKET(AccountRole.TEAM_LEAD, AccountRole.ADMIN),
    CHANGE_ROLES(AccountRole.ADMIN),
    VIEW_DASHBOARD(AccountRole.TEAM_LEAD, AccountRole.ADMIN),
    DEFAULT_DENY;

    private final Set<AccountRole> allowedRoles;

    EndpointPermission(AccountRole... allowedRoles) {
        this.allowedRoles = allowedRoles.length == 0 ? Set.of() : EnumSet.of(allowedRoles[0], allowedRoles);
    }

    boolean allows(Set<AccountRole> actualRoles) {
        return actualRoles.stream().anyMatch(allowedRoles::contains);
    }

    Set<AccountRole> allowedRoles() {
        return Set.copyOf(allowedRoles);
    }
}

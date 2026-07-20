package com.resolvehub.backend.auth;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record UserSummaryResponse(
        UUID id,
        String email,
        String displayName,
        Set<AccountRole> roles,
        boolean active,
        Instant createdAt
) {

    static UserSummaryResponse from(UserAccount account) {
        return new UserSummaryResponse(
                account.id(),
                account.email(),
                account.displayName(),
                account.roles(),
                account.active(),
                account.createdAt());
    }
}

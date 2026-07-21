package com.resolvehub.backend.auth;

import java.time.Instant;

public record LoginResponse(
        String token,
        String tokenType,
        Instant expiresAt,
        UserSummaryResponse user
) {
}

package com.resolvehub.backend.auth;

import org.springframework.stereotype.Service;

@Service
public class AuthorizationService {

    private final AuthService authService;

    AuthorizationService(AuthService authService) {
        this.authService = authService;
    }

    public UserSummaryResponse requirePermission(String authorizationHeader, EndpointPermission permission) {
        UserAccount account = authService.currentAccount(authorizationHeader);
        if (!permission.allows(account.roles())) {
            throw new ForbiddenException("Forbidden.");
        }
        return UserSummaryResponse.from(account);
    }

    public UserSummaryResponse requireAuthenticated(String authorizationHeader) {
        return UserSummaryResponse.from(authService.currentAccount(authorizationHeader));
    }
}

package com.resolvehub.backend.auth;

import org.springframework.stereotype.Service;

@Service
class AuthorizationService {

    private final AuthService authService;

    AuthorizationService(AuthService authService) {
        this.authService = authService;
    }

    UserAccount requirePermission(String authorizationHeader, EndpointPermission permission) {
        UserAccount account = authService.currentAccount(authorizationHeader);
        if (!permission.allows(account.roles())) {
            throw new ForbiddenException("Forbidden.");
        }
        return account;
    }
}

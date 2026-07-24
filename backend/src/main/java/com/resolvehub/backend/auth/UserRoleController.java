package com.resolvehub.backend.auth;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
class UserRoleController {

    private final AuthorizationService authorizationService;
    private final UserRoleService userRoleService;

    UserRoleController(AuthorizationService authorizationService, UserRoleService userRoleService) {
        this.authorizationService = authorizationService;
        this.userRoleService = userRoleService;
    }

    @PatchMapping("/{id}/role")
    UserSummaryResponse changeRole(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID id,
            @Valid @RequestBody RoleUpdateRequest request) {
        authorizationService.requirePermission(authorization, EndpointPermission.CHANGE_ROLES);
        return userRoleService.changeRole(id, request.role());
    }
}

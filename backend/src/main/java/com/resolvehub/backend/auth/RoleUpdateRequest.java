package com.resolvehub.backend.auth;

import jakarta.validation.constraints.NotNull;

record RoleUpdateRequest(@NotNull AccountRole role) {
}

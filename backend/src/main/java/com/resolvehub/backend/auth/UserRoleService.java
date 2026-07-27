package com.resolvehub.backend.auth;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class UserRoleService {

    private final UserAccountRepository userAccountRepository;

    UserRoleService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional
    UserSummaryResponse changeRole(UUID userId, AccountRole role) {
        UserAccount account = userAccountRepository
                .findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
        account.replaceRole(role);
        return UserSummaryResponse.from(account);
    }
}

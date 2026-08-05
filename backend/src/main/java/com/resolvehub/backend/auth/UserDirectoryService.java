package com.resolvehub.backend.auth;

import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDirectoryService {

    private static final Set<AccountRole> ASSIGNABLE_ROLES =
            Set.of(AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN);

    private final UserAccountRepository userAccountRepository;

    public UserDirectoryService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse requireAssignableUser(UUID userId) {
        UserAccount account = userAccountRepository
                .findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
        return UserSummaryResponse.from(account);
    }

    public boolean canBeAssigned(UserSummaryResponse user) {
        return user.active() && user.roles().stream().anyMatch(ASSIGNABLE_ROLES::contains);
    }
}

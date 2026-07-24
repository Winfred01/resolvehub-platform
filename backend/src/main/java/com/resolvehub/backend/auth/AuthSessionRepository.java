package com.resolvehub.backend.auth;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {

    @Query("""
            select distinct session
            from AuthSession session
            join fetch session.userAccount account
            left join fetch account.roles
            where session.tokenHash = :tokenHash
              and session.revokedAt is null
            """)
    Optional<AuthSession> findActiveByTokenHash(@Param("tokenHash") String tokenHash);
}

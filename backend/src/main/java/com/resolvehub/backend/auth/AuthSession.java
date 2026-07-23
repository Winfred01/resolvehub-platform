package com.resolvehub.backend.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "auth_sessions",
        uniqueConstraints = @UniqueConstraint(name = "uk_auth_sessions_token_hash", columnNames = "token_hash")
)
class AuthSession {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount userAccount;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected AuthSession() {
    }

    AuthSession(UserAccount userAccount, String tokenHash, Instant expiresAt) {
        this.userAccount = userAccount;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void markCreated() {
        createdAt = Instant.now();
    }

    UserAccount userAccount() {
        return userAccount;
    }

    Instant expiresAt() {
        return expiresAt;
    }

    boolean expired(Instant now) {
        return !expiresAt.isAfter(now);
    }

    void revoke(Instant now) {
        revokedAt = now;
    }
}

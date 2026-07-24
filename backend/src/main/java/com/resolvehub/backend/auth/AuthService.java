package com.resolvehub.backend.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class AuthService {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final Duration SESSION_TTL = Duration.ofHours(2);
    private static final String DUMMY_PASSWORD_HASH =
            "$2a$10$2gM35pu4K6BbBmh31LzQ3ePdDUfRCoYX87W5vP8N3dkscpbLvbUgy";

    private final UserAccountRepository userAccountRepository;
    private final AuthSessionRepository authSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    AuthService(
            UserAccountRepository userAccountRepository,
            AuthSessionRepository authSessionRepository,
            PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.authSessionRepository = authSessionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    LoginResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        UserAccount account = userAccountRepository.findByEmail(normalizedEmail).orElse(null);
        String passwordHash = account == null ? DUMMY_PASSWORD_HASH : account.passwordHash();

        if (!passwordEncoder.matches(request.password(), passwordHash) || account == null || !account.active()) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        String token = generateToken();
        Instant expiresAt = Instant.now().plus(SESSION_TTL);
        authSessionRepository.save(new AuthSession(account, hashToken(token), expiresAt));
        return new LoginResponse(token, "Bearer", expiresAt, UserSummaryResponse.from(account));
    }

    @Transactional
    void logout(String authorizationHeader) {
        AuthSession session = activeSession(authorizationHeader);
        session.revoke(Instant.now());
    }

    @Transactional(readOnly = true)
    UserSummaryResponse currentUser(String authorizationHeader) {
        return UserSummaryResponse.from(currentAccount(authorizationHeader));
    }

    @Transactional(readOnly = true)
    UserAccount currentAccount(String authorizationHeader) {
        return activeSession(authorizationHeader).userAccount();
    }

    private AuthSession activeSession(String authorizationHeader) {
        String token = parseBearerToken(authorizationHeader);
        Instant now = Instant.now();
        AuthSession session = authSessionRepository
                .findActiveByTokenHash(hashToken(token))
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication required."));
        if (session.expired(now) || !session.userAccount().active()) {
            throw new AuthenticationRequiredException("Authentication required.");
        }
        return session;
    }

    private String parseBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            throw new AuthenticationRequiredException("Authentication required.");
        }
        String token = authorizationHeader.substring(BEARER_PREFIX.length()).trim();
        if (token.isEmpty()) {
            throw new AuthenticationRequiredException("Authentication required.");
        }
        return token;
    }

    private String generateToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

package com.se73.patient_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenProviderTest {

    private static final String JWT_SECRET = "mySecretKeyForJwtTokenGenerationAndValidationPurposesOnly123456789";

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", JWT_SECRET);
    }

    @Test
    void validateTokenReturnsTrueForValidToken() {
        String token = buildToken("john", System.currentTimeMillis() + 60_000);

        boolean valid = jwtTokenProvider.validateToken(token);

        assertTrue(valid);
    }

    @Test
    void getUsernameFromTokenReturnsSubject() {
        String token = buildToken("alice", System.currentTimeMillis() + 60_000);

        String username = jwtTokenProvider.getUsernameFromToken(token);

        assertEquals("alice", username);
    }

    @Test
    void validateTokenReturnsFalseForMalformedToken() {
        boolean valid = jwtTokenProvider.validateToken("not-a-jwt-token");

        assertFalse(valid);
    }

    private String buildToken(String username, long expiryMillis) {
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date expiry = new Date(expiryMillis);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }
}

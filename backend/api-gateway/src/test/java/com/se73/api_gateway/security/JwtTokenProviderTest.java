package com.se73.api_gateway.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Collections;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "mySecretKeyForJwtTokenGenerationAndValidationPurposesOnly123456789";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", secret);
    }

    @Test
    void getUsernameFromToken_Success() {
        String token = generateToken("testuser", Collections.singletonList("ROLE_PATIENT"));
        String username = jwtTokenProvider.getUsernameFromToken(token);
        assertEquals("testuser", username);
    }

    @Test
    void getRoleFromToken_FromAuthorities() {
        String token = generateToken("testuser", Collections.singletonList("ROLE_PATIENT"));
        String role = jwtTokenProvider.getRoleFromToken(token);
        assertEquals("ROLE_PATIENT", role);
    }

    @Test
    void validateToken_Valid() {
        String token = generateToken("testuser", Collections.singletonList("ROLE_PATIENT"));
        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void validateToken_Invalid() {
        assertFalse(jwtTokenProvider.validateToken("invalidToken"));
    }

    @Test
    void validateToken_Expired() {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        String token = Jwts.builder()
                .subject("testuser")
                .expiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(key)
                .compact();
        assertFalse(jwtTokenProvider.validateToken(token));
    }

    private String generateToken(String username, Object authorities) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.builder()
                .subject(username)
                .claim("authorities", authorities)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 100000))
                .signWith(key)
                .compact();
    }
}

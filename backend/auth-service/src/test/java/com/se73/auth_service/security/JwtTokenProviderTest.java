package com.se73.auth_service.security;

import com.se73.auth_service.model.User;
import com.se73.auth_service.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "mySecretKeyForJwtTokenGenerationAndValidationPurposesOnly123456789";
    private final long expiration = 86400000;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", secret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", expiration);
    }

    @Test
    void generateToken_Success() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "testuser", null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_PATIENT")));

        String token = jwtTokenProvider.generateToken(auth);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("testuser", jwtTokenProvider.getUsernameFromToken(token));
    }

    @Test
    void generateTokenFromUsername_Success() {
        String token = jwtTokenProvider.generateTokenFromUsername("testuser");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("testuser", jwtTokenProvider.getUsernameFromToken(token));
    }

    @Test
    void generateTokenFromUser_Success() {
        User user = new User();
        user.setUsername("testuser");
        user.setRole(UserRole.PATIENT);

        String token = jwtTokenProvider.generateTokenFromUser(user);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("testuser", jwtTokenProvider.getUsernameFromToken(token));
    }

    @Test
    void validateToken_Invalid() {
        assertFalse(jwtTokenProvider.validateToken("invalidToken"));
    }

    @Test
    void validateToken_Expired() {
        // Setting a very short expiration to test expiry (or just use a known expired token if possible)
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", -1000L);
        String token = jwtTokenProvider.generateTokenFromUsername("testuser");
        
        assertFalse(jwtTokenProvider.validateToken(token));
    }
}

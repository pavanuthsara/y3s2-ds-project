package com.se73.auth_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import com.se73.auth_service.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:mySecretKeyForJwtTokenGenerationAndValidationPurposesOnly123456789}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;

    public String generateToken(Authentication authentication) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        String role = authentication.getAuthorities().stream()
            .map(auth -> auth.getAuthority())
            .findFirst()
            .orElse(null);

        io.jsonwebtoken.JwtBuilder builder = Jwts.builder()
                .subject(authentication.getName())
                .claim("authorities", authentication.getAuthorities().stream()
                        .map(auth -> auth.getAuthority())
                .toList())
            .issuedAt(now)
            .expiration(expiryDate);

        if (role != null) {
            builder.claim("role", role);
        }

        return builder.signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }

    public String generateTokenFromUsername(String username) {
        return generateTokenFromUsernameAndRole(username, null);
        }

        public String generateTokenFromUser(User user) {
        return generateTokenFromUsernameAndRole(user.getUsername(), user.getRole().name());
        }

        private String generateTokenFromUsernameAndRole(String username, String role) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        String authority = role == null ? null : "ROLE_" + role;

        io.jsonwebtoken.JwtBuilder builder = Jwts.builder()
                .subject(username)
                .issuedAt(now)
            .expiration(expiryDate);

        if (authority != null) {
            builder.claim("authorities", java.util.List.of(authority));
            builder.claim("role", authority);
        }

        return builder.signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }

    public String getUsernameFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

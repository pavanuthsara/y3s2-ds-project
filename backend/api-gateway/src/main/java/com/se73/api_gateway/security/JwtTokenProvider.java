package com.se73.api_gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:mySecretKeyForJwtTokenGenerationAndValidationPurposesOnly123456789}")
    private String jwtSecret;

    public String getUsernameFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Object authorities = claims.get("authorities");
        if (authorities instanceof Collection<?> collection && !collection.isEmpty()) {
            return collection.stream()
                    .map(Objects::toString)
                    .findFirst()
                    .orElse(null);
        }

        Object role = claims.get("role");
        if (role != null) {
            return role.toString();
        }

        return null;
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

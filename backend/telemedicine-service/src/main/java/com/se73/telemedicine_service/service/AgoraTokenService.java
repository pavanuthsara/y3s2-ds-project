package com.se73.telemedicine_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
public class AgoraTokenService {

    @Value("${agora.app-id}")
    private String agoraAppId;

    @Value("${agora.app-certificate}")
    private String agoraAppCertificate;

    @Value("${agora.token-ttl-seconds:3600}")
    private int defaultTtlSeconds;

    public String getAgoraAppId() {
        return agoraAppId;
    }

    public int getDefaultTtlSeconds() {
        return defaultTtlSeconds;
    }

    public String generateSessionToken(String roomName, UUID sessionId, int ttlSeconds) {
        long expiresAt = Instant.now().getEpochSecond() + ttlSeconds;
        String payload = roomName + ":" + sessionId + ":" + expiresAt + ":" + agoraAppId;
        String signature = hmacSha256(payload, agoraAppCertificate);
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString((payload + ":" + signature).getBytes(StandardCharsets.UTF_8));
    }

    private String hmacSha256(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] result = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(result);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate secure token", ex);
        }
    }
}

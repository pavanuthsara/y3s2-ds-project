package com.se73.telemedicine_service.service;

import com.se73.telemedicine_service.exception.ApiException;
import io.agora.media.RtcTokenBuilder2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class AgoraTokenService {

    private static final Pattern AGORA_APP_ID_PATTERN = Pattern.compile("^[A-Za-z0-9]{32}$");

    @Value("${agora.app-id}")
    private String agoraAppId;

    @Value("${agora.app-certificate}")
    private String agoraAppCertificate;

    @Value("${agora.token-ttl-seconds:3600}")
    private int defaultTtlSeconds;

    public String getAgoraAppId() {
        return sanitizeAndValidateAppId();
    }

    public int getDefaultTtlSeconds() {
        return defaultTtlSeconds;
    }

    public String generateSessionToken(String roomName, int ttlSeconds) {
        String appId = sanitizeAndValidateAppId();
        String appCertificate = sanitizeAndValidateAppCertificate();

        RtcTokenBuilder2 tokenBuilder = new RtcTokenBuilder2();
        
        // Use 0 as UID which means the token is valid for any UID
        // This matches the frontend expectation where the frontend generates its own UID
        return tokenBuilder.buildTokenWithUid(
                appId,
                appCertificate,
                roomName,
                0,
                RtcTokenBuilder2.Role.ROLE_PUBLISHER,
                ttlSeconds,
                ttlSeconds
        );
    }

    private String sanitizeAndValidateAppId() {
        String normalized = agoraAppId == null ? "" : agoraAppId.trim();
        if (normalized.isEmpty() || "demo-app-id".equalsIgnoreCase(normalized)) {
            throw new ApiException("AGORA_APP_ID is not configured. Set a valid Agora App ID in backend/.env and restart services.");
        }

        if (!AGORA_APP_ID_PATTERN.matcher(normalized).matches()) {
            throw new ApiException("AGORA_APP_ID format is invalid. Expected a 32-character Agora App ID.");
        }

        return normalized;
    }

    private String sanitizeAndValidateAppCertificate() {
        String normalized = agoraAppCertificate == null ? "" : agoraAppCertificate.trim();
        if (normalized.isEmpty() || "demo-app-certificate".equalsIgnoreCase(normalized)) {
            throw new ApiException("AGORA_APP_CERTIFICATE is not configured. Set a valid Agora App Certificate in backend/.env and restart services.");
        }
        return normalized;
    }

}

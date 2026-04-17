package com.se73.telemedicine_service.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SessionTokenResponse {
    private UUID sessionId;
    private String roomName;
    private String agoraAppId;
    private String token;
    private LocalDateTime expiresAt;
}

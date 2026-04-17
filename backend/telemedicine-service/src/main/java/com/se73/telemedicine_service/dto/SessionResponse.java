package com.se73.telemedicine_service.dto;

import com.se73.telemedicine_service.model.CompletionStatus;
import com.se73.telemedicine_service.model.SessionState;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SessionResponse {
    private UUID sessionId;
    private UUID appointmentId;
    private String roomName;
    private SessionState state;
    private CompletionStatus completionStatus;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Long durationSeconds;
}

package com.se73.telemedicine_service.model;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TelemedicineSession {
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

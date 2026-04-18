package com.se73.telemedicine_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SessionCreateRequest {
    @NotNull(message = "appointmentId is required")
    private UUID appointmentId;

    private Integer tokenTtlSeconds;
}

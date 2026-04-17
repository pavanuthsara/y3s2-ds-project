package com.SE73.appointment_service.dto;

import java.time.LocalDateTime;

/**
 * Generic error response DTO returned by the GlobalExceptionHandler
 * for all error scenarios (4xx and 5xx).
 */
public class ErrorResponse {

    private String message;
    private LocalDateTime timestamp;

    // ---------------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------------

    public ErrorResponse() {
    }

    public ErrorResponse(String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String message, LocalDateTime timestamp) {
        this.message = message;
        this.timestamp = timestamp;
    }

    // ---------------------------------------------------------------
    // Getters and Setters
    // ---------------------------------------------------------------

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

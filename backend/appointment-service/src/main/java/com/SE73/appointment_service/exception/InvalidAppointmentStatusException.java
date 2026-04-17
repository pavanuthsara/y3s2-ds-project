package com.SE73.appointment_service.exception;

/**
 * Exception thrown when an invalid or unsupported appointment status transition is requested.
 * Maps to HTTP 400 BAD REQUEST via GlobalExceptionHandler.
 */
public class InvalidAppointmentStatusException extends RuntimeException {

    public InvalidAppointmentStatusException(String message) {
        super(message);
    }

    public InvalidAppointmentStatusException(String message, Throwable cause) {
        super(message, cause);
    }
}

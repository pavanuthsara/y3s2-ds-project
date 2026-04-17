package com.SE73.appointment_service.exception;

/**
 * Exception thrown when an appointment cannot be found by the given identifier.
 * Maps to HTTP 404 NOT FOUND via GlobalExceptionHandler.
 */
public class AppointmentNotFoundException extends RuntimeException {

    public AppointmentNotFoundException(String message) {
        super(message);
    }

    public AppointmentNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}


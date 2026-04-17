package com.SE73.appointment_service.exception;

/**
 * Exception thrown when a downstream service is unavailable or returns an unexpected error.
 * Maps to HTTP 503 SERVICE UNAVAILABLE via GlobalExceptionHandler.
 */
public class ServiceUnavailableException extends RuntimeException {

    public ServiceUnavailableException(String message) {
        super(message);
    }

    public ServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}


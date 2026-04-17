package com.SE73.appointment_service.exception;

/**
 * Exception thrown when attempting to book a slot that is already taken.
 * Maps to HTTP 409 CONFLICT via GlobalExceptionHandler.
 */
public class SlotAlreadyBookedException extends RuntimeException {

    public SlotAlreadyBookedException(String message) {
        super(message);
    }

    public SlotAlreadyBookedException(String message, Throwable cause) {
        super(message, cause);
    }
}


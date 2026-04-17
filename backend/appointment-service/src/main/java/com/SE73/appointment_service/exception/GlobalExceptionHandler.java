package com.SE73.appointment_service.exception;

import com.SE73.appointment_service.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Global exception handler for the Appointment Service.
 * Centralises error handling and maps domain exceptions to appropriate HTTP responses.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles appointment not found → 404 NOT FOUND
     */
    @ExceptionHandler(AppointmentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAppointmentNotFoundException(AppointmentNotFoundException ex) {
        logger.warn("Appointment not found: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handles double-booking of a slot → 409 CONFLICT
     */
    @ExceptionHandler(SlotAlreadyBookedException.class)
    public ResponseEntity<ErrorResponse> handleSlotAlreadyBookedException(SlotAlreadyBookedException ex) {
        logger.warn("Slot already booked: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Handles invalid status transitions → 400 BAD REQUEST
     */
    @ExceptionHandler(InvalidAppointmentStatusException.class)
    public ResponseEntity<ErrorResponse> handleInvalidAppointmentStatusException(InvalidAppointmentStatusException ex) {
        logger.warn("Invalid appointment status: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handles Bean Validation failures → 400 BAD REQUEST with field error details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        // Collect all field-level validation error messages
        String details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        logger.warn("Validation failed: {}", details);
        ErrorResponse error = new ErrorResponse("Validation failed: " + details, LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handles service unavailable errors → 503 SERVICE UNAVAILABLE
     */
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleServiceUnavailableException(ServiceUnavailableException ex) {
        logger.error("Service unavailable: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }

    /**
     * Catch-all handler for unexpected exceptions → 500 INTERNAL SERVER ERROR
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse(
                "An unexpected error occurred. Please try again later.",
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}


package com.SE73.appointment_service.exception;

import com.SE73.appointment_service.dto.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler globalExceptionHandler = new GlobalExceptionHandler();

    @Test
    void handlesAppointmentNotFound() {
        ErrorResponse response = globalExceptionHandler
                .handleAppointmentNotFoundException(new AppointmentNotFoundException("missing"))
                .getBody();

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, globalExceptionHandler
                .handleAppointmentNotFoundException(new AppointmentNotFoundException("missing"))
                .getStatusCode());
        assertEquals("missing", response.getMessage());
    }

    @Test
    void handlesSlotAlreadyBooked() {
        ErrorResponse response = globalExceptionHandler
                .handleSlotAlreadyBookedException(new SlotAlreadyBookedException("slot taken"))
                .getBody();

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, globalExceptionHandler
                .handleSlotAlreadyBookedException(new SlotAlreadyBookedException("slot taken"))
                .getStatusCode());
        assertEquals("slot taken", response.getMessage());
    }

    @Test
    void handlesInvalidStatus() {
        ErrorResponse response = globalExceptionHandler
                .handleInvalidAppointmentStatusException(new InvalidAppointmentStatusException("bad status"))
                .getBody();

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, globalExceptionHandler
                .handleInvalidAppointmentStatusException(new InvalidAppointmentStatusException("bad status"))
                .getStatusCode());
        assertEquals("bad status", response.getMessage());
    }

    @Test
    void handlesServiceUnavailable() {
        ErrorResponse response = globalExceptionHandler
                .handleServiceUnavailableException(new ServiceUnavailableException("down"))
                .getBody();

        assertNotNull(response);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, globalExceptionHandler
                .handleServiceUnavailableException(new ServiceUnavailableException("down"))
                .getStatusCode());
        assertEquals("down", response.getMessage());
    }

    @Test
    void handlesGenericException() {
        ErrorResponse response = globalExceptionHandler.handleGenericException(new RuntimeException("boom")).getBody();

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, globalExceptionHandler
                .handleGenericException(new RuntimeException("boom"))
                .getStatusCode());
        assertEquals("An unexpected error occurred. Please try again later.", response.getMessage());
    }
}
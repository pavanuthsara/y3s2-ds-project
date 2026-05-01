package com.se73.auth_service.exception;

import com.se73.auth_service.dto.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleBadCredentials_ReturnsUnauthorized() {
        BadCredentialsException ex = new BadCredentialsException("bad");
        ResponseEntity<ErrorResponse> response = handler.handleBadCredentials(ex);
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Invalid username or password", response.getBody().getMessage());
    }

    @Test
    void handleUserNotFoundException_ReturnsNotFound() {
        UserNotFoundException ex = new UserNotFoundException("User not found");
        ResponseEntity<ErrorResponse> response = handler.handleNotFound(ex);
        
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("User not found", response.getBody().getMessage());
    }

    @Test
    void handleRuntimeException_ReturnsBadRequest() {
        RuntimeException ex = new RuntimeException("error message");
        ResponseEntity<ErrorResponse> response = handler.handleRuntimeException(ex);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("error message", response.getBody().getMessage());
    }

    @Test
    void handleGeneralException_ReturnsInternalError() {
        Exception ex = new Exception("unexpected");
        ResponseEntity<ErrorResponse> response = handler.handleGeneralException(ex);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("An unexpected error occurred", response.getBody().getMessage());
    }
}

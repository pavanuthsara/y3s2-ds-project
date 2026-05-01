package com.se73.api_gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GenericProxyTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private HttpServletRequest request;

    private AppointmentProxyController appointmentProxyController;
    private SymptomProxyController symptomProxyController;

    @BeforeEach
    void setUp() {
        appointmentProxyController = new AppointmentProxyController(restTemplate, "http://app-service");
        symptomProxyController = new SymptomProxyController(restTemplate, "http://sym-service");
    }

    @Test
    void testAppointmentProxy() {
        when(request.getRequestURI()).thenReturn("/api/appointments/1");
        when(request.getMethod()).thenReturn("GET");
        
        ResponseEntity<Object> expectedResponse = new ResponseEntity<>("ok", HttpStatus.OK);
        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<?> response = appointmentProxyController.proxyRequest(request, "Bearer token", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testSymptomProxy() {
        ResponseEntity<Object> expectedResponse = new ResponseEntity<>("checked", HttpStatus.OK);
        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<?> response = symptomProxyController.analyzeSymptoms(new Object());

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}

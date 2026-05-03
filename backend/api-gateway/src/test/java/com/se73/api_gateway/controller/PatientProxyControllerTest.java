package com.se73.api_gateway.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PatientProxyControllerTest {

    @Mock
    private RestTemplate restTemplate;

    private PatientProxyController patientProxyController;
    private final String patientServiceUrl = "http://patient-service:8082/api/patients";

    @BeforeEach
    void setUp() {
        patientProxyController = new PatientProxyController(restTemplate, patientServiceUrl);
    }

    @Test
    void getMyProfile_Success() {
        ResponseEntity<Object> expectedResponse = new ResponseEntity<>("profile", HttpStatus.OK);
        when(restTemplate.exchange(eq(patientServiceUrl + "/me"), eq(HttpMethod.GET), any(), eq(Object.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<?> response = patientProxyController.getMyProfile("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("profile", response.getBody());
    }

    @Test
    void uploadReport_Success() throws Exception {
        org.springframework.web.multipart.MultipartFile file = mock(org.springframework.web.multipart.MultipartFile.class);
        when(file.getBytes()).thenReturn("content".getBytes());
        when(file.getOriginalFilename()).thenReturn("test.pdf");

        ResponseEntity<Object> expectedResponse = new ResponseEntity<>("ok", HttpStatus.OK);
        lenient().when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<?> response = patientProxyController.uploadReport("token", 1L, file, "desc");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void createProfile_Success() {
        Object body = new Object();
        ResponseEntity<Object> expectedResponse = new ResponseEntity<>("created", HttpStatus.CREATED);
        when(restTemplate.exchange(eq(patientServiceUrl), eq(HttpMethod.POST), any(), eq(Object.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<?> response = patientProxyController.createProfile("Bearer token", body);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }
}

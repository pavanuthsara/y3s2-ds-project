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
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProxyControllerTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private HttpServletRequest request;

    private ProxyController proxyController;
    private final String authServiceUrl = "http://auth-service:8081/api/auth";

    @BeforeEach
    void setUp() {
        proxyController = new ProxyController(restTemplate, authServiceUrl);
    }

    @Test
    void login_Success() {
        ProxyController.LoginRequest request = new ProxyController.LoginRequest();
        request.username = "test";
        request.password = "pass";

        ResponseEntity<Object> expectedResponse = new ResponseEntity<>("ok", HttpStatus.OK);
        when(restTemplate.postForEntity(eq(authServiceUrl + "/login"), any(), eq(Object.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<?> response = proxyController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("ok", response.getBody());
    }

    @Test
    void login_Failure() {
        ProxyController.LoginRequest request = new ProxyController.LoginRequest();
        
        HttpStatusCodeException ex = mock(HttpStatusCodeException.class);
        when(ex.getStatusCode()).thenReturn(HttpStatus.UNAUTHORIZED);
        when(ex.getResponseBodyAsString()).thenReturn("fail");
        
        when(restTemplate.postForEntity(anyString(), any(), any()))
                .thenThrow(ex);

        ResponseEntity<?> response = proxyController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("fail", response.getBody());
    }

    @Test
    void validate_Success() {
        ResponseEntity<Object> expectedResponse = new ResponseEntity<>("valid", HttpStatus.OK);
        when(restTemplate.exchange(eq(authServiceUrl + "/validate"), any(), any(), eq(Object.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<?> response = proxyController.validate("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void register_Success() {
        ProxyController.RegisterRequest req = new ProxyController.RegisterRequest();
        ResponseEntity<Object> expectedResponse = new ResponseEntity<>("ok", HttpStatus.OK);
        when(restTemplate.postForEntity(anyString(), any(), eq(Object.class))).thenReturn(expectedResponse);

        ResponseEntity<?> response = proxyController.register(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getUser_Success() {
        when(request.getHeader("Authorization")).thenReturn("Bearer token");
        ResponseEntity<String> expectedResponse = new ResponseEntity<>("user", HttpStatus.OK);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<?> response = proxyController.getUser("test", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}

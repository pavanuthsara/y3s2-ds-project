package com.se73.auth_service.controller;

import com.se73.auth_service.dto.*;
import com.se73.auth_service.model.User;
import com.se73.auth_service.model.UserRole;
import com.se73.auth_service.security.JwtTokenProvider;
import com.se73.auth_service.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @InjectMocks
    private AuthController authController;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserService userService;

    private User user;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setRole(UserRole.PATIENT);

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password");
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");
        registerRequest.setRole("PATIENT");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password");
    }

    @Test
    void registerUser_Success() {
        when(userService.registerUser(any(RegisterRequest.class))).thenReturn(user);
        when(jwtTokenProvider.generateTokenFromUsername(anyString())).thenReturn("testToken");

        ResponseEntity<?> response = authController.registerUser(registerRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        AuthResponse authResponse = (AuthResponse) response.getBody();
        assertNotNull(authResponse);
        assertEquals("testToken", authResponse.getToken());
        assertEquals("testuser", authResponse.getUsername());
    }

    @Test
    void loginUser_Success() {
        Authentication auth = new UsernamePasswordAuthenticationToken("testuser", "password");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtTokenProvider.generateToken(any(Authentication.class))).thenReturn("testToken");
        when(userService.findByUsername(anyString())).thenReturn(user);

        ResponseEntity<?> response = authController.loginUser(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        AuthResponse authResponse = (AuthResponse) response.getBody();
        assertNotNull(authResponse);
        assertEquals("testToken", authResponse.getToken());
    }

    @Test
    void validateToken_Success() {
        when(jwtTokenProvider.validateToken(anyString())).thenReturn(true);
        when(jwtTokenProvider.getUsernameFromToken(anyString())).thenReturn("testuser");

        ResponseEntity<TokenValidationResponse> response = authController.validateToken("Bearer testToken");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(true, response.getBody().isValid());
        assertEquals("testuser", response.getBody().getUsername());
    }

    @Test
    void validateToken_Invalid() {
        when(jwtTokenProvider.validateToken(anyString())).thenReturn(false);

        ResponseEntity<TokenValidationResponse> response = authController.validateToken("Bearer invalidToken");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(false, response.getBody().isValid());
    }

    @Test
    void getUser_Success() {
        when(userService.findByUsername("testuser")).thenReturn(user);

        ResponseEntity<UserResponse> response = authController.getUser("testuser");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("testuser", response.getBody().getUsername());
        assertEquals("test@example.com", response.getBody().getEmail());
    }
}

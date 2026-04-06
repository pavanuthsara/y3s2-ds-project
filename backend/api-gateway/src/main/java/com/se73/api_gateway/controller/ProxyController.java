package com.se73.api_gateway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/auth")
public class ProxyController {

    @Autowired
    private RestTemplate restTemplate;

    private static final String AUTH_SERVICE_URL = "http://auth-service:8081/api/auth";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return restTemplate.postForEntity(AUTH_SERVICE_URL + "/login", request, Object.class);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return restTemplate.postForEntity(AUTH_SERVICE_URL + "/register", request, Object.class);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return restTemplate.getForEntity(AUTH_SERVICE_URL + "/validate?token=" + token, Object.class);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        return restTemplate.getForEntity(AUTH_SERVICE_URL + "/user/" + username, Object.class);
    }

    // Inner classes for request DTOs
    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
        public String firstName;
        public String lastName;
        public String role;
    }
}

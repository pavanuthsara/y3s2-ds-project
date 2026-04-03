package com.se73.api_gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/auth")
public class ProxyController {

    private final RestTemplate restTemplate;
    private final String authServiceUrl;

    public ProxyController(RestTemplate restTemplate, @Value("${services.auth.base-url}") String authServiceUrl) {
        this.restTemplate = restTemplate;
        this.authServiceUrl = authServiceUrl;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return restTemplate.postForEntity(authServiceUrl + "/login", request, Object.class);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return restTemplate.postForEntity(authServiceUrl + "/register", request, Object.class);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestHeader("Authorization") String authHeader) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);

            return restTemplate.exchange(
                    authServiceUrl + "/validate",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Object.class
            );
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        return restTemplate.getForEntity(authServiceUrl + "/user/" + username, Object.class);
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

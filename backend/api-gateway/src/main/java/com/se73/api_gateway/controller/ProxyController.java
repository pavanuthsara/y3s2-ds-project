package com.se73.api_gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.HttpClientErrorException;
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
    public ResponseEntity<?> getUser(@PathVariable String username, HttpServletRequest request) {
        // 1. Extract the Authorization header from the incoming Postman request
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        // 2. Attach it to the outgoing request
        HttpHeaders headers = new HttpHeaders();
        if (authHeader != null) {
            headers.set(HttpHeaders.AUTHORIZATION, authHeader);
        }

        // We use HttpEntity to wrap the headers
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // 3. MUST use exchange() instead of getForEntity() so we can pass the headers
            ResponseEntity<String> response = restTemplate.exchange(
                    "http://auth-service:8081/api/auth/user/" + username,
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            return response;
        } catch (HttpClientErrorException e) {
            // This prevents the gateway from crashing on a 403 or 401
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        }
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

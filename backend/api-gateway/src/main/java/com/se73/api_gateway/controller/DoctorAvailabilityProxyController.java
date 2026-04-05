package com.se73.api_gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/doctors/availability")
public class DoctorAvailabilityProxyController {

    private static final String AUTH_SERVICE_AVAILABILITY_URL = "http://localhost:8081/api/auth/doctors/availability";

    private final RestTemplate restTemplate;

    public DoctorAvailabilityProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public ResponseEntity<?> getAvailability(HttpServletRequest request) {
        HttpHeaders headers = buildForwardHeaders(request);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(
                AUTH_SERVICE_AVAILABILITY_URL,
                HttpMethod.GET,
                entity,
                Object.class
        );
    }

    @PutMapping
    public ResponseEntity<?> replaceAvailability(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body
    ) {
        HttpHeaders headers = buildForwardHeaders(request);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        return restTemplate.exchange(
                AUTH_SERVICE_AVAILABILITY_URL,
                HttpMethod.PUT,
                entity,
                Object.class
        );
    }

    @PostMapping("/slots")
    public ResponseEntity<?> addAvailabilitySlot(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body
    ) {
        HttpHeaders headers = buildForwardHeaders(request);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        return restTemplate.exchange(
                AUTH_SERVICE_AVAILABILITY_URL + "/slots",
                HttpMethod.POST,
                entity,
                Object.class
        );
    }

    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<?> deleteAvailabilitySlot(
            HttpServletRequest request,
            @PathVariable Long slotId
    ) {
        HttpHeaders headers = buildForwardHeaders(request);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(
                AUTH_SERVICE_AVAILABILITY_URL + "/slots/" + slotId,
                HttpMethod.DELETE,
                entity,
                Object.class
        );
    }

    private HttpHeaders buildForwardHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();

        String authorization = request.getHeader("Authorization");
        String userId = request.getHeader("X-User-Id");
        String userRole = request.getHeader("X-User-Role");

        if (authorization != null) {
            headers.set("Authorization", authorization);
        }
        if (userId != null) {
            headers.set("X-User-Id", userId);
        }
        if (userRole != null) {
            headers.set("X-User-Role", userRole);
        }

        return headers;
    }
}

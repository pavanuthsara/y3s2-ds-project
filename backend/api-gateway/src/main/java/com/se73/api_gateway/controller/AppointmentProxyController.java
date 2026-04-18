package com.se73.api_gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentProxyController {

    private final RestTemplate restTemplate;
    private final String appointmentServiceUrl;

    public AppointmentProxyController(
            RestTemplate restTemplate,
            @Value("${services.appointment.base-url}") String appointmentServiceUrl
    ) {
        this.restTemplate = restTemplate;
        this.appointmentServiceUrl = appointmentServiceUrl;
    }

    @RequestMapping(value = "/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> proxyRequest(
            HttpServletRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody(required = false) Object requestBody
    ) {
        // Extract the path after /api/appointments
        String path = request.getRequestURI().replaceFirst("/api/appointments", "");
        if ("/".equals(path)) {
            path = "";
        }
        
        // Append query parameters if present
        String queryString = request.getQueryString();
        String fullPath = path + (queryString != null ? "?" + queryString : "");

        try {
            HttpHeaders headers = new HttpHeaders();
            if (authorization != null) {
                headers.set("Authorization", authorization);
            }
            if (userId != null) {
                headers.set("X-User-Id", userId);
            }
            if (userRole != null) {
                headers.set("X-User-Role", userRole);
            }
            
            // Re-use content type to pass JSON properly if needed
            if (request.getContentType() != null) {
                headers.set("Content-Type", request.getContentType());
            }

            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
            HttpMethod httpMethod = HttpMethod.valueOf(request.getMethod());
            
            return restTemplate.exchange(appointmentServiceUrl + fullPath, httpMethod, entity, Object.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        }
    }
}

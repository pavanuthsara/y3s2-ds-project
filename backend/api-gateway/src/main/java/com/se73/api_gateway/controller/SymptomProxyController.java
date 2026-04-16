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
@RequestMapping("/api/symptoms")
public class SymptomProxyController {

    private final RestTemplate restTemplate;
    private final String symptomServiceUrl;

    public SymptomProxyController(
            RestTemplate restTemplate,
            @Value("${services.symptom-checker.base-url}") String symptomServiceUrl
    ) {
        this.restTemplate = restTemplate;
        this.symptomServiceUrl = symptomServiceUrl;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeSymptoms(@RequestBody Object requestBody) {
        return forward("/analyze", HttpMethod.POST, null, requestBody);
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return forward("/health", HttpMethod.GET, null, null);
    }

    @GetMapping("/info")
    public ResponseEntity<?> getInfo() {
        return forward("/info", HttpMethod.GET, null, null);
    }

    private ResponseEntity<?> forward(String path, HttpMethod method, String authorization, Object body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            if (authorization != null) {
                headers.set("Authorization", authorization);
            }
            headers.set("Content-Type", "application/json");

            HttpEntity<Object> entity = new HttpEntity<>(body, headers);
            return restTemplate.exchange(symptomServiceUrl + path, method, entity, Object.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }

}

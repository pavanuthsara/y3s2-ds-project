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
@RequestMapping("/api/patients")
public class PatientProxyController {

    private final RestTemplate restTemplate;
    private final String patientServiceUrl;

    public PatientProxyController(
            RestTemplate restTemplate,
            @Value("${services.patient.base-url}") String patientServiceUrl
    ) {
        this.restTemplate = restTemplate;
        this.patientServiceUrl = patientServiceUrl;
    }

    @PostMapping
    public ResponseEntity<?> createProfile(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Object requestBody
    ) {
        return forward("", HttpMethod.POST, authorization, requestBody);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String authorization) {
        return forward("/me", HttpMethod.GET, authorization, null);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Object requestBody
    ) {
        return forward("/me", HttpMethod.PUT, authorization, requestBody);
    }

    private ResponseEntity<?> forward(String path, HttpMethod method, String authorization, Object body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authorization);

            HttpEntity<Object> entity = new HttpEntity<>(body, headers);
            return restTemplate.exchange(patientServiceUrl + path, method, entity, Object.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        }
    }
}

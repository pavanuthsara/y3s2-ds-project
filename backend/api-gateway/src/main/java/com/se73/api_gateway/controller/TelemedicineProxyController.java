package com.se73.api_gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/telemedicine")
public class TelemedicineProxyController {

    private final RestTemplate restTemplate;
    private final String telemedicineServiceUrl;

    public TelemedicineProxyController(
            RestTemplate restTemplate,
            @Value("${services.telemedicine.base-url}") String telemedicineServiceUrl
    ) {
        this.restTemplate = restTemplate;
        this.telemedicineServiceUrl = telemedicineServiceUrl;
    }

    @RequestMapping(value = "/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> proxyRequest(
            HttpServletRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) Object requestBody
    ) {
        String path = request.getRequestURI().replaceFirst("/api/telemedicine", "");
        if ("/".equals(path)) {
            path = "";
        }

        String queryString = request.getQueryString();
        String fullPath = path + (queryString != null ? "?" + queryString : "");

        try {
            HttpHeaders headers = new HttpHeaders();
            if (authorization != null) {
                headers.set("Authorization", authorization);
            }
            if (request.getContentType() != null) {
                headers.set("Content-Type", request.getContentType());
            }

            HttpEntity<Object> entity;
            if ("GET".equalsIgnoreCase(request.getMethod())) {
                entity = new HttpEntity<>(headers);
            } else {
                entity = new HttpEntity<>(requestBody, headers);
            }
            HttpMethod httpMethod = HttpMethod.valueOf(request.getMethod());

            ResponseEntity<Object> response = restTemplate.exchange(telemedicineServiceUrl + fullPath, httpMethod, entity, Object.class);
            return ResponseEntity.status(response.getStatusCode())
                    .headers(filterHeaders(response.getHeaders()))
                    .body(response.getBody());
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .headers(filterHeaders(ex.getResponseHeaders()))
                    .body(ex.getResponseBodyAsString());
        }
    }

    private HttpHeaders filterHeaders(HttpHeaders originalHeaders) {
        HttpHeaders filtered = new HttpHeaders();
        if (originalHeaders != null) {
            originalHeaders.forEach((key, values) -> {
                String lowerKey = key.toLowerCase();
                if (!lowerKey.startsWith("access-control-") &&
                    !lowerKey.equals("transfer-encoding") &&
                    !lowerKey.equals("connection")) {
                    filtered.addAll(key, values);
                }
            });
        }
        return filtered;
    }
}

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

            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
            HttpMethod httpMethod = HttpMethod.valueOf(request.getMethod());

            return restTemplate.exchange(telemedicineServiceUrl + fullPath, httpMethod, entity, Object.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .headers(ex.getResponseHeaders())
                    .body(ex.getResponseBodyAsString());
        }
    }
}

package com.se73.api_gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

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
        return forward("", HttpMethod.POST, authorization, requestBody, Object.class);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String authorization) {
        return forward("/me", HttpMethod.GET, authorization, null, Object.class);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Object requestBody
    ) {
        return forward("/me", HttpMethod.PUT, authorization, requestBody, Object.class);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getHistory(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id
    ) {
        return forward("/" + id + "/history", HttpMethod.GET, authorization, null, Object.class);
    }

    @GetMapping("/{id}/prescriptions")
    public ResponseEntity<?> getPrescriptions(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id
    ) {
        return forward("/" + id + "/prescriptions", HttpMethod.GET, authorization, null, Object.class);
    }

    @GetMapping("/{id}/reports")
    public ResponseEntity<?> getReports(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id
    ) {
        return forward("/" + id + "/reports", HttpMethod.GET, authorization, null, Object.class);
    }

    @GetMapping("/{id}/reports/{reportId}")
    public ResponseEntity<?> getReport(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @PathVariable Long reportId
    ) {
        return forward("/" + id + "/reports/" + reportId, HttpMethod.GET, authorization, null, Object.class);
    }

    @DeleteMapping("/{id}/reports/{reportId}")
    public ResponseEntity<?> deleteReport(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @PathVariable Long reportId
    ) {
        return forward("/" + id + "/reports/" + reportId, HttpMethod.DELETE, authorization, null, Object.class);
    }

    @GetMapping("/{id}/reports/{reportId}/download")
    public ResponseEntity<?> downloadReport(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @PathVariable Long reportId
    ) {
        return forward("/" + id + "/reports/" + reportId + "/download", HttpMethod.GET, authorization, null, byte[].class);
    }

    @PostMapping(value = "/{id}/reports", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadReport(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description
    ) {
        try {
            HttpHeaders headers = createHeaders(authorization);
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            if (description != null) {
                body.add("description", description);
            }

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            return restTemplate.exchange(patientServiceUrl + "/" + id + "/reports", HttpMethod.POST, entity, Object.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .headers(ex.getResponseHeaders())
                    .body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(ex.getMessage());
        }
    }

    @RequestMapping(value = "/{id}/reports/{reportId}/download/**", method = RequestMethod.GET)
    public ResponseEntity<?> fallbackDownloadProxy(HttpServletRequest request,
                                                   @RequestHeader("Authorization") String authorization) {
        String path = request.getRequestURI().replaceFirst("/api/patients", "");
        return forward(path, HttpMethod.GET, authorization, null, byte[].class);
    }

    private <T> ResponseEntity<?> forward(String path, HttpMethod method, String authorization, Object body, Class<T> responseType) {
        try {
            HttpEntity<Object> entity = new HttpEntity<>(body, createHeaders(authorization));
            ResponseEntity<T> response = restTemplate.exchange(patientServiceUrl + path, method, entity, responseType);
            return ResponseEntity.status(response.getStatusCode())
                    .headers(response.getHeaders())
                    .body(response.getBody());
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .headers(ex.getResponseHeaders())
                    .body(ex.getResponseBodyAsString());
        }
    }

    private HttpHeaders createHeaders(String authorization) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorization);
        return headers;
    }
}

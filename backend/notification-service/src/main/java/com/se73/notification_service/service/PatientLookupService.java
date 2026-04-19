package com.se73.notification_service.service;

import com.se73.notification_service.dto.PatientContactInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Fetch the caller's patient profile from patient-service using a forwarded JWT.
 * Used as a fallback when the notification request doesn't carry recipient contact info.
 */
@Service
@Slf4j
public class PatientLookupService {

    private final RestTemplate restTemplate;

    @Value("${notification.patient-service.url}")
    private String patientServiceUrl;

    public PatientLookupService() {
        this.restTemplate = new RestTemplate();
    }

    public PatientContactInfo lookupSelf(String bearerToken) {
        if (bearerToken == null || bearerToken.isBlank()) {
            return null;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", bearerToken.startsWith("Bearer ") ? bearerToken : "Bearer " + bearerToken);
            HttpEntity<Void> req = new HttpEntity<>(headers);

            ResponseEntity<Map> resp = restTemplate.exchange(
                    patientServiceUrl + "/me",
                    HttpMethod.GET,
                    req,
                    Map.class
            );

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                return null;
            }

            Map<?, ?> body = resp.getBody();
            String email = asString(body.get("email"));
            String phone = asString(body.get("phoneNumber"));
            if (phone == null) phone = asString(body.get("phone"));
            String firstName = asString(body.get("firstName"));
            String lastName = asString(body.get("lastName"));
            String username = asString(body.get("username"));
            String displayName = (firstName != null || lastName != null)
                    ? (nullToEmpty(firstName) + " " + nullToEmpty(lastName)).trim()
                    : username;

            return PatientContactInfo.builder()
                    .patientId(username)
                    .email(email)
                    .phone(phone)
                    .displayName(displayName)
                    .build();
        } catch (RestClientException e) {
            log.warn("Patient lookup failed: {}", e.getMessage());
            return null;
        }
    }

    private static String asString(Object v) {
        return v == null ? null : v.toString();
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}

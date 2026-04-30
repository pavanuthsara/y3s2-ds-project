package com.SE73.appointment_service.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Component
public class DoctorClient {

    private static final Logger logger = LoggerFactory.getLogger(DoctorClient.class);
    
    private final RestTemplate restTemplate;
    private final String doctorServiceUrl;

    public DoctorClient(
            RestTemplate restTemplate,
            @Value("${services.doctor.base-url:http://localhost:8081/api/doctors}") String doctorServiceUrl
    ) {
        this.restTemplate = restTemplate;
        this.doctorServiceUrl = doctorServiceUrl;
    }

    public void updateSlotStatus(UUID slotId, boolean active) {
        try {
            String url = doctorServiceUrl + "/availability/slots/" + slotId + "/status?active=" + active;
            restTemplate.patchForObject(url, null, Void.class);
            logger.info("Successfully updated slot status {} to active={}", slotId, active);
        } catch (Exception e) {
            logger.error("Failed to update doctor availability slot status for slot {}", slotId, e);
            // We log the error but don't prevent the appointment cancellation from returning successfully
            // since this is a side effect.
        }
    }
}

package com.se73.telemedicine_service.service;

import com.se73.telemedicine_service.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Component
public class AppointmentClient {

    private final RestTemplate restTemplate;
    private final String appointmentBaseUrl;

    public AppointmentClient(RestTemplate restTemplate,
                             @Value("${appointment.service.base-url}") String appointmentBaseUrl) {
        this.restTemplate = restTemplate;
        this.appointmentBaseUrl = appointmentBaseUrl;
    }

    public void assertAppointmentConfirmed(UUID appointmentId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(
                    appointmentBaseUrl + "/" + appointmentId,
                    Map.class
            );

            if (response == null) {
                throw new ApiException("Appointment not found for id: " + appointmentId);
            }

            Object status = response.get("status");
            if (status == null || !"CONFIRMED".equalsIgnoreCase(String.valueOf(status))) {
                throw new ApiException("Telemedicine session can be created only for CONFIRMED appointments");
            }
        } catch (RestClientException ex) {
            throw new ApiException("Unable to verify appointment status: " + ex.getMessage());
        }
    }
}

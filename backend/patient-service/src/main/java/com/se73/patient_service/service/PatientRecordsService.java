package com.se73.patient_service.service;

import com.se73.patient_service.dto.PatientAppointmentHistoryResponse;
import com.se73.patient_service.dto.PatientPrescriptionResponse;
import com.se73.patient_service.model.PatientProfile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class PatientRecordsService {

    private final RestTemplate restTemplate;
    private final String appointmentServiceBaseUrl;
    private final String prescriptionServiceBaseUrl;

    public PatientRecordsService(
            RestTemplate restTemplate,
            @Value("${services.appointment.base-url:http://localhost:8085/api/appointments}") String appointmentServiceBaseUrl,
            @Value("${services.prescription.base-url:http://localhost:8083/api/prescriptions}") String prescriptionServiceBaseUrl
    ) {
        this.restTemplate = restTemplate;
        this.appointmentServiceBaseUrl = appointmentServiceBaseUrl;
        this.prescriptionServiceBaseUrl = prescriptionServiceBaseUrl;
    }

    public List<PatientAppointmentHistoryResponse> getPatientHistory(PatientProfile patient) {
        String url = appointmentServiceBaseUrl + "/patient/" + patient.getUsername();
        return getList(url, new ParameterizedTypeReference<>() {}, "appointment history");
    }

    public List<PatientPrescriptionResponse> getPatientPrescriptions(PatientProfile patient) {
        String url = prescriptionServiceBaseUrl + "/patient/" + patient.getUsername();
        return getList(url, new ParameterizedTypeReference<>() {}, "prescriptions");
    }

    public void cancelAppointment(UUID appointmentId) {
        try {
            String url = appointmentServiceBaseUrl + "/" + appointmentId;
            restTemplate.delete(url);
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException("Failed to cancel appointment: " + e.getStatusCode().value(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to cancel appointment", e);
        }
    }

    private <T> List<T> getList(String url, ParameterizedTypeReference<List<T>> responseType, String label) {

        try {
            ResponseEntity<List<T>> response = restTemplate.exchange(url, HttpMethod.GET, null, responseType);
            List<T> body = response.getBody();
            return body == null ? Collections.emptyList() : body;
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException("Failed to fetch " + label + ": " + e.getStatusCode().value(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch " + label, e);
        }
    }
}

package com.se73.patient_service.service;

import com.se73.patient_service.dto.PatientAppointmentHistoryResponse;
import com.se73.patient_service.dto.PatientPrescriptionResponse;
import com.se73.patient_service.model.PatientProfile;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientRecordsServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Test
    void getPatientHistoryReturnsDataFromAppointmentService() {
        PatientProfile profile = new PatientProfile();
        profile.setUsername("john");

        PatientAppointmentHistoryResponse record = new PatientAppointmentHistoryResponse();
        record.setDoctorUsername("doctor-1");

        when(restTemplate.exchange(
                eq("http://appointments/api/appointments/patient/john"),
                eq(HttpMethod.GET),
                eq(null),
                any(ParameterizedTypeReference.class)
        )).thenReturn(ResponseEntity.ok(List.of(record)));

        PatientRecordsService service = new PatientRecordsService(
                restTemplate,
                "http://appointments/api/appointments",
                "http://doctors/api/prescriptions"
        );

        List<PatientAppointmentHistoryResponse> history = service.getPatientHistory(profile);

        assertEquals(1, history.size());
        assertEquals("doctor-1", history.get(0).getDoctorUsername());
    }

    @Test
    void getPatientPrescriptionsReturnsDataFromDoctorService() {
        PatientProfile profile = new PatientProfile();
        profile.setUsername("john");

        PatientPrescriptionResponse prescription = new PatientPrescriptionResponse();
        prescription.setMedication("Amoxicillin");

        when(restTemplate.exchange(
                eq("http://doctors/api/prescriptions/patient/john"),
                eq(HttpMethod.GET),
                eq(null),
                any(ParameterizedTypeReference.class)
        )).thenReturn(ResponseEntity.ok(List.of(prescription)));

        PatientRecordsService service = new PatientRecordsService(
                restTemplate,
                "http://appointments/api/appointments",
                "http://doctors/api/prescriptions"
        );

        List<PatientPrescriptionResponse> prescriptions = service.getPatientPrescriptions(profile);

        assertEquals(1, prescriptions.size());
        assertEquals("Amoxicillin", prescriptions.get(0).getMedication());
    }

    @Test
    void cancelAppointmentDelegatesDeleteToAppointmentService() {
        UUID appointmentId = UUID.randomUUID();

        PatientRecordsService service = new PatientRecordsService(
                restTemplate,
                "http://appointments/api/appointments",
                "http://doctors/api/prescriptions"
        );

        service.cancelAppointment(appointmentId);

        verify(restTemplate).delete("http://appointments/api/appointments/" + appointmentId);
    }

    @Test
    void getPatientHistoryWrapsRemoteErrors() {
        PatientProfile profile = new PatientProfile();
        profile.setUsername("john");

        when(restTemplate.exchange(
                eq("http://appointments/api/appointments/patient/john"),
                eq(HttpMethod.GET),
                eq(null),
                any(ParameterizedTypeReference.class)
        )).thenThrow(HttpClientErrorException.create(
                HttpStatus.BAD_REQUEST,
                "bad request",
                HttpHeaders.EMPTY,
                new byte[0],
                StandardCharsets.UTF_8
        ));

        PatientRecordsService service = new PatientRecordsService(
                restTemplate,
                "http://appointments/api/appointments",
                "http://doctors/api/prescriptions"
        );

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.getPatientHistory(profile));
        assertEquals(true, exception.getMessage().startsWith("Failed to fetch appointment history"));
    }
}

package com.se73.api_gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FinalCoverageTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private HttpServletRequest request;

    private DoctorProfileProxyController doctorProfileController;
    private PrescriptionProxyController prescriptionController;
    private TelemedicineProxyController telemedicineController;
    private DoctorAvailabilityProxyController availabilityController;

    @BeforeEach
    void setUp() {
        doctorProfileController = new DoctorProfileProxyController(restTemplate, "http://doc");
        prescriptionController = new PrescriptionProxyController(restTemplate, "http://doc");
        telemedicineController = new TelemedicineProxyController(restTemplate, "http://tele");
        availabilityController = new DoctorAvailabilityProxyController(restTemplate, "http://doc");
        
        lenient().when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(new ResponseEntity<>("ok", HttpStatus.OK));
    }

    @Test
    void testDoctorProfileMethods() {
        assertEquals(HttpStatus.OK, doctorProfileController.getAllDoctorProfiles(request).getStatusCode());
        assertEquals(HttpStatus.OK, doctorProfileController.getOwnDoctorProfile(request).getStatusCode());
        assertEquals(HttpStatus.OK, doctorProfileController.getDoctorProfile(request, "doc1").getStatusCode());
        assertEquals(HttpStatus.OK, doctorProfileController.upsertOwnDoctorProfile(request, new HashMap<>()).getStatusCode());
        assertEquals(HttpStatus.OK, doctorProfileController.upsertDoctorProfile(request, "doc1", new HashMap<>()).getStatusCode());
        assertEquals(HttpStatus.OK, doctorProfileController.deleteDoctorProfile(request, "doc1").getStatusCode());
    }

    @Test
    void testPrescriptionMethods() {
        assertEquals(HttpStatus.OK, prescriptionController.createPrescription(request, new HashMap<>()).getStatusCode());
        assertEquals(HttpStatus.OK, prescriptionController.getPrescriptionById(request, "1").getStatusCode());
        assertEquals(HttpStatus.OK, prescriptionController.getPrescriptionsByPatientId(request, "1").getStatusCode());
        assertEquals(HttpStatus.OK, prescriptionController.getPrescriptionsByDoctorUsername(request, "doc1").getStatusCode());
        assertEquals(HttpStatus.OK, prescriptionController.updatePrescription(request, "1", new HashMap<>()).getStatusCode());
        assertEquals(HttpStatus.OK, prescriptionController.deletePrescription(request, "1").getStatusCode());
    }

    @Test
    void testAvailabilityMethods() {
        assertEquals(HttpStatus.OK, availabilityController.getAllAvailability(request).getStatusCode());
        assertEquals(HttpStatus.OK, availabilityController.getAvailability(request).getStatusCode());
        assertEquals(HttpStatus.OK, availabilityController.replaceAvailability(request, new HashMap<>()).getStatusCode());
        assertEquals(HttpStatus.OK, availabilityController.addAvailabilitySlot(request, new HashMap<>()).getStatusCode());
        assertEquals(HttpStatus.OK, availabilityController.deleteAvailabilitySlot(request, UUID.randomUUID()).getStatusCode());
    }

    @Test
    void testTelemedicineProxy() {
        lenient().when(request.getRequestURI()).thenReturn("/api/telemedicine/session");
        lenient().when(request.getMethod()).thenReturn("GET");
        assertEquals(HttpStatus.OK, telemedicineController.proxyRequest(request, "token", null).getStatusCode());
    }
}

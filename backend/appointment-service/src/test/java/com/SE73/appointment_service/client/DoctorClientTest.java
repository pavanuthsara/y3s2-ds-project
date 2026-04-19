package com.SE73.appointment_service.client;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DoctorClientTest {

    @Mock
    private RestTemplate restTemplate;

    private DoctorClient doctorClient;

    @BeforeEach
    void setUp() {
        doctorClient = new DoctorClient(restTemplate, "http://doctor-service/api/doctors");
    }

    @Test
    void updateSlotStatusCallsPatchEndpoint() {
        UUID slotId = UUID.randomUUID();

        doctorClient.updateSlotStatus(slotId, true);

        verify(restTemplate).patchForObject(
                "http://doctor-service/api/doctors/availability/slots/" + slotId + "/status?active=true",
                null,
                Void.class
        );
    }

    @Test
    void updateSlotStatusSwallowsRestTemplateFailures() {
        UUID slotId = UUID.randomUUID();
        doThrow(new RuntimeException("down")).when(restTemplate).patchForObject(anyString(), any(), eq(Void.class));

        doctorClient.updateSlotStatus(slotId, false);

        verify(restTemplate).patchForObject(
                "http://doctor-service/api/doctors/availability/slots/" + slotId + "/status?active=false",
                null,
                Void.class
        );
    }
}
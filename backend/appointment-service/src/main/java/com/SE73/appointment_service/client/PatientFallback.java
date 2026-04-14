package com.se73.appointment_service.client;

import com.se73.appointment_service.dto.PatientDTO;
import org.springframework.stereotype.Component;

@Component
class PatientFallback implements PatientClient {
    @Override
    public PatientDTO getPatient(Long id) {
        return new PatientDTO(id, "Mock", "Patient", "mock@example.com");
    }
}

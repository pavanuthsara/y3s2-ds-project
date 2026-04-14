package com.se73.appointment_service.client;

import com.se73.appointment_service.dto.PatientDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "patient-service", fallback = PatientFallback.class)
public interface PatientClient {
    @GetMapping("/patients/{id}")
    PatientDTO getPatient(@PathVariable Long id);
}
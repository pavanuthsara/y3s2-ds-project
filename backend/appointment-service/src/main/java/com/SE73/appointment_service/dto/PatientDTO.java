package com.se73.appointment_service.dto;

public record PatientDTO (
        Long id,
        String firstName,
        String lastname,
        String address,
        String phone,
        String dob
) {
}

package com.se73.appointment_service.dto;

public record DoctorDTO (
        Long id,
        String name,
        String specialization,
        Double consultationFee
){
}

package com.se73.doctor_service.service;

import com.se73.doctor_service.dto.PrescriptionRequest;
import com.se73.doctor_service.dto.PrescriptionResponse;

import java.util.UUID;

public interface PrescriptionService {
	PrescriptionResponse createPrescription(String doctorUsername, PrescriptionRequest request);

	PrescriptionResponse getPrescriptionById(UUID prescriptionId);
}

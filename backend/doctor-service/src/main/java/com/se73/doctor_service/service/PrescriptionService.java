package com.se73.doctor_service.service;

import com.se73.doctor_service.dto.PrescriptionRequest;
import com.se73.doctor_service.dto.PrescriptionResponse;
import com.se73.doctor_service.dto.PrescriptionUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface PrescriptionService {
	PrescriptionResponse createPrescription(String doctorUsername, PrescriptionRequest request);

	PrescriptionResponse getPrescriptionById(UUID prescriptionId);

	List<PrescriptionResponse> getPrescriptionsByPatientId(String patientId);

	List<PrescriptionResponse> getPrescriptionsByDoctorUsername(String doctorUsername);

	PrescriptionResponse updatePrescription(String doctorUsername, UUID prescriptionId, PrescriptionUpdateRequest request);

	void deletePrescription(String doctorUsername, UUID prescriptionId);
}

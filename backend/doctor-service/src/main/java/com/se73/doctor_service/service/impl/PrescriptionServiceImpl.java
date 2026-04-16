package com.se73.doctor_service.service.impl;

import com.se73.doctor_service.dto.PrescriptionRequest;
import com.se73.doctor_service.dto.PrescriptionResponse;
import com.se73.doctor_service.model.Prescription;
import com.se73.doctor_service.repository.PrescriptionRepository;
import com.se73.doctor_service.service.PrescriptionService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {
	private final PrescriptionRepository repository;

	public PrescriptionServiceImpl(PrescriptionRepository repository) {
		this.repository = repository;
	}

	@Override
	public PrescriptionResponse createPrescription(String doctorUsername, PrescriptionRequest request) {
		validateDoctorUsername(doctorUsername);
		validateRequest(request);

		Prescription prescription = new Prescription();
		prescription.setDoctorUsername(doctorUsername);
		prescription.setPatientId(request.getPatientId().trim());
		prescription.setAppointmentId(request.getAppointmentId());
		prescription.setMedication(request.getMedication().trim());
		prescription.setDosage(request.getDosage().trim());
		prescription.setInstructions(request.getInstructions().trim());
		prescription.setNotes(trimNullable(request.getNotes()));

		return toResponse(repository.save(prescription));
	}

	@Override
	public PrescriptionResponse getPrescriptionById(UUID prescriptionId) {
		if (prescriptionId == null) {
			throw new IllegalArgumentException("Prescription id is required");
		}

		Prescription prescription = repository.findById(prescriptionId)
			.orElseThrow(() -> new IllegalArgumentException("Prescription not found"));

		return toResponse(prescription);
	}

	private void validateDoctorUsername(String doctorUsername) {
		if (!StringUtils.hasText(doctorUsername)) {
			throw new IllegalArgumentException("Doctor username is required");
		}
	}

	private void validateRequest(PrescriptionRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("Prescription payload is required");
		}
	}

	private String trimNullable(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}

	private PrescriptionResponse toResponse(Prescription prescription) {
		PrescriptionResponse response = new PrescriptionResponse();
		response.setId(prescription.getId());
		response.setDoctorUsername(prescription.getDoctorUsername());
		response.setPatientId(prescription.getPatientId());
		response.setAppointmentId(prescription.getAppointmentId());
		response.setMedication(prescription.getMedication());
		response.setDosage(prescription.getDosage());
		response.setInstructions(prescription.getInstructions());
		response.setNotes(prescription.getNotes());
		response.setIssuedAt(prescription.getIssuedAt());
		return response;
	}
}

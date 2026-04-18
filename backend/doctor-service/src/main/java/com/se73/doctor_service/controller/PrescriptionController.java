package com.se73.doctor_service.controller;

import com.se73.doctor_service.dto.PrescriptionRequest;
import com.se73.doctor_service.dto.PrescriptionResponse;
import com.se73.doctor_service.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {
	private final PrescriptionService prescriptionService;

	public PrescriptionController(PrescriptionService prescriptionService) {
		this.prescriptionService = prescriptionService;
	}

	@PostMapping
	public ResponseEntity<?> createPrescription(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@Valid @RequestBody PrescriptionRequest request
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			PrescriptionResponse response = prescriptionService.createPrescription(doctorUsername, request);
			return ResponseEntity.status(HttpStatus.CREATED).body(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getPrescriptionById(@PathVariable UUID id) {
		try {
			PrescriptionResponse response = prescriptionService.getPrescriptionById(id);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			HttpStatus status = "Prescription not found".equals(e.getMessage()) ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
			return ResponseEntity.status(status).body(new ErrorResponse(e.getMessage()));
		}
	}

	@GetMapping("/patient/{patientId}")
	public ResponseEntity<?> getPrescriptionsByPatientId(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@PathVariable String patientId
	) {
		try {
			validatePrescriptionReadAccess(userId, userRole, patientId);
			return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatientId(patientId));
		} catch (IllegalArgumentException e) {
			HttpStatus status = "Missing authenticated user context".equals(e.getMessage())
				|| "Only doctors or patients can access prescriptions".equals(e.getMessage())
				|| "Patients can only access their own prescriptions".equals(e.getMessage())
				? HttpStatus.FORBIDDEN
				: HttpStatus.BAD_REQUEST;
			return ResponseEntity.status(status).body(new ErrorResponse(e.getMessage()));
		}
	}

	private String validateDoctorContext(String userId, String userRole) {
		if (!StringUtils.hasText(userId)) {
			throw new IllegalArgumentException("Missing authenticated user context");
		}

		if (!"ROLE_DOCTOR".equalsIgnoreCase(userRole)) {
			throw new IllegalArgumentException("Only doctors can issue prescriptions");
		}

		return userId;
	}

	private void validatePrescriptionReadAccess(String userId, String userRole, String patientId) {
		if (!StringUtils.hasText(userId)) {
			throw new IllegalArgumentException("Missing authenticated user context");
		}

		if ("ROLE_DOCTOR".equalsIgnoreCase(userRole)) {
			return;
		}

		if (!"ROLE_PATIENT".equalsIgnoreCase(userRole)) {
			throw new IllegalArgumentException("Only doctors or patients can access prescriptions");
		}

		if (!userId.equalsIgnoreCase(patientId)) {
			throw new IllegalArgumentException("Patients can only access their own prescriptions");
		}
	}

	private record ErrorResponse(String message) {
	}
}

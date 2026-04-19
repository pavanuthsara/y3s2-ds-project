package com.se73.doctor_service.controller;

import com.se73.doctor_service.dto.PrescriptionRequest;
import com.se73.doctor_service.dto.PrescriptionResponse;
import com.se73.doctor_service.dto.PrescriptionUpdateRequest;
import com.se73.doctor_service.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
	public ResponseEntity<?> getPrescriptionsByPatientId(@PathVariable String patientId) {
		try {
			return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatientId(patientId));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	@GetMapping("/doctor/{doctorUsername}")
	public ResponseEntity<?> getPrescriptionsByDoctorUsername(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@PathVariable String doctorUsername
	) {
		try {
			String actorDoctorUsername = validateDoctorContext(userId, userRole);
			if (!actorDoctorUsername.equalsIgnoreCase(doctorUsername)) {
				throw new IllegalArgumentException("Not allowed to access other doctor's prescriptions");
			}

			return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctorUsername(doctorUsername));
		} catch (IllegalArgumentException e) {
			HttpStatus status = "Not allowed to access other doctor's prescriptions".equals(e.getMessage())
				? HttpStatus.FORBIDDEN
				: HttpStatus.BAD_REQUEST;
			return ResponseEntity.status(status).body(new ErrorResponse(e.getMessage()));
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> updatePrescription(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@PathVariable UUID id,
		@Valid @RequestBody PrescriptionUpdateRequest request
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			PrescriptionResponse response = prescriptionService.updatePrescription(doctorUsername, id, request);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			HttpStatus status = "Prescription not found".equals(e.getMessage()) ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
			return ResponseEntity.status(status).body(new ErrorResponse(e.getMessage()));
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deletePrescription(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@PathVariable UUID id
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			prescriptionService.deletePrescription(doctorUsername, id);
			return ResponseEntity.noContent().build();
		} catch (IllegalArgumentException e) {
			HttpStatus status = "Prescription not found".equals(e.getMessage()) ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
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

	private record ErrorResponse(String message) {
	}
}

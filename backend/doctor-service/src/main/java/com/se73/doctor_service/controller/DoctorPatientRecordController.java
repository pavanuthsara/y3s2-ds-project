package com.se73.doctor_service.controller;

import com.se73.doctor_service.dto.PatientMedicalReportResponse;
import com.se73.doctor_service.service.DoctorPatientRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorPatientRecordController {
	private final DoctorPatientRecordService patientRecordService;

	public DoctorPatientRecordController(DoctorPatientRecordService patientRecordService) {
		this.patientRecordService = patientRecordService;
	}

	@GetMapping("/{doctorUsername}/patients/{patientId}/reports")
	public ResponseEntity<?> getPatientReports(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@PathVariable String doctorUsername,
		@PathVariable String patientId
	) {
		try {
			validateDoctorAccess(userId, userRole, doctorUsername);
			List<PatientMedicalReportResponse> response = patientRecordService.getPatientReports(doctorUsername, patientId);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	private void validateDoctorAccess(String userId, String userRole, String doctorUsername) {
		if (!StringUtils.hasText(userId)) {
			throw new IllegalArgumentException("Missing authenticated user context");
		}

		if (!"ROLE_DOCTOR".equalsIgnoreCase(userRole)) {
			throw new IllegalArgumentException("Only doctors can access patient reports");
		}

		if (!userId.equalsIgnoreCase(doctorUsername)) {
			throw new IllegalArgumentException("Not allowed to access other doctor's patient reports");
		}
	}

	private record ErrorResponse(String message) {
	}
}

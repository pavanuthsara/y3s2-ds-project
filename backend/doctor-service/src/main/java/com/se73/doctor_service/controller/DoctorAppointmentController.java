package com.se73.doctor_service.controller;

import com.se73.doctor_service.dto.AppointmentActionResponse;
import com.se73.doctor_service.dto.DoctorAppointmentResponse;
import com.se73.doctor_service.service.DoctorAppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class DoctorAppointmentController {
	private final DoctorAppointmentService appointmentService;

	public DoctorAppointmentController(DoctorAppointmentService appointmentService) {
		this.appointmentService = appointmentService;
	}

	@GetMapping("/doctors/{doctorUsername}/appointments")
	public ResponseEntity<?> getDoctorAppointments(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@PathVariable String doctorUsername
	) {
		try {
			validateDoctorAccess(userId, userRole, doctorUsername);
			List<DoctorAppointmentResponse> response = appointmentService.getDoctorAppointments(doctorUsername);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
		}
	}

	@PutMapping("/appointments/{appointmentId}/accept")
	public ResponseEntity<?> acceptAppointment(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@PathVariable UUID appointmentId
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			AppointmentActionResponse response = appointmentService.acceptAppointment(doctorUsername, appointmentId);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	@PutMapping("/appointments/{appointmentId}/reject")
	public ResponseEntity<?> rejectAppointment(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@PathVariable UUID appointmentId
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			AppointmentActionResponse response = appointmentService.rejectAppointment(doctorUsername, appointmentId);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	private String validateDoctorContext(String userId, String userRole) {
		if (!StringUtils.hasText(userId)) {
			throw new IllegalArgumentException("Missing authenticated user context");
		}

		if (!"ROLE_DOCTOR".equalsIgnoreCase(userRole)) {
			throw new IllegalArgumentException("Only doctors can manage appointments");
		}

		return userId;
	}

	private void validateDoctorAccess(String userId, String userRole, String doctorUsername) {
		String actorDoctorUsername = validateDoctorContext(userId, userRole);
		if (!actorDoctorUsername.equalsIgnoreCase(doctorUsername)) {
			throw new IllegalArgumentException("Not allowed to access other doctor's appointments");
		}
	}

	private record ErrorResponse(String message) {
	}
}

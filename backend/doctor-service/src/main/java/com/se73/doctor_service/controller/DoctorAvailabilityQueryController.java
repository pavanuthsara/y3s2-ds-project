package com.se73.doctor_service.controller;

import com.se73.doctor_service.dto.AvailabilitySlotResponse;
import com.se73.doctor_service.model.DoctorAvailabilitySlot;
import com.se73.doctor_service.service.DoctorAvailabilityService;
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
public class DoctorAvailabilityQueryController {

	private final DoctorAvailabilityService availabilityService;

	public DoctorAvailabilityQueryController(DoctorAvailabilityService availabilityService) {
		this.availabilityService = availabilityService;
	}

	@GetMapping("/{doctorUsername}/availability")
	public ResponseEntity<?> getDoctorAvailabilityByDoctorUsername(
		@RequestHeader(value = "X-User-Id", required = false) String userId,
		@RequestHeader(value = "X-User-Role", required = false) String userRole,
		@PathVariable String doctorUsername
	) {
		try {
			AccessScope scope = resolveAccessScope(userId, userRole, doctorUsername);
			List<AvailabilitySlotResponse> response = availabilityService.getAvailability(doctorUsername)
				.stream()
				.filter(slot -> scope == AccessScope.FULL || slot.isActive())
				.map(this::toResponse)
				.toList();
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
		}
	}

	private AccessScope resolveAccessScope(String userId, String userRole, String doctorUsername) {
		if (!StringUtils.hasText(userId) || !StringUtils.hasText(userRole)) {
			throw new IllegalArgumentException("Missing authenticated user context");
		}

		if (!StringUtils.hasText(doctorUsername)) {
			throw new IllegalArgumentException("Doctor username is required");
		}

		if ("ROLE_PATIENT".equalsIgnoreCase(userRole) || "ROLE_ADMIN".equalsIgnoreCase(userRole)) {
			return AccessScope.ACTIVE_ONLY;
		}

		if ("ROLE_DOCTOR".equalsIgnoreCase(userRole)) {
			if (userId.equalsIgnoreCase(doctorUsername)) {
				return AccessScope.FULL;
			}
			return AccessScope.ACTIVE_ONLY;
		}

		throw new IllegalArgumentException("Not allowed to view doctor availability");
	}

	private AvailabilitySlotResponse toResponse(DoctorAvailabilitySlot slot) {
		return new AvailabilitySlotResponse(
			slot.getId(),
			slot.getDayOfWeek(),
			slot.getStartTime(),
			slot.getEndTime(),
			slot.isActive()
		);
	}

	private enum AccessScope {
		FULL,
		ACTIVE_ONLY
	}

	private record ErrorResponse(String message) {
	}
}

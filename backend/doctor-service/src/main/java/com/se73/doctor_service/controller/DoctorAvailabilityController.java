package com.se73.doctor_service.controller;

import com.se73.doctor_service.dto.AvailabilitySlotRequest;
import com.se73.doctor_service.dto.AvailabilitySlotResponse;
import com.se73.doctor_service.dto.SetDoctorAvailabilityRequest;
import com.se73.doctor_service.model.DoctorAvailabilitySlot;
import com.se73.doctor_service.service.DoctorAvailabilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors/availability")
public class DoctorAvailabilityController {

	private final DoctorAvailabilityService availabilityService;

	public DoctorAvailabilityController(DoctorAvailabilityService availabilityService) {
		this.availabilityService = availabilityService;
	}

	@GetMapping
	public ResponseEntity<?> getDoctorAvailability(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestHeader(value = "X-User-Role", required = false) String userRole
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			List<AvailabilitySlotResponse> response = availabilityService.getAvailability(doctorUsername)
					.stream()
					.map(this::toResponse)
					.toList();
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
		}
	}

	@PutMapping
	public ResponseEntity<?> replaceDoctorAvailability(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestHeader(value = "X-User-Role", required = false) String userRole,
			@Valid @RequestBody SetDoctorAvailabilityRequest request
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			List<AvailabilitySlotResponse> response = availabilityService.replaceAvailability(doctorUsername, request.getSlots())
					.stream()
					.map(this::toResponse)
					.toList();
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	@PostMapping("/slots")
	public ResponseEntity<?> addSlot(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestHeader(value = "X-User-Role", required = false) String userRole,
			@Valid @RequestBody AvailabilitySlotRequest request
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			AvailabilitySlotResponse response = toResponse(availabilityService.addSlot(doctorUsername, request));
			return ResponseEntity.status(HttpStatus.CREATED).body(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	@DeleteMapping("/slots/{slotId}")
	public ResponseEntity<?> deleteSlot(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestHeader(value = "X-User-Role", required = false) String userRole,
			@PathVariable UUID slotId
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			availabilityService.deleteSlot(doctorUsername, slotId);
			return ResponseEntity.noContent().build();
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	private String validateDoctorContext(String userId, String userRole) {
		if (!StringUtils.hasText(userId)) {
			throw new IllegalArgumentException("Missing authenticated user context");
		}

		if (!"ROLE_DOCTOR".equalsIgnoreCase(userRole)) {
			throw new IllegalArgumentException("Only doctors can manage availability");
		}

		return userId;
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

	private record ErrorResponse(String message) {
	}
}
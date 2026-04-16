package com.se73.doctor_service.controller;

import com.se73.doctor_service.dto.DoctorProfileRequest;
import com.se73.doctor_service.dto.DoctorProfileResponse;
import com.se73.doctor_service.model.DoctorProfile;
import com.se73.doctor_service.service.DoctorProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorProfileController {

	private final DoctorProfileService profileService;

	public DoctorProfileController(DoctorProfileService profileService) {
		this.profileService = profileService;
	}

	@GetMapping
	public ResponseEntity<List<DoctorProfileResponse>> getAllDoctorProfiles() {
		List<DoctorProfileResponse> response = profileService.getAllProfiles()
				.stream()
				.map(this::toResponse)
				.toList();
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{doctorUsername}/profile")
	public ResponseEntity<?> getDoctorProfile(@PathVariable String doctorUsername) {
		try {
			DoctorProfile profile = profileService.getProfile(doctorUsername);
			return ResponseEntity.ok(toResponse(profile));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
		}
	}

	@GetMapping("/profile")
	public ResponseEntity<?> getOwnDoctorProfile(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestHeader(value = "X-User-Role", required = false) String userRole
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			DoctorProfile profile = profileService.getProfile(doctorUsername);
			return ResponseEntity.ok(toResponse(profile));
		} catch (IllegalArgumentException e) {
			HttpStatus status = "Doctor profile not found".equals(e.getMessage()) ? HttpStatus.NOT_FOUND : HttpStatus.FORBIDDEN;
			return ResponseEntity.status(status).body(new ErrorResponse(e.getMessage()));
		}
	}

	@PutMapping("/{doctorUsername}/profile")
	public ResponseEntity<?> upsertDoctorProfile(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestHeader(value = "X-User-Role", required = false) String userRole,
			@PathVariable String doctorUsername,
			@Valid @RequestBody DoctorProfileRequest request
	) {
		try {
			DoctorProfile profile = profileService.upsertProfile(userId, userRole, doctorUsername, request);
			return ResponseEntity.ok(toResponse(profile));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	@PutMapping("/profile")
	public ResponseEntity<?> upsertOwnDoctorProfile(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestHeader(value = "X-User-Role", required = false) String userRole,
			@Valid @RequestBody DoctorProfileRequest request
	) {
		try {
			String doctorUsername = validateDoctorContext(userId, userRole);
			DoctorProfile profile = profileService.upsertProfile(userId, userRole, doctorUsername, request);
			return ResponseEntity.ok(toResponse(profile));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
		}
	}

	@DeleteMapping("/{doctorUsername}")
	public ResponseEntity<?> deleteDoctorProfile(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestHeader(value = "X-User-Role", required = false) String userRole,
			@PathVariable String doctorUsername
	) {
		try {
			profileService.deleteProfile(userId, userRole, doctorUsername);
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
			throw new IllegalArgumentException("Only doctors can manage their own profile");
		}

		return userId;
	}

	private DoctorProfileResponse toResponse(DoctorProfile profile) {
		DoctorProfileResponse response = new DoctorProfileResponse();
		response.setDoctorUsername(profile.getDoctorUsername());
		response.setFirstName(profile.getFirstName());
		response.setLastName(profile.getLastName());
		response.setSpecialty(profile.getSpecialty());
		response.setQualifications(profile.getQualifications());
		response.setBio(profile.getBio());
		response.setPhoneNumber(profile.getPhoneNumber());
		response.setProfilePhoto(profile.getProfilePhoto());
		response.setConsultationFee(profile.getConsultationFee());
		response.setVerified(profile.isVerified());
		response.setRating(profile.getRating());
		response.setCreatedAt(profile.getCreatedAt());
		response.setUpdatedAt(profile.getUpdatedAt());
		return response;
	}

	private record ErrorResponse(String message) {
	}
}

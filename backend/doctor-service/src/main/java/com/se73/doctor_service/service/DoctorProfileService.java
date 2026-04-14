package com.se73.doctor_service.service;

import com.se73.doctor_service.dto.DoctorProfileRequest;
import com.se73.doctor_service.model.DoctorProfile;
import com.se73.doctor_service.repository.DoctorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DoctorProfileService {
	private final DoctorProfileRepository repository;

	public DoctorProfileService(DoctorProfileRepository repository) {
		this.repository = repository;
	}

	public List<DoctorProfile> getAllProfiles() {
		return repository.findAllByOrderBySpecialtyAscLastNameAscFirstNameAsc();
	}

	public DoctorProfile getProfile(String doctorUsername) {
		validateUsername(doctorUsername);
		return repository.findById(doctorUsername)
				.orElseThrow(() -> new IllegalArgumentException("Doctor profile not found"));
	}

	public DoctorProfile upsertProfile(String actorUsername, String actorRole, String targetDoctorUsername, DoctorProfileRequest request) {
		validateUsername(targetDoctorUsername);
		validateRequest(request);
		validateProfileWriteAccess(actorUsername, actorRole, targetDoctorUsername);

		DoctorProfile profile = repository.findById(targetDoctorUsername)
				.orElseGet(() -> {
					DoctorProfile fresh = new DoctorProfile();
					fresh.setDoctorUsername(targetDoctorUsername);
					fresh.setRating(BigDecimal.ZERO);
					fresh.setVerified(false);
					return fresh;
				});

		profile.setFirstName(request.getFirstName().trim());
		profile.setLastName(request.getLastName().trim());
		profile.setSpecialty(request.getSpecialty().trim());
		profile.setQualifications(trimNullable(request.getQualifications()));
		profile.setBio(trimNullable(request.getBio()));
		profile.setPhoneNumber(trimNullable(request.getPhoneNumber()));
		profile.setProfilePhoto(trimNullable(request.getProfilePhoto()));
		profile.setConsultationFee(request.getConsultationFee());

		return repository.save(profile);
	}

	public void deleteProfile(String actorUsername, String actorRole, String targetDoctorUsername) {
		validateUsername(targetDoctorUsername);
		validateProfileWriteAccess(actorUsername, actorRole, targetDoctorUsername);
		DoctorProfile profile = repository.findById(targetDoctorUsername)
				.orElseThrow(() -> new IllegalArgumentException("Doctor profile not found"));
		repository.delete(profile);
	}

	private void validateProfileWriteAccess(String actorUsername, String actorRole, String targetDoctorUsername) {
		if (!StringUtils.hasText(actorUsername)) {
			throw new IllegalArgumentException("Missing authenticated user context");
		}

		if (!StringUtils.hasText(actorRole)) {
			throw new IllegalArgumentException("Missing authenticated user role");
		}

		boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(actorRole);
		boolean isDoctor = "ROLE_DOCTOR".equalsIgnoreCase(actorRole);

		if (isAdmin) {
			return;
		}

		if (isDoctor && actorUsername.equalsIgnoreCase(targetDoctorUsername)) {
			return;
		}

		throw new IllegalArgumentException("Not allowed to modify this doctor profile");
	}

	private void validateRequest(DoctorProfileRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("Doctor profile payload is required");
		}
	}

	private void validateUsername(String username) {
		if (!StringUtils.hasText(username)) {
			throw new IllegalArgumentException("Doctor username is required");
		}
	}

	private String trimNullable(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}
}

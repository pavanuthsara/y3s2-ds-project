package com.se73.doctor_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class DoctorProfileRequest {
	@NotBlank(message = "First name is required")
	@Size(max = 100, message = "First name cannot exceed 100 characters")
	private String firstName;

	@NotBlank(message = "Last name is required")
	@Size(max = 100, message = "Last name cannot exceed 100 characters")
	private String lastName;

	@NotBlank(message = "Specialty is required")
	@Size(max = 100, message = "Specialty cannot exceed 100 characters")
	private String specialty;

	@Size(max = 2000, message = "Qualifications cannot exceed 2000 characters")
	private String qualifications;

	@Size(max = 4000, message = "Bio cannot exceed 4000 characters")
	private String bio;

	@Size(max = 20, message = "Phone number cannot exceed 20 characters")
	private String phoneNumber;

	@Size(max = 500, message = "Profile photo URL cannot exceed 500 characters")
	private String profilePhoto;

	@DecimalMin(value = "0.0", inclusive = true, message = "Consultation fee cannot be negative")
	private BigDecimal consultationFee;

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getSpecialty() {
		return specialty;
	}

	public void setSpecialty(String specialty) {
		this.specialty = specialty;
	}

	public String getQualifications() {
		return qualifications;
	}

	public void setQualifications(String qualifications) {
		this.qualifications = qualifications;
	}

	public String getBio() {
		return bio;
	}

	public void setBio(String bio) {
		this.bio = bio;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getProfilePhoto() {
		return profilePhoto;
	}

	public void setProfilePhoto(String profilePhoto) {
		this.profilePhoto = profilePhoto;
	}

	public BigDecimal getConsultationFee() {
		return consultationFee;
	}

	public void setConsultationFee(BigDecimal consultationFee) {
		this.consultationFee = consultationFee;
	}
}

package com.se73.doctor_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DoctorAppointmentResponse {
	private UUID appointmentId;
	private String doctorUsername;
	private String patientId;
	private LocalDateTime appointmentDateTime;
	private String status;

	public UUID getAppointmentId() {
		return appointmentId;
	}

	public void setAppointmentId(UUID appointmentId) {
		this.appointmentId = appointmentId;
	}

	public String getDoctorUsername() {
		return doctorUsername;
	}

	public void setDoctorUsername(String doctorUsername) {
		this.doctorUsername = doctorUsername;
	}

	public String getPatientId() {
		return patientId;
	}

	public void setPatientId(String patientId) {
		this.patientId = patientId;
	}

	public LocalDateTime getAppointmentDateTime() {
		return appointmentDateTime;
	}

	public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
		this.appointmentDateTime = appointmentDateTime;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}

package com.se73.doctor_service.dto;

import java.util.UUID;

public class AppointmentActionResponse {
	private UUID appointmentId;
	private String doctorUsername;
	private String status;
	private String message;

	public AppointmentActionResponse() {
	}

	public AppointmentActionResponse(UUID appointmentId, String doctorUsername, String status, String message) {
		this.appointmentId = appointmentId;
		this.doctorUsername = doctorUsername;
		this.status = status;
		this.message = message;
	}

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

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}

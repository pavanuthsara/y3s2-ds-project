package com.se73.doctor_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class PatientMedicalReportResponse {
	private UUID reportId;
	private String patientId;
	private String reportType;
	private String fileUrl;
	private String summary;
	private LocalDateTime uploadedAt;

	public UUID getReportId() {
		return reportId;
	}

	public void setReportId(UUID reportId) {
		this.reportId = reportId;
	}

	public String getPatientId() {
		return patientId;
	}

	public void setPatientId(String patientId) {
		this.patientId = patientId;
	}

	public String getReportType() {
		return reportType;
	}

	public void setReportType(String reportType) {
		this.reportType = reportType;
	}

	public String getFileUrl() {
		return fileUrl;
	}

	public void setFileUrl(String fileUrl) {
		this.fileUrl = fileUrl;
	}

	public String getSummary() {
		return summary;
	}

	public void setSummary(String summary) {
		this.summary = summary;
	}

	public LocalDateTime getUploadedAt() {
		return uploadedAt;
	}

	public void setUploadedAt(LocalDateTime uploadedAt) {
		this.uploadedAt = uploadedAt;
	}
}
